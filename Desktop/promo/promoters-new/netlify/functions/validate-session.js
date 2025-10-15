// netlify/functions/validate-session.js
// Validates promoter session token for protected dashboard access
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
    const { sessionToken } = JSON.parse(event.body || '{}');

    if (!sessionToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Session token required' })
      };
    }

    // Look up session
    const { data: promoter, error } = await supabase
      .from('promoters')
      .select('id, name, email, phone, promo_code, status, session_expires_at')
      .eq('session_token', sessionToken)
      .eq('status', 'approved')
      .single();

    if (error || !promoter) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired session' })
      };
    }

    // Check if session expired
    const expiresAt = new Date(promoter.session_expires_at);
    if (expiresAt < new Date()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Session expired. Please log in again.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valid: true,
        promoter: {
          name: promoter.name,
          email: promoter.email,
          phone: promoter.phone,
          promoCode: promoter.promo_code,
          status: promoter.status
        }
      })
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Validation failed' })
    };
  }
};
