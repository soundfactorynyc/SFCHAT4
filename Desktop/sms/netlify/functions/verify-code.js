import { preflight, json as jsonRes, signJwt, toE164, setAuthCookie } from './_utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  if (event.httpMethod !== 'POST') return jsonRes(event, { error: 'Method Not Allowed' }, 405);

  try {
    const body = JSON.parse(event.body || '{}');
    const phoneRaw = body.phone || body.phoneNumber;
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
      // In demo mode, accept any 6-digit code
      const isValid = /^\d{6}$/.test(code);
      
      if (isValid) {
        console.log(`✅ DEMO verify successful for ${phone} with code ${code}`);
        const token = signJwt({ sub: phone }, process.env.JWT_SECRET || 'demo-secret-key', 60 * 60); // 1h
        const extra = setAuthCookie({}, token, 3600);
        
        return jsonRes(event, {
          ok: true,
          success: true,
          token,
          sessionToken: token,
          phone,
          message: 'Demo verification successful'
        }, 200, extra);
      } else {
        console.log(`❌ DEMO verify failed for ${phone} - invalid code format`);
        return jsonRes(event, { ok: false, success: false, error: 'Invalid code - must be 6 digits' }, 400);
      }
    }

    // ========================================
    // 🔒 PRODUCTION MODE - Real Twilio
    // ========================================
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SID;

    if (!accountSid || !authToken || !verifySid) return jsonRes(event, { error: 'Missing Twilio env vars' }, 500);

    // Dynamically import twilio only when needed
    const twilioModule = await import('twilio');
    const twilio = twilioModule.default;
    const client = twilio(accountSid, authToken);

    const result = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phone, code });

    const ok = result.status === 'approved';
    if (!ok) return jsonRes(event, { ok: false, success: false, error: 'Invalid code' }, 400);
    
    const token = signJwt({ sub: phone }, process.env.JWT_SECRET, 60 * 60); // 1h
    const extra = setAuthCookie({}, token, 3600);
    return jsonRes(event, { ok: true, success: true, token, sessionToken: token, phone }, 200, extra);
    
  } catch (err) {
    console.error('verify-code error:', err);
    const tw = err && typeof err === 'object' ? err : {};
    return jsonRes(event, { error: tw.message || 'Verification failed', code: tw.code || null, moreInfo: tw.moreInfo || null }, 500);
  }
}
