// netlify/functions/verify-sms-code.js
// Verifies SMS code and creates login session for approved team members
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate secure session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { phone, code } = JSON.parse(event.body || '{}');

    if (!phone || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Phone number and code required' })
      };
    }

    // Verify code with Twilio
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({ 
        to: phone, 
        code: code 
      });

    if (verificationCheck.status !== 'approved') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid verification code' })
      };
    }

    // Get promoter from database
    const { data: promoter, error: dbError } = await supabase
      .from('promoters')
      .select('*')
      .eq('phone', phone)
      .eq('status', 'approved') // Only approved members
      .single();

    if (dbError || !promoter) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Account not found or not approved' })
      };
    }

    // Create session token (24-hour expiry)
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update promoter with session
    const { error: updateError } = await supabase
      .from('promoters')
      .update({
        session_token: sessionToken,
        session_expires_at: expiresAt.toISOString(),
        last_login_at: new Date().toISOString()
      })
      .eq('id', promoter.id);

    if (updateError) {
      console.error('Session update error:', updateError);
      throw new Error('Failed to create session');
    }

    console.log('Login successful:', { 
      phone, 
      promoCode: promoter.promo_code,
      name: `${promoter.first_name} ${promoter.last_name}` 
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionToken: sessionToken,
        promoCode: promoter.promo_code,
        token: sessionToken, // backwards compatibility
        promoter: {
          id: promoter.id,
          promo_code: promoter.promo_code,
          name: `${promoter.first_name} ${promoter.last_name}`,
          email: promoter.email,
          tickets_sold: promoter.tickets_sold || 0,
          commission_earned: promoter.commission_earned || 0
        },
        expiresAt: expiresAt.toISOString()
      })
    };

  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Verification failed' 
      })
    };
  }
};
