exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'SMS function is running',
        env: {
          has_TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
          has_TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
          has_TWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER
        }
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { action, phoneNumber, phone, code } = JSON.parse(event.body || '{}');
    const targetPhone = phoneNumber || phone || '';
    
    // BLOCK PROBLEMATIC NUMBERS
    const cleaned = targetPhone.replace(/\D/g, '');
    if (cleaned.includes('6464664925')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'This number cannot receive SMS. Please use a mobile number.',
          errorCode: 'BLOCKED_NUMBER'
        })
      };
    }

    if (action === 'send') {
      // Check for Twilio creds
      if (!process.env.TWILIO_ACCOUNT_SID) {
        // TEST MODE - No Twilio
        const testCode = Math.floor(100000 + Math.random() * 900000).toString();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'TEST MODE - Code: ' + testCode,
            testCode: testCode
          })
        };
      }

      // PRODUCTION MODE - Use Twilio
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const formattedPhone = cleaned.length === 10 ? '+1' + cleaned : '+' + cleaned;
      
      try {
        await client.messages.create({
          body: 'Your code: ' + verifyCode,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Code sent' })
        };
      } catch (err) {
        if (err.code === 21211) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Invalid phone number - cannot receive SMS',
              errorCode: '21211'
            })
          };
        }
        throw err;
      }
    }

    if (action === 'verify') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Verified' })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
