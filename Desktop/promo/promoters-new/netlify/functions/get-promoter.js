// netlify/functions/get-promoter.js
// Gets promoter data from Supabase database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function json(body, statusCode=200){
  return { 
    statusCode, 
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    }, 
    body: JSON.stringify(body) 
  };
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return json({}, 200);
  }

  if (event.httpMethod !== 'GET') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  try {
    // Extract promo code from path
    const parts = event.path.split('/');
    const promoCode = decodeURIComponent(parts[parts.length - 1]);

    if (!promoCode) {
      return json({ error: 'Promo code is required' }, 400);
    }

    console.log('Looking up promoter with code:', promoCode);

    // Get promoter from Supabase database
    const { data: promoter, error: dbError } = await supabase
      .from('promoters')
      .select('*')
      .eq('promo_code', promoCode)
      .eq('status', 'approved')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return json({ error: 'Promoter not found' }, 404);
    }

    if (!promoter) {
      console.log('Promoter not found for code:', promoCode);
      return json({ error: 'Promoter not found' }, 404);
    }

    console.log('Found promoter:', {
      id: promoter.id,
      name: promoter.name,
      promoCode: promoter.promo_code
    });

    // Build referral link
    const host = event.headers.host || 'localhost:8888';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.PUBLIC_BASE_URL || `${protocol}://${host}`;
    const referralLink = `${baseUrl}/team-tickets-tables.html?promo=${promoCode}`;

    // Return promoter data
    return json({
      success: true,
      name: promoter.name,
      email: promoter.email,
      phone: promoter.phone,
      promoCode: promoter.promo_code,
      ticketsSold: promoter.tickets_sold || 0,
      commissionEarned: (promoter.commission_earned || 0).toFixed(2),
      referralLink: referralLink,
      status: promoter.status,
      stripeAccountId: promoter.stripe_account_id,
      createdAt: promoter.created_at,
      lastLoginAt: promoter.last_login_at
    });

  } catch (err) {
    console.error('Error fetching promoter:', err);
    return json({ error: err.message || 'Internal server error' }, 500);
  }
};