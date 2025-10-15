// netlify/functions/stripe-oauth-callback.js
// Handles OAuth callback from Stripe Connect/Express
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getBaseUrl(event) {
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (event.headers['x-forwarded-host'] || event.headers.host);
  return `${proto}://${host}`;
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generatePromoCode(firstName, lastName) {
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${initials}${random}`;
}

exports.handler = async (event) => {
  try {
    const { code, state, error } = event.queryStringParameters || {};

    const baseUrl = getBaseUrl(event);

    // Handle OAuth errors
    if (error) {
      console.error('Stripe OAuth error:', error);
      return {
        statusCode: 302,
        headers: {
          Location: `${baseUrl}/promoter-login.html?error=stripe_auth_failed`
        }
      };
    }

    if (!code) {
      return {
        statusCode: 400,
        body: 'Missing authorization code'
      };
    }

    // Exchange authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code
    });

    const stripeAccountId = response.stripe_user_id;
    const accessToken = response.access_token;
    const refreshToken = response.refresh_token;

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Parse state to get original email/phone
    let stateData = {};
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch (e) {
      console.warn('Could not parse state:', e);
    }

    const email = account.email || stateData.email;
    const phone = stateData.phone;
    const firstName = account.individual?.first_name || '';
    const lastName = account.individual?.last_name || '';

    // Check if promoter already exists
    let { data: promoter, error: fetchError } = await supabase
      .from('promoters')
      .select('*')
      .eq('stripe_account_id', stripeAccountId)
      .single();

    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // If promoter doesn't exist, create new one
    if (!promoter) {
      const promoCode = generatePromoCode(firstName, lastName);

      const { data: newPromoter, error: createError } = await supabase
        .from('promoters')
        .insert({
          email: email,
          phone: phone,
          first_name: firstName,
          last_name: lastName,
          stripe_account_id: stripeAccountId,
          stripe_access_token: accessToken,
          stripe_refresh_token: refreshToken,
          promo_code: promoCode,
          status: 'approved', // Auto-approve
          tickets_sold: 0,
          commission_earned: 0,
          session_token: sessionToken,
          session_expires_at: expiresAt.toISOString(),
          last_login_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating promoter:', createError);
        throw new Error('Failed to create promoter account');
      }

      promoter = newPromoter;
      console.log('New promoter created:', { email, promoCode });

    } else {
      // Update existing promoter with new tokens and session
      const { error: updateError } = await supabase
        .from('promoters')
        .update({
          stripe_access_token: accessToken,
          stripe_refresh_token: refreshToken,
          session_token: sessionToken,
          session_expires_at: expiresAt.toISOString(),
          last_login_at: new Date().toISOString()
        })
        .eq('id', promoter.id);

      if (updateError) {
        console.error('Error updating promoter:', updateError);
      }

      console.log('Existing promoter logged in:', { email, promo_code: promoter.promo_code });
    }

    // Redirect to dashboard with session token
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/promoter-dashboard.html?token=${sessionToken}&new=${!fetchError ? 'false' : 'true'}`,
        'Set-Cookie': `promoter_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      }
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    const baseUrl = getBaseUrl(event);
    return {
      statusCode: 302,
      headers: {
        Location: `${baseUrl}/promoter-login.html?error=auth_failed&message=${encodeURIComponent(error.message)}`
      }
    };
  }
};
