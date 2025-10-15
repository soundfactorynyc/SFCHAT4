require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('promoters')
    .select('*')
    .limit(1);
  
  if (data && data.length > 0) {
    console.log('Database fields:', Object.keys(data[0]));
    console.log('\nSample promoter:', data[0]);
  }
}

checkSchema();
