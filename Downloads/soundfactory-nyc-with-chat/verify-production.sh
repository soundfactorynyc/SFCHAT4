#!/usr/bin/env bash
set -euo pipefail

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m'

DOMAIN="${DOMAIN_OVERRIDE:-soundfactorynyc.com}" # allow override
BASE_URL="https://$DOMAIN"

REQUIRED_VARS=(SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY STRIPE_SECRET_KEY TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN SMS_PEPPER)

echo -e "${YELLOW}==> Environment Variable Checks${NC}"
MISSING=0
for v in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo -e "${RED}Missing:${NC} $v"; MISSING=1
  else
    echo -e "${GREEN}Present:${NC} $v"
  fi
done
if [[ $MISSING -eq 1 ]]; then
  echo -e "${RED}Some required env vars are missing. Proceeding but mark this FAIL.${NC}"
fi

echo -e "\n${YELLOW}==> DNS / Reachability${NC}"
if curl -s -I "$BASE_URL" >/dev/null; then
  echo -e "${GREEN}Reachable:${NC} $BASE_URL"
else
  echo -e "${RED}Unreachable:${NC} $BASE_URL"; fi

ENDPOINTS=("/" "/.netlify/functions/send-sms" "/.netlify/functions/verify-sms" "/.netlify/functions/stripe-webhook")

echo -e "\n${YELLOW}==> Endpoint Health (HEAD/GET)${NC}"
for ep in "${ENDPOINTS[@]}"; do
  URL="$BASE_URL$ep"
  # For functions that expect POST we still just check 405 vs 200/4xx
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL") || CODE=000
  if [[ "$CODE" =~ ^2|3[0-9]{1}$ ]]; then
    echo -e "${GREEN}$CODE${NC} $ep"
  else
    echo -e "${RED}$CODE${NC} $ep"
  fi
done

echo -e "\n${YELLOW}==> Security Headers (sample)${NC}"
curl -s -D - "$BASE_URL" -o /dev/null | grep -Ei 'content-security-policy|strict-transport-security|x-frame-options|x-content-type-options' || echo "No common security headers detected (check netlify.toml)"

echo -e "\n${YELLOW}==> Supabase Anon Ping${NC}"
if [[ -n "${SUPABASE_URL:-}" ]]; then
  RPC_URL="${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_ANON_KEY:-}"
  if curl -s -I "$RPC_URL" >/dev/null; then
    echo -e "${GREEN}Supabase reachable${NC}"
  else
    echo -e "${RED}Supabase unreachable${NC}"; fi
else
  echo "Supabase env not set locally; skipped"
fi

echo -e "\n${YELLOW}==> Summary${NC}"
if [[ $MISSING -eq 1 ]]; then
  echo -e "${RED}FAIL:${NC} Missing env vars"
else
  echo -e "${GREEN}PASS:${NC} Env variable presence check"
fi

echo "Verification script complete."