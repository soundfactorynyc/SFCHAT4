import twilio from 'twilio';
import { preflight, json as jsonRes, signJwt, toE164 } from './_utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  if (event.httpMethod !== 'POST') return jsonRes(event, { error: 'Method Not Allowed' }, 405);

  try {
    const { phone: phoneRaw, code, country } = JSON.parse(event.body || '{}');
    if (!phoneRaw || !code) return jsonRes(event, { error: 'Missing phone or code' }, 400);
    const defaultCountry = country || process.env.DEFAULT_COUNTRY || 'US';
    const phone = toE164(phoneRaw, defaultCountry);
    if (!phone) return jsonRes(event, { error: 'Invalid phone format. Use +16464664925.' }, 400);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SID;

  if (!accountSid || !authToken || !verifySid) return jsonRes(event, { error: 'Missing Twilio env vars' }, 500);

    const client = twilio(accountSid, authToken);

    const result = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phone, code });

  const ok = result.status === 'approved';
  if (!ok) return jsonRes(event, { ok: false, error: 'Invalid code' }, 400);
  const token = signJwt({ sub: phone }, process.env.JWT_SECRET, 60 * 60); // 1h
  return jsonRes(event, { ok: true, token, phone });
  } catch (err) {
  const tw = err && typeof err === 'object' ? err : {};
  return jsonRes(event, { error: tw.message || 'Verification failed', code: tw.code || null, moreInfo: tw.moreInfo || null }, 500);
  }
}
