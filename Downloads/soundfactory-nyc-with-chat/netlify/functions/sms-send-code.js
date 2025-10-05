// Twilio Verify: send code
// POST { phone }
// Response: { success:true, status, to }
const { normalizePhone, handleOptions, error, ok, getTwilioClient, getVerifyServiceSid } = require('./_utils');

exports.handler = async (event) => {
  const opt = handleOptions(event); if (opt) return opt;
  if (event.httpMethod !== 'POST') return error(405, 'Method not allowed');
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return error(400, 'Invalid JSON'); }
  const phone = normalizePhone(body.phone);
  if (!phone) return error(400, 'Invalid phone');

  const twilio = getTwilioClient();
  const serviceSid = getVerifyServiceSid();
  if (!twilio || !serviceSid) return error(500, 'Verify not configured');
  try {
    const verification = await twilio.verify.v2.services(serviceSid).verifications.create({ to: phone, channel: 'sms' });
    return ok({ success: true, status: verification.status, to: phone });
  } catch (e) {
    console.error('Verify send failed', e.message, e.code);
    return error(500, 'Failed to send verification', { code: e.code });
  }
};
