// Generic Twilio message sender (non-verify) - optional utility for admin messaging
// POST { to, body }
const { normalizePhone, handleOptions, error, ok, getTwilioClient } = require('./_utils');

exports.handler = async (event) => {
  const opt = handleOptions(event); if (opt) return opt;
  if (event.httpMethod !== 'POST') return error(405, 'Method not allowed');
  let body; try { body = JSON.parse(event.body || '{}'); } catch { return error(400, 'Invalid JSON'); }
  const to = normalizePhone(body.to);
  const msgBody = body.body && String(body.body).slice(0, 500);
  if (!to) return error(400, 'Invalid phone');
  if (!msgBody) return error(400, 'Missing body');
  const twilio = getTwilioClient();
  if (!twilio) return error(500, 'Twilio not configured');
  const from = process.env.TWILIO_FROM || process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!from && !messagingServiceSid) return error(500, 'Missing FROM or messaging service');
  try {
    const params = { to, body: msgBody };
    if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid; else params.from = from;
    const resp = await twilio.messages.create(params);
    return ok({ success: true, sid: resp.sid });
  } catch (e) {
    console.error('Send message failed', e.message, e.code);
    return error(500, 'Failed to send message', { code: e.code });
  }
};
