// Twilio Verify: check code
// POST { phone, code }
// Response: { success:true, status, session }
const { normalizePhone, handleOptions, error, ok, getTwilioClient, getVerifyServiceSid } = require('./_utils');

exports.handler = async (event) => {
  const opt = handleOptions(event); if (opt) return opt;
  if (event.httpMethod !== 'POST') return error(405, 'Method not allowed');
  let body; try { body = JSON.parse(event.body || '{}'); } catch { return error(400, 'Invalid JSON'); }
  const phone = normalizePhone(body.phone);
  const code = body.code && String(body.code).trim();
  if (!phone) return error(400, 'Invalid phone');
  if (!code || code.length < 4 || code.length > 10) return error(400, 'Invalid code');

  const twilio = getTwilioClient();
  const serviceSid = getVerifyServiceSid();
  if (!twilio || !serviceSid) return error(500, 'Verify not configured');
  try {
    const check = await twilio.verify.v2.services(serviceSid).verificationChecks.create({ to: phone, code });
    if (check.status !== 'approved') {
      return error(400, 'Invalid or expired code', { status: check.status });
    }
    const session = { phone, verified: true, issued_at: Date.now(), expires_in: 600 };
    return ok({ success: true, status: check.status, session });
  } catch (e) {
    console.error('Verify check failed', e.message, e.code);
    return error(500, 'Verification check failed', { code: e.code });
  }
};
