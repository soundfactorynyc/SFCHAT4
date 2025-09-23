// netlify/functions/health.js
exports.handler = async () => {
  const env = {
    has_TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    has_TWILIO_AUTH_TOKEN:  !!process.env.TWILIO_AUTH_TOKEN,
    has_TWILIO_VERIFY_SID:  !!process.env.TWILIO_VERIFY_SID,
    DEFAULT_COUNTRY: process.env.DEFAULT_COUNTRY || null,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || null,
    CORS_STRICT: process.env.CORS_STRICT || null,
    BASE_URL: process.env.BASE_URL || null
  };

  // (Optional) short preview without secrets
  const preview = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.slice(0,4)+'…' : null,
    TWILIO_VERIFY_SID:  process.env.TWILIO_VERIFY_SID ? process.env.TWILIO_VERIFY_SID.slice(0,2)+'…' : null
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, env, preview })
  };
};