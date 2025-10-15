// netlify/functions/stripe-connect-signup.js
// Initiates Stripe Connect OAuth flow for new promoter signup
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

function generatePromoCode(firstName, lastName) {
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${initials}${random}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { firstName, lastName, email, phone } = JSON.parse(event.body || '{}');

    if (!firstName || !lastName || !email || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields required' })
      };
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('promoters')
      .select('id, email, phone')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existing) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: existing.email === email 
            ? 'Email already registered. Please login instead.' 
            : 'Phone number already registered. Please login instead.'
        })
      };
    }

    const baseUrl = getBaseUrl(event);
    const promoCode = generatePromoCode(firstName, lastName);

    // Create Stripe Connect account with Express type
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      country: 'US',
      capabilities: {
        transfers: { requested: true }
      },
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone
      },
      metadata: {
        promo_code: promoCode,
        first_name: firstName,
        last_name: lastName,
        source: 'promoter_signup'
      }
    });

    // Store promoter in database with pending Stripe status
    const { data: promoter, error: dbError } = await supabase
      .from('promoters')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        promo_code: promoCode,
        stripe_account_id: account.id,
        status: 'approved', // Auto-approve
        tickets_sold: 0,
        commission_earned: 0
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up Stripe account if database fails
      await stripe.accounts.del(account.id).catch(console.error);
      throw new Error('Failed to create promoter account');
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/index-stripe-oauth.html?error=refresh_needed`,
      return_url: `${baseUrl}/stripe-oauth-callback.html?promoter_id=${promoter.id}`,
      type: 'account_onboarding'
    });

    console.log('Promoter signup initiated:', {
      promoter_id: promoter.id,
      email: email,
      promo_code: promoCode,
      stripe_account_id: account.id
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        stripeConnectUrl: accountLink.url,
        promoterId: promoter.id
      })
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Signup failed' 
      })
    };
  }
};
