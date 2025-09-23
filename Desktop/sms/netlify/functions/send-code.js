import twilio from 'twilio';
import { preflight, json as jsonRes, toE164 } from './_utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  if (event.httpMethod !== 'POST') return jsonRes(event, { error: 'Method Not Allowed' }, 405);

  try {
    const body = JSON.parse(event.body || '{}');
    const phoneRaw = body.phone;
    const defaultCountry = body.country || process.env.DEFAULT_COUNTRY || 'US';
    if (!phoneRaw) return jsonRes(event, { error: 'Missing phone' }, 400);

    const phone = toE164(phoneRaw, defaultCountry);
    if (!phone) return jsonRes(event, { error: 'Invalid phone format. Use +16464664925.' }, 400);

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID)
      return jsonRes(event, { error: 'Missing Twilio env vars' }, 500);

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create({ to: phone, channel: 'sms' });

    return jsonRes(event, { ok: true, to: phone });
  } catch (err) {
    const tw = err && typeof err === 'object' ? err : {};
    return jsonRes(
      event,
      { error: tw.message || 'Failed to send code', code: tw.code || null, moreInfo: tw.moreInfo || null },
      500
    );
  }
}
