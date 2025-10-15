require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkPromoters() {
  console.log('Checking promoters in database...');
  const { data, error } = await supabase
    .from('promoters')
    .select('id, name, phone, promo_code, status')
    .limit(10);
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('\nTotal promoters found:', data.length);
    if (data.length > 0) {
      console.log('\nPromoters:');
      data.forEach(p => {
        console.log(`- ${p.name} | Phone: ${p.phone} | Code: ${p.promo_code} | Status: ${p.status}`);
      });
    } else {
      console.log('No promoters found in database.');
    }
  }
}

checkPromoters();
