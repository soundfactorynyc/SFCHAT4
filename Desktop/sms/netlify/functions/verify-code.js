import { preflight, json as jsonRes, signJwt, toE164, setAuthCookie } from './_utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  if (event.httpMethod !== 'POST') return jsonRes(event, { error: 'Method Not Allowed' }, 405);

  try {
    const body = JSON.parse(event.body || '{}');
    const phoneRaw = body.phone || body.phoneNumber || body.to;
    const code = body.code || body.verificationCode;
    const country = body.country;

    if (!phoneRaw || !code) return jsonRes(event, { error: 'Missing phone or code' }, 400);

    const defaultCountry = country || process.env.DEFAULT_COUNTRY || 'US';
    const phone = toE164(phoneRaw, defaultCountry);
    if (!phone) return jsonRes(event, { error: 'Invalid phone format. Use +16464664925.' }, 400);

    // ========================================
    // 🎯 DEMO MODE - Works without Twilio
    // ========================================
    const USE_DEMO_MODE = process.env.SMS_DEMO_MODE !== 'false'; // Default to demo mode
    if (USE_DEMO_MODE) {
      const isValid = /^\d{6}$/.test(String(code).trim());
      if (!isValid) return jsonRes(event, { ok: false, error: 'Invalid code format' }, 400);

      console.log(`✅ DEMO verify successful for ${phone} with code ${code}`);
      const token = signJwt({ sub: phone }, process.env.JWT_SECRET || 'demo-secret-key', 60 * 60); // 1h
      const extra = setAuthCookie({}, token, 3600);
      return jsonRes(
        event,
        { ok: true, success: true, token, sessionToken: token, phone, message: 'Demo verification successful' },
        200,
        extra
      );
    }

    // ========================================
    // 🔒 PRODUCTION MODE - Real Twilio
    // ========================================
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID)
      return jsonRes(event, { error: 'Missing Twilio env vars' }, 500);

    const twilioModule = await import('twilio');
    const twilio = twilioModule.default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const result = await client.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code: String(code).trim() });

    if (!result || result.status !== 'approved') {
      return jsonRes(event, { error: 'Invalid code', status: result?.status || 'unknown' }, 401);
    }

    const token = signJwt({ sub: phone }, process.env.JWT_SECRET, 60 * 60);
    const extra = setAuthCookie({}, token, 3600);
    return jsonRes(event, { ok: true, success: true, token, sessionToken: token, phone }, 200, extra);
  } catch (err) {
    console.error('verify-code error:', err);
    const tw = err && typeof err === 'object' ? err : {};
    return jsonRes(event, { error: tw.message || 'Verification failed', code: tw.code || null, moreInfo: tw.moreInfo || null }, 500);
  }
}
