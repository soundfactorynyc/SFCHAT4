#!/bin/bash
SITE="https://tourmaline-meerkat-3129f1.netlify.app"
KEY="Deepernyc1"
EMAIL="test@example.com"

echo "🔑 Testing with x-admin-key..."
curl -s -X POST "$SITE/api/members-upsert" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $KEY" \
  --data "{\"email\":\"$EMAIL\",\"role\":\"admin\"}"

echo -e "\n---\n"

echo "🔑 Testing with Authorization: Bearer..."
curl -s -X POST "$SITE/api/members-upsert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KEY" \
  --data "{\"email\":\"$EMAIL\",\"role\":\"admin\"}"
