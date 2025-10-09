#!/bin/bash

# ================================================================
# 🚀 UNIVERSAL SMS AUTHENTICATION SYSTEM INSTALLER (FULL)
# Works with any Netlify project - fully portable!
# Author: You + ChatGPT merge
# Version: 3.1  (with E.164 normalization + Tools Hub + Diagnostics + Test Modal)
# ================================================================

set +e  # continue on errors so we can finish writing files and show guidance

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; PURPLE='\033[0;35m'; CYAN='\033[0;36m'; NC='\033[0m'
# Emojis
CHECK="✅"; CROSS="❌"; ROCKET="🚀"; GEAR="⚙️"; FIRE="🔥"

clear
echo -e "${PURPLE}"
echo "════════════════════════════════════════════════════════════════════"
echo "  🎉 UNIVERSAL SMS AUTHENTICATION SYSTEM INSTALLER 🎉"
echo "════════════════════════════════════════════════════════════════════"
echo -e "${NC}\n"
echo -e "${CYAN}This script installs a complete SMS auth stack:${NC}"
echo "  • Twilio Verify (send + verify code)"
echo "  • Supabase users table (admin auto-flag)"
echo "  • Netlify Functions (serverless API)"
echo "  • E.164 phone normalization (+1 default)"
echo "  • Test modal UI & Diagnostics dashboard & Tools Hub"
echo ""

# ================================================================
# CONFIGURATION - ADMIN PHONES
# ================================================================
echo -e "${YELLOW}${GEAR} Let's configure your admin phones...${NC}\n"
echo -e "${CYAN}Enter admin phone numbers (comma-separated, E.164 or any format; will be normalized):${NC}"
read -p "Admin phones: " ADMIN_PHONES_INPUT
IFS=',' read -ra ADMIN_PHONES_ARRAY_RAW <<< "$ADMIN_PHONES_INPUT"

# Normalize to E.164 (+1 default) inside bash for the injected array
normalize_phone() {
  local input="$1"; local cc="+1"
  # strip everything except digits and +
  local p=$(echo "$input" | tr -d ' ' | sed 's/[^0-9+]//g')
  if [[ "$p" == +* ]]; then echo "$p"; return 0; fi
  if [[ ${#p} -eq 11 && "${p:0:1}" == "1" ]]; then echo "+$p"; return 0; fi
  if [[ ${#p} -eq 10 ]]; then echo "${cc}${p}"; return 0; fi
  # fallback: just return as-is
  echo "$p"
}

ADMIN_PHONES_JS="["
for i in "${!ADMIN_PHONES_ARRAY_RAW[@]}"; do
    raw=$(echo "${ADMIN_PHONES_ARRAY_RAW[$i]}" | xargs)
    norm=$(normalize_phone "$raw")
    if [ $i -eq 0 ]; then
        ADMIN_PHONES_JS+="'$norm'"
    else
        ADMIN_PHONES_JS+=", '$norm'"
    fi
done
ADMIN_PHONES_JS+="]"

echo -e "\n${GREEN}${CHECK} Admin phones will be stored as: $ADMIN_PHONES_JS${NC}\n"

# ================================================================
# STEP 1: Pre-flight checks
# ================================================================
echo -e "${CYAN}${GEAR} STEP 1: Pre-flight checks${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}${CROSS} Node.js not found. Install Node.js first.${NC}"; exit 1
fi
echo -e "${GREEN}${CHECK} Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}${CROSS} npm not found. Install npm first.${NC}"; exit 1
fi
echo -e "${GREEN}${CHECK} npm $(npm --version)${NC}"

if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
fi
echo -e "${GREEN}${CHECK} Netlify CLI $(netlify --version)${NC}"

# Create directories
mkdir -p netlify/functions
mkdir -p css
mkdir -p js
echo -e "${GREEN}${CHECK} Project directories created${NC}"

# ================================================================
# STEP 2: Install function dependencies
# ================================================================
echo -e "\n${CYAN}${GEAR} STEP 2: Installing function dependencies${NC}"

cat > netlify/functions/package.json << 'EOF'
{
  "name": "sms-auth-functions",
  "version": "1.0.0",
  "description": "SMS authentication serverless functions",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "twilio": "^4.20.0",
    "stripe": "^14.10.0"
  }
}
EOF

pushd netlify/functions >/dev/null
npm install
popd >/dev/null
echo -e "${GREEN}${CHECK} Dependencies installed${NC}"

# ================================================================
# STEP 3: Netlify Functions (send, verify, create-user, health, diagnostics)
# ================================================================
echo -e "\n${CYAN}${GEAR} STEP 3: Creating Netlify Functions${NC}"

# send-sms.js (with normalization)
cat > netlify/functions/send-sms.js << 'EOF'
const twilio = require('twilio');

function normalizePhone(input, fallback = '+1') {
  if (!input) return null;
  let p = String(input).trim().replace(/[^\d+]/g, '');
  const cc = process.env.DEFAULT_COUNTRY_CODE || fallback;
  if (p.startsWith('+')) return p;
  if (p.length === 11 && p.startsWith('1')) return '+' + p;
  if (p.length === 10) return cc + p;
  return null;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { phone } = JSON.parse(event.body || '{}');
    const normalized = normalizePhone(phone);
    if (!normalized) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid phone number' }) };

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: normalized, channel: 'sms' });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, status: verification.status, to: verification.to }) };
  } catch (error) {
    console.error('Send SMS error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to send SMS', details: error.message }) };
  }
};
EOF
echo -e "${GREEN}${CHECK} send-sms.js created${NC}"

