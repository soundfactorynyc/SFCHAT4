// Test verification function that bypasses Twilio for debugging
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

    // Mock verification - accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return jsonRes(event, { ok: false, error: 'Code must be 6 digits' }, 400);
    }

    // For testing, accept code "123456" or any code ending in "99"
    const isValid = code === '123456' || code.endsWith('99');
    
    if (!isValid) {
      return jsonRes(event, { ok: false, error: 'Invalid test code. Use 123456 or any code ending in 99.' }, 400);
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return jsonRes(event, { error: 'Missing JWT_SECRET' }, 500);
    }

    const token = signJwt({ sub: phone }, jwtSecret, 60 * 60); // 1h
    return jsonRes(event, { ok: true, token, phone, debug: 'test-mode' });
    
  } catch (err) {
    console.error('Test verify error:', err);
    return jsonRes(event, { error: err.message || 'Verification failed' }, 500);
  }
}