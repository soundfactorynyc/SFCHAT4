// Test send function that returns success without actually sending SMS
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

    // Mock success - don't actually send SMS
    return jsonRes(event, { 
      ok: true, 
      to: phone,
      debug: 'test-mode',
      message: 'Test mode: Use code 123456 or any code ending in 99'
    });
    
  } catch (err) {
    console.error('Test send error:', err);
    return jsonRes(event, { error: err.message || 'Failed to send code' }, 500);
  }
}