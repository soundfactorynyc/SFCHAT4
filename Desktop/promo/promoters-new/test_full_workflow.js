require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('=====================================');
console.log('PROMOTER PAYMENT WORKFLOW TEST');
console.log('=====================================\n');

async function runTests() {
  let testResults = {
    environment: {},
    stripe: {},
    database: {},
    workflow: {}
  };

  // 1. CHECK ENVIRONMENT VARIABLES
  console.log('1. CHECKING ENVIRONMENT VARIABLES...');
  console.log('-----------------------------------');
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLIC_KEY', 
    'STRIPE_WEBHOOK_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_VERIFY_SERVICE_SID',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  let envMissing = [];
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: MISSING`);
      envMissing.push(varName);
    }
  });
  
  testResults.environment = {
    passed: envMissing.length === 0,
    missing: envMissing
  };

  // 2. CHECK STRIPE CONNECTION
  console.log('\n2. CHECKING STRIPE CONNECTION...');
  console.log('-----------------------------------');
  
  try {
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Stripe Account: ${account.display_name || account.email}`);
    console.log(`✅ Account ID: ${account.id}`);
    console.log(`✅ Charges Enabled: ${account.charges_enabled}`);
    console.log(`✅ Payouts Enabled: ${account.payouts_enabled}`);
    
    testResults.stripe.connected = true;
    testResults.stripe.accountId = account.id;
    testResults.stripe.chargesEnabled = account.charges_enabled;
  } catch (error) {
    console.log(`❌ Stripe Connection Error: ${error.message}`);
    testResults.stripe.connected = false;
    testResults.stripe.error = error.message;
  }

  // 3. CHECK WEBHOOK SECRET
  console.log('\n3. CHECKING WEBHOOK CONFIGURATION...');
  console.log('-----------------------------------');
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    if (process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      console.log('✅ Webhook secret format: Valid');
      testResults.stripe.webhookValid = true;
    } else {
      console.log('❌ Webhook secret format: Invalid (should start with whsec_)');
      testResults.stripe.webhookValid = false;
    }
  } else {
    console.log('❌ Webhook secret: Not configured');
    testResults.stripe.webhookValid = false;
  }

  // 4. CHECK PRODUCTS AND PRICES
  console.log('\n4. CHECKING STRIPE PRODUCTS...');
  console.log('-----------------------------------');
  
  try {
    const products = await stripe.products.list({ limit: 5 });
    const prices = await stripe.prices.list({ limit: 5 });
    
    console.log(`✅ Products found: ${products.data.length}`);
    console.log(`✅ Prices found: ${prices.data.length}`);
    
    if (products.data.length > 0) {
      console.log('\nSample products:');
      products.data.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name} (${p.id})`);
      });
    }
    
    testResults.stripe.products = products.data.length;
    testResults.stripe.prices = prices.data.length;
  } catch (error) {
    console.log(`❌ Products/Prices Error: ${error.message}`);
    testResults.stripe.productsError = error.message;
  }

  // 5. CHECK DATABASE CONNECTION
  console.log('\n5. CHECKING DATABASE...');
  console.log('-----------------------------------');
  
  try {
    // Check promoters table
    const { data: promoters, error: promoterError } = await supabase
      .from('promoters')
      .select('id, name, phone, promo_code, status, commission_earned, tickets_sold')
      .limit(5);
    
    if (promoterError) throw promoterError;
    
    console.log(`✅ Promoters table: Accessible`);
    console.log(`✅ Total promoters: ${promoters.length}`);
    
    if (promoters.length > 0) {
      console.log('\nPromoter statuses:');
      const statusCounts = {};
      promoters.forEach(p => {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
      
      // Find approved promoter for testing
      const approvedPromoter = promoters.find(p => p.status === 'approved');
      if (approvedPromoter) {
        console.log(`\n✅ Test promoter found: ${approvedPromoter.name}`);
        console.log(`  - Phone: ${approvedPromoter.phone}`);
        console.log(`  - Promo Code: ${approvedPromoter.promo_code}`);
        console.log(`  - Commission: $${approvedPromoter.commission_earned || 0}`);
        console.log(`  - Tickets Sold: ${approvedPromoter.tickets_sold || 0}`);
        testResults.database.testPromoter = approvedPromoter;
      }
    }
    
    // Check promoter_sales table
    const { data: sales, error: salesError } = await supabase
      .from('promoter_sales')
      .select('*')
      .limit(5);
    
    if (!salesError) {
      console.log(`\n✅ Sales table: Accessible`);
      console.log(`✅ Recent sales: ${sales ? sales.length : 0}`);
      testResults.database.salesTable = true;
    } else {
      console.log(`⚠️  Sales table error: ${salesError.message}`);
      testResults.database.salesTable = false;
    }
    
    testResults.database.connected = true;
    testResults.database.promoterCount = promoters.length;
  } catch (error) {
    console.log(`❌ Database Error: ${error.message}`);
    testResults.database.connected = false;
    testResults.database.error = error.message;
  }

  // 6. WORKFLOW READINESS CHECK
  console.log('\n6. WORKFLOW READINESS SUMMARY...');
  console.log('===================================');
  
  const checks = {
    '✅ Environment Variables': testResults.environment.passed,
    '✅ Stripe Connected': testResults.stripe.connected,
    '✅ Webhook Secret Valid': testResults.stripe.webhookValid,
    '✅ Products Created': testResults.stripe.products > 0,
    '✅ Database Connected': testResults.database.connected,
    '✅ Promoters Table Ready': testResults.database.promoterCount >= 0,
    '✅ Sales Table Ready': testResults.database.salesTable
  };
  
  let allPassed = true;
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check.replace('✅ ', '')}: ${passed ? 'READY' : 'NEEDS FIX'}`);
    if (!passed) allPassed = false;
  });

  // 7. NEXT STEPS
  console.log('\n7. NEXT STEPS...');
  console.log('-----------------------------------');
  
  if (!allPassed) {
    console.log('⚠️  ISSUES TO FIX:');
    
    if (envMissing.length > 0) {
      console.log(`\n1. Add missing environment variables to .env and Netlify:`);
      envMissing.forEach(v => console.log(`   - ${v}`));
    }
    
    if (!testResults.stripe.webhookValid) {
      console.log(`\n2. Configure webhook in Stripe Dashboard:`);
      console.log(`   - Go to https://dashboard.stripe.com/webhooks`);
      console.log(`   - Add endpoint: https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`);
      console.log(`   - Copy signing secret to STRIPE_WEBHOOK_SECRET`);
    }
    
    if (!testResults.database.testPromoter) {
      console.log(`\n3. Create and approve a test promoter:`);
      console.log(`   - Sign up at /promoter-signup.html`);
      console.log(`   - Approve in admin panel`);
      console.log(`   - Use for testing SMS login`);
    }
  } else {
    console.log('🎉 ALL SYSTEMS READY FOR PAYMENTS!');
    console.log('\nTEST THE COMPLETE FLOW:');
    console.log('1. Log in as approved promoter using SMS');
    console.log('2. Share your promo link for tickets/tables');
    console.log('3. Make a test purchase with promo code');
    console.log('4. Check webhook received in Stripe Dashboard');
    console.log('5. Verify commission credited in promoter dashboard');
    
    if (testResults.database.testPromoter) {
      const p = testResults.database.testPromoter;
      console.log(`\n📱 TEST WITH THIS PROMOTER:`);
      console.log(`   Phone: ${p.phone}`);
      console.log(`   Promo Code: ${p.promo_code}`);
    }
  }

  console.log('\n=====================================\n');
}

// Run all tests
runTests().catch(console.error);
