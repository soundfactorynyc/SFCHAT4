// netlify/functions/stripe-login-verify.js
// Verifies Stripe authentication after login and creates session for returning users
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { promoterId } = JSON.parse(event.body || '{}');

    if (!promoterId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Promoter ID required' })
      };
    }

    // Get promoter from database
    const { data: promoter, error: dbError } = await supabase
      .from('promoters')
      .select('*')
      .eq('id', promoterId)
      .single();

    if (dbError || !promoter) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Promoter not found' })
      };
    }

    // Verify promoter is approved
    if (promoter.status !== 'approved') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: `Your account is ${promoter.status}. Please contact support.` 
        })
      };
    }

    // Verify Stripe account is still active and get latest status
    const account = await stripe.accounts.retrieve(promoter.stripe_account_id);

    if (!account) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Stripe account not found' })
      };
    }

    // Create session token (24-hour expiry)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update promoter with session and latest Stripe status
    const { error: updateError } = await supabase
      .from('promoters')
      .update({
        session_token: sessionToken,
        session_expires_at: expiresAt.toISOString(),
        last_login_at: new Date().toISOString(),
        stripe_charges_enabled: account.charges_enabled || false,
        stripe_payouts_enabled: account.payouts_enabled || false
      })
      .eq('id', promoter.id);

    if (updateError) {
      console.error('Session update error:', updateError);
      throw new Error('Failed to create session');
    }

    console.log('Login verified and session created:', {
      promoter_id: promoter.id,
      promo_code: promoter.promo_code,
      email: promoter.email,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        sessionToken: sessionToken,
        expiresAt: expiresAt.toISOString(),
        promoter: {
          id: promoter.id,
          promo_code: promoter.promo_code,
          name: `${promoter.first_name} ${promoter.last_name}`,
          email: promoter.email,
          phone: promoter.phone,
          tickets_sold: promoter.tickets_sold || 0,
          commission_earned: parseFloat(promoter.commission_earned || 0),
          status: promoter.status,
          stripe_account_complete: account.charges_enabled && account.payouts_enabled
        }
      })
    };

  } catch (error) {
    console.error('Login verification error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Unable to verify Stripe account. Please try logging in again.' 
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Login verification failed' 
      })
    };
  }
};
