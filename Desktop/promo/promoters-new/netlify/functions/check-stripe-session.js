// netlify/functions/check-stripe-session.js
// Validates Stripe OAuth session token
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { token } = JSON.parse(event.body || '{}');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          valid: false, 
          error: 'No session token provided' 
        })
      };
    }

    // Look up promoter by session token
    const { data: promoter, error } = await supabase
      .from('promoters')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error || !promoter) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          valid: false, 
          error: 'Invalid or expired session' 
        })
      };
    }

    // Check if session is expired
    const expiresAt = new Date(promoter.session_expires_at);
    if (expiresAt < new Date()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          valid: false, 
          error: 'Session expired' 
        })
      };
    }

    // Check if promoter is still approved
    if (promoter.status !== 'approved') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          valid: false, 
          error: 'Account not approved or suspended' 
        })
      };
    }

    // Session is valid
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valid: true,
        promoter: {
          id: promoter.id,
          email: promoter.email,
          name: `${promoter.first_name} ${promoter.last_name}`,
          promo_code: promoter.promo_code,
          tickets_sold: promoter.tickets_sold || 0,
          commission_earned: promoter.commission_earned || 0,
          status: promoter.status
        }
      })
    };

  } catch (error) {
    console.error('Session check error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        valid: false, 
        error: 'Session validation failed' 
      })
    };
  }
};
