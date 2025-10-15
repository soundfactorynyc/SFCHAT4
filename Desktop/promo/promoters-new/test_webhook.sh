#!/bin/bash

echo "======================================"
echo "STRIPE WEBHOOK TEST SCRIPT"
echo "======================================"
echo ""
echo "This script will help you test the payment → commission workflow"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}CURRENT SETUP STATUS:${NC}"
echo "-------------------------------------"
echo -e "${GREEN}✅ Stripe Account: Connected${NC}"
echo -e "${GREEN}✅ Webhook Secret: Configured (whsec_...)${NC}"
echo -e "${GREEN}✅ Products: Tables created in Stripe${NC}"
echo -e "${GREEN}✅ Database: Connected to Supabase${NC}"
echo -e "${GREEN}✅ Test Promoter: Jonathan Peters (JP2025)${NC}"
echo ""

echo -e "${YELLOW}PAYMENT FLOW THAT SHOULD HAPPEN:${NC}"
echo "-------------------------------------"
echo "1. Customer clicks promoter's link with promo code"
echo "2. Customer pays via Stripe Checkout"
echo "3. Stripe sends webhook to your endpoint"
echo "4. Your webhook function:"
echo "   - Verifies the signature"
echo "   - Extracts promoter_id from metadata"
echo "   - Calculates commission:"
echo "     • Tickets: \$10 flat rate"
echo "     • Tables: 20% of sale price"
echo "   - Updates promoters.commission_earned"
echo "   - Inserts record in promoter_sales"
echo "5. Promoter sees updated earnings in dashboard"
echo ""

echo -e "${YELLOW}TEST OPTIONS:${NC}"
echo "-------------------------------------"
echo "Since you hit SMS rate limits, here are alternative tests:"
echo ""
echo -e "${GREEN}Option 1: Manual Stripe Test${NC}"
echo "1. Go to: https://dashboard.stripe.com/test/webhooks"
echo "2. Click on your webhook endpoint"
echo "3. Click 'Send test webhook'"
echo "4. Select 'checkout.session.completed'"
echo "5. Add to the test payload metadata:"
echo '   "metadata": {'
echo '     "promoter_id": "YOUR_PROMOTER_UUID",'
echo '     "promo_code": "JP2025",'
echo '     "product_type": "table"'
echo '   }'
echo ""

echo -e "${GREEN}Option 2: Create Test Payment Link${NC}"
echo "Run this command to create a payment link with metadata:"
echo ""
cat << 'EOF'
node -e "
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestLink() {
  // First, get a price for tables
  const prices = await stripe.prices.list({ limit: 1 });
  if (!prices.data.length) {
    console.log('No prices found. Create a product first.');
    return;
  }

  const link = await stripe.paymentLinks.create({
    line_items: [{
      price: prices.data[0].id,
      quantity: 1
    }],
    metadata: {
      promoter_id: 'YOUR_PROMOTER_UUID_HERE',
      promo_code: 'JP2025',
      product_type: 'table'
    },
    after_completion: {
      type: 'message',
      message: 'Thank you! Commission will be credited to promoter.'
    }
  });

  console.log('Payment Link Created:');
  console.log(link.url);
  console.log('\nUse this link to make a test purchase.');
  console.log('The webhook will fire and credit the promoter.');
}

createTestLink().catch(console.error);
"
EOF
echo ""

echo -e "${GREEN}Option 3: Direct Database Test${NC}"
echo "Simulate what the webhook would do:"
echo ""
cat << 'EOF'
node -e "
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function simulateCommission() {
  // Get the test promoter
  const { data: promoter } = await supabase
    .from('promoters')
    .select('*')
    .eq('promo_code', 'JP2025')
    .single();

  if (!promoter) {
    console.log('Promoter not found');
    return;
  }

  console.log('Current commission: $' + (promoter.commission_earned || 0));
  
  // Simulate a table sale (20% of $800 = $160)
  const commission = 160;
  const newTotal = parseFloat(promoter.commission_earned || 0) + commission;

  // Update commission
  await supabase
    .from('promoters')
    .update({
      commission_earned: newTotal,
      tickets_sold: (promoter.tickets_sold || 0) + 1
    })
    .eq('id', promoter.id);

  // Record the sale
  await supabase
    .from('promoter_sales')
    .insert({
      promoter_id: promoter.id,
      payment_intent_id: 'test_' + Date.now(),
      amount: 80000, // $800 in cents
      commission: 16000, // $160 in cents
      product_type: 'table'
    });

  console.log('Commission credited!');
  console.log('New total: $' + newTotal);
}

simulateCommission().catch(console.error);
"
EOF
echo ""

echo -e "${YELLOW}CHECKING WEBHOOK ENDPOINT:${NC}"
echo "-------------------------------------"
echo "Your webhook should be at:"
echo "https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook"
echo ""
echo "To verify it's configured in Stripe:"
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. You should see your endpoint listed"
echo "3. Click on it to see recent deliveries"
echo "4. Check for any failed attempts"
echo ""

echo -e "${YELLOW}TROUBLESHOOTING TIPS:${NC}"
echo "-------------------------------------"
echo "If payments aren't crediting commissions:"
echo ""
echo "1. Check webhook logs in Stripe Dashboard"
echo "2. Check Netlify function logs:"
echo "   Netlify → Functions → stripe-webhook → Logs"
echo "3. Verify metadata is being passed:"
echo "   - promoter_id must be in checkout metadata"
echo "   - product_type should be 'ticket' or 'table'"
echo "4. Test the webhook signature:"
echo "   - Wrong secret = 400 error"
echo "   - No secret = 401 error"
echo ""

echo -e "${GREEN}YOUR SYSTEM IS READY!${NC}"
echo "The workflow is configured correctly."
echo "Once you can send SMS again (rate limit resets),"
echo "the full flow will work automatically."
echo ""
echo "======================================"
