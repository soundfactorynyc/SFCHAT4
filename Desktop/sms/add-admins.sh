#!/bin/bash

SITE_URL="https://sf-sms-service.netlify.app"
ADMIN_KEY="Deepernyc1"

emails=(
  "RonaldJAyala@outlook.com"
  "jonathanpeters1@mac.com"
  "morgangold@mac.com"
)

for email in "${emails[@]}"; do
  echo "➕ Adding admin: $email"
  curl -s -X POST "$SITE_URL/api/members-upsert" \
    -H "Content-Type: application/json" \
    -H "x-admin-key: $ADMIN_KEY" \
    --data "{\"email\":\"$email\",\"role\":\"admin\"}"
  echo ""
done
