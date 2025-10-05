#!/usr/bin/env bash
set -euo pipefail

# Local developer helper script for running Netlify dev with safer polling & env loading
# Usage: ./local-dev.sh

if [[ ! -f .env ]]; then
  echo "[info] No .env file found. You can copy .env.example to .env and edit real values." >&2
fi

export CHOKIDAR_USEPOLLING=1
export NODE_ENV=development

# Optional: warn if Twilio vars missing
if [[ -z "${TWILIO_ACCOUNT_SID:-}" || -z "${TWILIO_AUTH_TOKEN:-}" ]]; then
  echo "[warn] Twilio credentials not fully set. Functions will run in demo mode (demo_code returned)." >&2
fi

# Prevent accidental demo code leakage in production-like env
if [[ "${ALLOW_DEMO_CODES:-true}" != "false" ]]; then
  echo "[info] Demo codes enabled (ALLOW_DEMO_CODES != false)." >&2
fi

echo "[info] Starting Netlify dev..."
netlify dev
