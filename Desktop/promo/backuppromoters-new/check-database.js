// Quick script to check if your test promoter exists in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkPromoter() {
  console.log('\n🔍 Checking for test promoter...\n');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  console.log('Phone to check: +19293629534\n');

  // Check if promoter exists
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .eq('phone', '+19293629534')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('\n📋 This means you need to:');
    console.log('1. Go to Supabase: https://supabase.com/dashboard/project/axhsljfsrfkrpdtbgdpv/sql/new');
    console.log('2. Run supabase-promoter-schema.sql');
    console.log('3. Run add-test-promoter.sql');
    return;
  }

  if (data) {
    console.log('✅ Promoter found!\n');
    console.log('Details:');
    console.log('  - ID:', data.id);
    console.log('  - Name:', data.name);
    console.log('  - Email:', data.email);
    console.log('  - Phone:', data.phone);
    console.log('  - Promo Code:', data.promo_code);
    console.log('  - Status:', data.status);
    console.log('  - Created:', data.created_at);
    console.log('\n🎉 You can now test SMS login!');
  } else {
    console.log('❌ No promoter found with phone +19293629534');
    console.log('\n📋 Run this SQL in Supabase:\n');
    console.log(`
INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status,
  stripe_account_id
) VALUES (
  'SFTEST001',
  'Test Promoter',
  'test@soundfactorynyc.com',
  '+19293629534',
  'approved',
  'acct_test_stripe_id'
)
ON CONFLICT (phone) DO UPDATE SET status = 'approved';
    `);
  }
}

checkPromoter();
