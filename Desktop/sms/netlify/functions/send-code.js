import { preflight, json as jsonRes, toE164 } from './_utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  if (event.httpMethod !== 'POST') return jsonRes(event, { error: 'Method Not Allowed' }, 405);

  try {
    const body = JSON.parse(event.body || '{}');
    const phoneRaw = body.phone || body.phoneNumber || body.to;
    const defaultCountry = body.country || process.env.DEFAULT_COUNTRY || 'US';
    if (!phoneRaw) return jsonRes(event, { error: 'Missing phone' }, 400);

    const phone = toE164(phoneRaw, defaultCountry);
    if (!phone) return jsonRes(event, { error: 'Invalid phone format. Use +16464664925.' }, 400);

    // ========================================
    // 🎯 DEMO MODE - Works without Twilio
    // ========================================
    const USE_DEMO_MODE = process.env.SMS_DEMO_MODE !== 'false'; // Default to demo mode
    
    if (USE_DEMO_MODE) {
      const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`📱 DEMO SMS sent to ${phone} - Code: ${demoCode}`);
      
      return jsonRes(event, {
        ok: true,
        success: true,
        to: phone,
        phone: phone,
        code: demoCode,
        demo_code: demoCode,
        message: `Demo mode: Use code ${demoCode}`
      });
    }
    
    // Demo mode: skip Twilio and pretend to send
    if (String(process.env.VERIFY_DEMO || '').toLowerCase() === 'true') {
      return jsonRes(event, { ok: true, to: phone, demo: true });
    }
    
    // ========================================
    // 🔒 PRODUCTION MODE - Real Twilio
    // ========================================
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID)
      return jsonRes(event, { error: 'Missing Twilio env vars' }, 500);

    // Dynamically import twilio only when needed
    const twilioModule = await import('twilio');
    const twilio = twilioModule.default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create({ to: phone, channel: 'sms' });

    return jsonRes(event, { ok: true, success: true, to: phone, phone: phone });
  } catch (err) {
    console.error('send-code error:', err);
    const tw = err && typeof err === 'object' ? err : {};
    return jsonRes(
      event,
      { error: tw.message || 'Failed to send code', code: tw.code || null, moreInfo: tw.moreInfo || null },
      500
    );
  }
}
