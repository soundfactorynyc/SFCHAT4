// Quick script to add a test promoter for you
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addTestPromoter() {
  // What phone number are you trying to use?
  // Let me add a few common formats
  const phones = [
    '+19085551234',  // Example format
    '+16464664925',  // The hotline number from the site
    '+19082550185',  // Your number if it's 908-255-0185
  ];
  
  console.log('Current promoters:');
  const { data: existing } = await supabase
    .from('promoters')
    .select('name, phone, promo_code')
    .limit(10);
    
  existing.forEach(p => {
    console.log(`- ${p.name}: ${p.phone} (${p.promo_code})`);
  });
  
  console.log('\nTo add a test promoter, uncomment the code below and run again');
  
  /*
  // Uncomment this to add a promoter
  const { data, error } = await supabase
    .from('promoters')
    .insert({
      name: 'Test User',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '+19085551234',  // Change this to your phone
      promo_code: 'TEST123',
      status: 'approved',
      commission_rate: 10,
      table_commission_rate: 20,
      stripe_account_id: 'acct_test123'
    });
    
  if (error) {
    console.log('Error adding:', error);
  } else {
    console.log('Added:', data);
  }
  */
}

addTestPromoter();