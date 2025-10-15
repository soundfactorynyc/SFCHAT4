// netlify/functions/verify-stripe-setup.js
// Verifies Stripe Connect account setup is complete and creates session
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

    // Verify Stripe account exists and is active
    const account = await stripe.accounts.retrieve(promoter.stripe_account_id);

    if (!account) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Stripe account not found' })
      };
    }

    // Check if account is ready to receive payouts
    const accountComplete = account.charges_enabled && account.payouts_enabled;

    if (!accountComplete) {
      // Update database to reflect incomplete status
      await supabase
        .from('promoters')
        .update({ 
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled
        })
        .eq('id', promoter.id);
    }

    // Create session token (24-hour expiry)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update promoter with session
    await supabase
      .from('promoters')
      .update({
        session_token: sessionToken,
        session_expires_at: expiresAt.toISOString(),
        last_login_at: new Date().toISOString(),
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled
      })
      .eq('id', promoter.id);

    console.log('Setup verified and session created:', {
      promoter_id: promoter.id,
      promo_code: promoter.promo_code,
      account_complete: accountComplete
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
          tickets_sold: promoter.tickets_sold || 0,
          commission_earned: promoter.commission_earned || 0,
          stripe_account_complete: accountComplete
        }
      })
    });

  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Verification failed' 
      })
    };
  }
};
