// netlify/functions/send-sms-code.js
// Sends SMS verification code to approved team members
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { phone } = JSON.parse(event.body || '{}');

    if (!phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Phone number required' })
      };
    }

    // Check if promoter exists and is approved
    const { data: promoter, error: dbError } = await supabase
      .from('promoters')
      .select('id, first_name, last_name, status, promo_code')
      .eq('phone', phone)
      .single();

    if (dbError || !promoter) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'No account found with this phone number. Please sign up first.' 
        })
      };
    }

    // Check approval status
    if (promoter.status === 'pending') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'Your account is pending approval. Please wait for admin confirmation.' 
        })
      };
    }

    if (promoter.status === 'rejected') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'Your account application was not approved.' 
        })
      };
    }

    if (promoter.status === 'suspended') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'Your account has been suspended. Please contact support.' 
        })
      };
    }

    // Only approved members can get SMS codes
    if (promoter.status !== 'approved') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Account not authorized for login' })
      };
    }

    // Send SMS verification code using Twilio Verify
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ 
        to: phone, 
        channel: 'sms' 
      });

    console.log('SMS sent to approved member:', { phone, status: verification.status });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true,
        message: 'Verification code sent',
        status: verification.status
      })
    };

  } catch (error) {
    console.error('SMS send error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Failed to send verification code' 
      })
    };
  }
};
