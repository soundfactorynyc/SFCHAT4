// netlify/functions/stripe-login-with-email.js
// Finds promoter by email and generates Stripe AccountLink for login with SMS verification
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
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
    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Find promoter by email
    const { data: promoter, error: dbError } = await supabase
      .from('promoters')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (dbError || !promoter) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'No account found with this email. Please sign up first.' 
        })
      };
    }

    // Check promoter status
    if (promoter.status !== 'approved') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: `Your account is currently ${promoter.status}. Please contact support.` 
        })
      };
    }

    // Verify Stripe account exists
    if (!promoter.stripe_account_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Stripe account not found. Please contact support.' 
        })
      };
    }

    const baseUrl = getBaseUrl(event);

    // Create AccountLink for returning user
    // Using 'account_update' type which includes phone verification
    const accountLink = await stripe.accountLinks.create({
      account: promoter.stripe_account_id,
      refresh_url: `${baseUrl}/promoter-login-stripe-v2.html?error=refresh_needed`,
      return_url: `${baseUrl}/stripe-oauth-callback-login.html?promoter_id=${promoter.id}`,
      type: 'account_update',
      collect: 'currently_due' // This ensures phone verification is included
    });

    console.log('Login link generated:', {
      promoter_id: promoter.id,
      email: promoter.email,
      promo_code: promoter.promo_code,
      stripe_account_id: promoter.stripe_account_id
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        stripeLoginUrl: accountLink.url,
        promoterId: promoter.id
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Unable to access Stripe account. Please contact support.' 
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Login failed. Please try again.' 
      })
    };
  }
};
