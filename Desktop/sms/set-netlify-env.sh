#!/bin/bash
set -euo pipefail

# Sync environment variables from a local file into Netlify site env vars.
# Usage:
#   1) cp .env.sms.example .env.sms && edit values
#   2) ./set-netlify-env.sh           # interactive site selection
#   or: NETLIFY_SITE_ID=... ./set-netlify-env.sh

if ! command -v netlify >/dev/null 2>&1; then
  echo "Installing Netlify CLI..."
  npm install -g netlify-cli
fi

ENV_FILE=".env.sms"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Copy .env.sms.example to $ENV_FILE and fill in values."
  exit 1
fi

# Ensure we are logged in
if ! netlify status >/dev/null 2>&1; then
  netlify login
fi

TARGET_SITE_ID="${NETLIFY_SITE_ID:-}"

# If a site ID is provided, link this workspace to that site to scope subsequent commands
if [ -n "$TARGET_SITE_ID" ]; then
  echo "🔗 Linking to Netlify site: $TARGET_SITE_ID"
  netlify link --id "$TARGET_SITE_ID"
else
  echo "🔗 No NETLIFY_SITE_ID provided; using existing link or interactive init if missing"
  if [ ! -d ".netlify" ] || [ ! -f ".netlify/state.json" ]; then
    netlify init
  fi
fi

# Read key=value lines (skip comments/blank)
while IFS='=' read -r key val; do
  # trim
  k="${key%%[[:space:]]*}"; k="${k##[[:space:]]}"
  v="${val%%[[:space:]]*}"; v="${v##[[:space:]]}"
  # skip invalid/empty/comment
  if [[ -z "$k" || "$k" =~ ^# ]]; then continue; fi
  if [[ -z "$v" ]]; then echo "Skipping $k (empty)"; continue; fi
  echo "Setting $k"
  netlify env:set "$k" "$v"

  # For secrets, don't echo values
  if [[ "$k" == TWILIO_AUTH_TOKEN || "$k" == JWT_SECRET || "$k" == ADMIN_KEY ]]; then
    echo "- $k set (secret)"
  fi

done < <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | sed 's/\r$//')

# Show summary
echo "\nCurrent env vars:" 
netlify env:list

echo "\n✅ Netlify env vars updated. Triggering a production deploy..."
netlify deploy --prod --dir=.
