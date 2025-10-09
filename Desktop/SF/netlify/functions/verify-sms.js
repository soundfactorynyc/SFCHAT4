const twilio = require('twilio');

function normalizePhone(input, fallback = '+1') {
  if (!input) return null;
  let p = String(input).trim().replace(/[^\d+]/g, '');
  const cc = process.env.DEFAULT_COUNTRY_CODE || fallback;
  if (p.startsWith('+')) return p;
  if (p.length === 11 && p.startsWith('1')) return '+' + p;
  if (p.length === 10) return cc + p;
  return null;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { phone, code } = JSON.parse(event.body || '{}');
    const normalized = normalizePhone(phone);
    if (!normalized || !code) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone and code required' }) };

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: normalized, code });

    if (verification_check.status === 'approved') {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, status: 'approved', phone: normalized }) };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid verification code', status: verification_check.status }) };
  } catch (error) {
    console.error('Verify SMS error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Verification failed', details: error.message }) };
  }
};
