// Check all promoters in database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function listPromoters() {
  console.log('\n🔍 Checking all promoters in database...\n');
  
  const { data, error } = await supabase
    .from('promoters')
    .select('id, email, phone, first_name, last_name, promo_code, stripe_account_id, status')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} promoter(s):\n`);
    data.forEach((p, i) => {
      console.log(`${i + 1}. ${p.first_name} ${p.last_name}`);
      console.log(`   Email: ${p.email}`);
      console.log(`   Phone: ${p.phone}`);
      console.log(`   Promo Code: ${p.promo_code}`);
      console.log(`   Stripe ID: ${p.stripe_account_id || '(not set)'}`);
      console.log(`   Status: ${p.status}`);
      console.log('');
    });
  } else {
    console.log('❌ No promoters found in database');
    console.log('\n📋 The database is empty. You need to:');
    console.log('1. Create a Stripe account through the OAuth flow');
    console.log('2. Or manually insert test data');
  }
}

listPromoters();
