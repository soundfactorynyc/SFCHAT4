// netlify/functions/stripe-oauth/stripe-login.js
// Initiates Stripe Express OAuth login flow
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getBaseUrl(event) {
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (event.headers['x-forwarded-host'] || event.headers.host);
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, phone } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    const baseUrl = getBaseUrl(event);

    // Check if promoter exists
    const { data: promoter } = await supabase
      .from('promoters')
      .select('id, stripe_account_id, status, email')
      .eq('email', email)
      .single();

    // Scenario 1: Existing promoter - redirect to Express login
    if (promoter && promoter.stripe_account_id) {
      
      // Build Stripe Express login URL with email pre-filled
      const stripeLoginUrl = `https://connect.stripe.com/express_login?email=${encodeURIComponent(email)}`;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          action: 'login',
          redirectUrl: stripeLoginUrl,
          message: 'Redirecting to Stripe for authentication...'
        })
      };
    }

    // Scenario 2: New user - need to create account via Connect OAuth
    // Build Stripe Connect OAuth URL for new account creation
    const state = Buffer.from(JSON.stringify({ 
      email, 
      phone: phone || null,
      timestamp: Date.now() 
    })).toString('base64');

    const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&` +
      `scope=read_write&` +
      `redirect_uri=${encodeURIComponent(baseUrl + '/.netlify/functions/stripe-oauth-callback')}&` +
      `state=${state}&` +
      `stripe_user[email]=${encodeURIComponent(email)}` +
      (phone ? `&stripe_user[phone_number]=${encodeURIComponent(phone)}` : '');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        action: 'signup',
        redirectUrl: stripeConnectUrl,
        message: 'Redirecting to Stripe to create your account...'
      })
    };

  } catch (error) {
    console.error('Stripe login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Login failed' })
    };
  }
};
