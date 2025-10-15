#!/bin/bash

# Quick Diagnostic Script for Promoter Login Issue
echo "🔍 DIAGNOSING PROMOTER LOGIN ISSUE"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: Run this from /Users/jpwesite/Desktop/promo/promoters-new/"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check environment variables
echo "📋 CHECKING ENVIRONMENT VARIABLES:"
echo "-----------------------------------"

if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check for required vars
    if grep -q "SUPABASE_URL" .env; then
        echo "✅ SUPABASE_URL found"
    else
        echo "❌ SUPABASE_URL missing"
    fi
    
    if grep -q "SUPABASE_ANON_KEY" .env; then
        echo "✅ SUPABASE_ANON_KEY found"
    else
        echo "❌ SUPABASE_ANON_KEY missing"
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "🔑 THE ISSUE:"
echo "-----------------------------------"
echo "Your SMS login works fine, which means:"
echo "  ✅ Twilio is configured correctly"
echo "  ✅ Phone verification works"
echo "  ✅ SMS code gets verified"
echo ""
echo "But the dashboard fails, which means:"
echo "  ❌ No promoter exists in database for your phone number"
echo ""
echo "🎯 THE FIX:"
echo "-----------------------------------"
echo "You need to add a promoter to the Supabase database."
echo ""
echo "Run this SQL in your Supabase SQL Editor:"
echo ""
cat << 'EOF'
-- Add a test promoter (REPLACE PHONE NUMBER WITH YOURS!)
INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status,
  tickets_sold,
  commission_earned,
  created_at
) VALUES (
  'SFTEST001',                    -- Promo code
  'Test Promoter',                -- Name
  'test@soundfactorynyc.com',    -- Email
  '+19293629534',                 -- YOUR PHONE NUMBER (change this!)
  'approved',                     -- Status (must be 'approved')
  0,                              -- Tickets sold
  0,                              -- Commission earned
  NOW()                           -- Created timestamp
)
ON CONFLICT (phone) 
DO UPDATE SET 
  status = 'approved',
  promo_code = 'SFTEST001';

-- Verify it was created
SELECT 
  id,
  promo_code,
  name,
  phone,
  email,
  status,
  created_at
FROM promoters 
WHERE phone = '+19293629534';  -- Change to your phone number

EOF

echo ""
echo "📱 IMPORTANT:"
echo "-----------------------------------"
echo "Change '+19293629534' to YOUR actual phone number!"
echo "The phone number must match what you use for SMS login."
echo ""
echo "After running the SQL:"
echo "1. Try SMS login again"
echo "2. Dashboard should load successfully"
echo ""
echo "✨ That's it!"