# verify-sms.js (with normalization)
cat > netlify/functions/verify-sms.js << 'EOF'
const twilio = require('twilio');

function normalizePhone(input, fallback = '+1') {
  if (!input) return null;
  let p = String(input).trim().replace(/[^\d+]/g, '');
  const cc = process.env.DEFAULT_COUNTRY_CODE || fallback;
  if (p.startsWith('+')) return p;
  if (p.length === 11 && p.startsWith('1')) return '+' + p;
  if (p.length === 10) return cc + p;
  return null;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { phone, code } = JSON.parse(event.body || '{}');
    const normalized = normalizePhone(phone);
    if (!normalized || !code) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone and code required' }) };

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: normalized, code });

    if (verification_check.status === 'approved') {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, status: 'approved', phone: normalized }) };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid verification code', status: verification_check.status }) };
  } catch (error) {
    console.error('Verify SMS error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Verification failed', details: error.message }) };
  }
};
EOF
echo -e "${GREEN}${CHECK} verify-sms.js created${NC}"

# create-user.js (with normalization + injected admin list)
cat > netlify/functions/create-user.js << EOF
const { createClient } = require('@supabase/supabase-js');

function normalizePhone(input, fallback = '+1') {
  if (!input) return null;
  let p = String(input).trim().replace(/[^\\d+]/g, '');
  const cc = process.env.DEFAULT_COUNTRY_CODE || fallback;
  if (p.startsWith('+')) return p;
  if (p.length === 11 && p.startsWith('1')) return '+' + p;
  if (p.length === 10) return cc + p;
  return null;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { phone, displayName } = JSON.parse(event.body || '{}');
    const normalized = normalizePhone(phone);
    if (!normalized) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone number required' }) };

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // Admin numbers injected by installer (already normalized)
    const ADMIN_PHONES = $ADMIN_PHONES_JS;
    const isAdmin = ADMIN_PHONES.includes(normalized);

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalized)
      .single();

    let userData;

    if (existing) {
      const { data, error } = await supabase
        .from('users')
        .update({
          is_admin: isAdmin,
          name: displayName || existing.name,
          last_login: new Date().toISOString()
        })
        .eq('phone', normalized)
        .select()
        .single();
      if (error) throw error;
      userData = data;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert({
          phone: normalized,
          is_admin: isAdmin,
          is_promoter: false,
          name: displayName || \`User \${normalized.slice(-4)}\`,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      userData = data;
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: userData, isAdmin: userData.is_admin || false }) };
  } catch (error) {
    console.error('Create user error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create/update user', details: error.message }) };
  }
};
EOF
echo -e "${GREEN}${CHECK} create-user.js created${NC}"

# health.js
cat > netlify/functions/health.js << 'EOF'
exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        twilio: !!process.env.TWILIO_ACCOUNT_SID,
        supabase: !!process.env.SUPABASE_URL,
        stripe: !!process.env.STRIPE_SECRET_KEY
      },
      version: '1.0.0',
      defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '+1'
    })
  };
};
EOF
echo -e "${GREEN}${CHECK} health.js created${NC}"

# diagnostics.js (with normalization)
cat > netlify/functions/diagnostics.js << 'EOF'
const twilio = require('twilio');
# ================================================================
# STEP 13: Auto-run Local Test & Show Diagnostics (no matter what)
# ================================================================
echo -e "\n${CYAN}${GEAR} STEP 13: Launching local test & diagnostics${NC}"

# 13a) Ensure minimal Netlify config exists
if [ ! -f "netlify.toml" ]; then
  cat > netlify.toml <<'EOF'
[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
EOF
  echo -e "${GREEN}${CHECK} netlify.toml created${NC}"
else
  echo -e "${GREEN}${CHECK} netlify.toml already present${NC}"
fi

# 13b) Start Netlify dev in background (port 8888)
PORT=8888

# portable port check (nc or lsof)
PORT_BUSY=0
if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$PORT" >/dev/null 2>&1; then PORT_BUSY=1; fi
elif command -v lsof >/dev/null 2>&1; then
  if lsof -i :"$PORT" >/dev/null 2>&1; then PORT_BUSY=1; fi
fi

if [ "$PORT_BUSY" -eq 1 ]; then
  echo -e "${YELLOW}⚠️  Port ${PORT} already in use. Assuming Netlify dev is running.${NC}"
else
  echo -e "${CYAN}Starting Netlify dev on http://localhost:${PORT} ...${NC}"
  (nohup netlify dev --port "$PORT" > .netlify-dev.log 2>&1 &) >/dev/null 2>&1

  # wait for functions to become available (max ~30s)
  i=0
  until curl -s "http://localhost:${PORT}/.netlify/functions/health" >/dev/null 2>&1 || [ $i -ge 60 ]; do
    i=$((i+1))
    sleep 0.5
  done
fi

BASE_URL="http://localhost:${PORT}"

# 13c) Run diagnostics and print JSON to terminal (fallback if browser can't open)
echo -e "${CYAN}Running server-side diagnostics now...${NC}"
DIAG_JSON="$(curl -s -X POST "${BASE_URL}/.netlify/functions/diagnostics" || true)"
if command -v jq >/dev/null 2>&1; then
  echo "$DIAG_JSON" | jq . || echo "$DIAG_JSON"
else
  echo "$DIAG_JSON"
fi

# 13d) Try to open diagnostics dashboard in default browser
open_url () {
  if command -v open >/dev/null 2>&1; then
    open "$1"            # macOS
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$1"        # Linux
  elif command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /c start "$1"  # Git Bash / Windows
  else
    echo -e "${YELLOW}⚠️  Could not auto-open browser. Visit: $1${NC}"
  fi
}

echo -e "${GREEN}${CHECK} Opening diagnostics dashboard...${NC}"
open_url "${BASE_URL}/sms-diagnostics.html"

echo -e "${GREEN}${CHECK} Also available: Tools Hub (buttons)${NC}"
echo "  → ${BASE_URL}/sms-tools.html"
echo -e "${GREEN}${CHECK} Quick modal test page${NC}"
echo "  → ${BASE_URL}/test-sms.html"

echo -e "\n${PURPLE}🔎 If anything is red above, fix the items, then refresh the diagnostics page or rerun this installer.${NC}"
echo -e "${CYAN}To stop Netlify dev later:${NC}  pkill -f 'netlify dev'"
