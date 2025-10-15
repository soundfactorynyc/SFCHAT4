#!/bin/bash
# Quick API Endpoint Test Script
# Tests all Stripe OAuth backend functions for basic connectivity

echo "🧪 Testing Stripe OAuth API Endpoints..."
echo "=========================================="
echo ""

BASE_URL="https://team.soundfactorynyc.com"

# Test 1: Check stripe-connect-signup endpoint
echo "1️⃣  Testing stripe-connect-signup..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/.netlify/functions/stripe-connect-signup" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ Function responding (400 expected for empty request)"
  echo "   Response: $BODY"
else
  echo "   ⚠️  Unexpected status: $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 2: Check stripe-login-with-email endpoint
echo "2️⃣  Testing stripe-login-with-email..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/.netlify/functions/stripe-login-with-email" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ Function responding (400 expected for empty email)"
  echo "   Response: $BODY"
else
  echo "   ⚠️  Unexpected status: $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 3: Check verify-stripe-setup endpoint
echo "3️⃣  Testing verify-stripe-setup..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/.netlify/functions/verify-stripe-setup" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ Function responding (400 expected for empty request)"
  echo "   Response: $BODY"
else
  echo "   ⚠️  Unexpected status: $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 4: Check stripe-login-verify endpoint
echo "4️⃣  Testing stripe-login-verify..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/.netlify/functions/stripe-login-verify" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ Function responding (400 expected for empty request)"
  echo "   Response: $BODY"
else
  echo "   ⚠️  Unexpected status: $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 5: Check frontend pages
echo "5️⃣  Testing Frontend Pages..."
echo ""

echo "   📄 Signup Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/index-stripe-oauth.html")
if [ "$STATUS" = "200" ]; then
  echo "      ✅ Accessible (200 OK)"
else
  echo "      ❌ Status: $STATUS"
fi

echo "   📄 Login Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/promoter-login-stripe-v2.html")
if [ "$STATUS" = "200" ]; then
  echo "      ✅ Accessible (200 OK)"
else
  echo "      ❌ Status: $STATUS"
fi

echo "   📄 Signup Callback..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/stripe-oauth-callback.html")
if [ "$STATUS" = "200" ]; then
  echo "      ✅ Accessible (200 OK)"
else
  echo "      ❌ Status: $STATUS"
fi

echo "   📄 Login Callback..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/stripe-oauth-callback-login.html")
if [ "$STATUS" = "200" ]; then
  echo "      ✅ Accessible (200 OK)"
else
  echo "      ❌ Status: $STATUS"
fi

echo ""
echo "=========================================="
echo "✅ Connectivity Test Complete!"
echo ""
echo "Next Steps:"
echo "1. Open https://team.soundfactorynyc.com/index-stripe-oauth.html"
echo "2. Complete the manual testing checklist"
echo "3. Document results in DEPLOYMENT_TEST_REPORT.md"
