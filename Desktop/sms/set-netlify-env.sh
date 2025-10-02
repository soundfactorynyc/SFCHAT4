#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Syncing selected environment variables to the linked Netlify site..."

if ! command -v netlify >/dev/null 2>&1; then
	echo "📦 Installing Netlify CLI..."
	npm install -g netlify-cli
fi

if [ ! -f .env ]; then
	echo "❌ .env not found in $(pwd). Aborting."
	exit 1
fi

# Helper to read a key's value from .env without exporting invalid identifiers
read_env() {
	local key="$1"
	# Grep exact key= pattern, take last match, strip leading/trailing whitespace
	local line
	line=$(grep -E "^${key}=" .env | tail -n 1 || true)
	if [ -z "$line" ]; then echo ""; return; fi
	echo "$line" | sed -E "s/^${key}=//"
}

site_json=$(netlify status --json 2>/dev/null || true)
site_name=$(echo "$site_json" | sed -n 's/.*"site-name" *: *"\([^"]*\)".*/\1/p' | tr -d '\n')
site_url=$(echo "$site_json" | sed -n 's/.*"site-url" *: *"\([^"]*\)".*/\1/p' | tr -d '\n')
if [ -z "$site_name" ]; then
	echo "❌ This folder is not linked to a Netlify site yet."
	echo "   Please run: netlify link  (and choose the existing site: sf-sms-service)"
	echo "   Then re-run this task."
	exit 1
fi
echo "🔗 Linked site: $site_name ($site_url)"

set_var() {
	local key="$1"; local val
	val=$(read_env "$key")
	if [ -n "$val" ]; then
		echo "➡️  Setting $key"
			# Pass value as a single argument (quotes preserved)
			netlify env:set "$key" "$val" >/dev/null
	else
		echo "⚠️  Skipping $key (no value in .env)"
	fi
}

# Core variables used by functions
set_var TWILIO_ACCOUNT_SID
set_var TWILIO_AUTH_TOKEN
set_var TWILIO_VERIFY_SID
set_var ALLOWED_ORIGINS
set_var DEFAULT_COUNTRY
set_var JWT_SECRET
set_var ADMIN_KEY
set_var BASE_URL
set_var CORS_STRICT

echo "✅ Sync complete. Deploy or restart previews to apply."
