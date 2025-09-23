#!/bin/bash
set -e

SITE="https://tourmaline-meerkat-3129f1.netlify.app"
KEY="Deepernyc1"    # <-- if you rotated it, paste the *exact* ADMIN_KEY here
EMAIL="test+admincheck@sfnyc.com"

payload() {
  jq -c --null-input --arg email "$EMAIL" --arg role "admin" --arg key "$KEY" \
    '{email:$email, role:$role, adminKey:$key, name:"SF Test"}'
}

echo "=== Checking /api/health (envs present?) ==="
curl -s "$SITE/.netlify/functions/health" | jq .

echo -e "\n=== Try 1: /api with x-admin-key header ==="
curl -s -X POST "$SITE/api/members-upsert" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $KEY" \
  --data "$(payload)"; echo

echo -e "\n=== Try 2: /api with Authorization: Bearer ==="
curl -s -X POST "$SITE/api/members-upsert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KEY" \
  --data "$(payload)"; echo

echo -e "\n=== Try 3: /api with adminKey in JSON only ==="
curl -s -X POST "$SITE/api/members-upsert" \
  -H "Content-Type: application/json" \
  --data "$(payload)"; echo

echo -e "\n=== Try 4: /.netlify/functions (legacy path) with x-admin-key ==="
curl -s -X POST "$SITE/.netlify/functions/members-upsert" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $KEY" \
  --data "$(payload)"; echo

echo -e "\n=== Try 5: /.netlify/functions with Authorization: Bearer ==="
curl -s -X POST "$SITE/.netlify/functions/members-upsert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $KEY" \
  --data "$(payload)"; echo

echo -e "\n=== Try 6: /.netlify/functions with adminKey in JSON only ==="
curl -s -X POST "$SITE/.netlify/functions/members-upsert" \
  -H "Content-Type: application/json" \
  --data "$(payload)"; echo
