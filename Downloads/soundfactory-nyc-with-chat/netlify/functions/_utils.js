// Shared utilities for Netlify Functions (Twilio Verify + legacy SMS)
// Provides: phone normalization, JSON helpers, CORS, Twilio client caching

const crypto = require('crypto');

function getEnv(name, fallback) {
  return process.env[name] || fallback;
}

// Robust phone normalization (must match other functions to keep consistent UX)
function normalizePhone(raw) {
  if (raw == null) return null;
  let p = String(raw).trim();
  if (!p) return null;
  if (p.startsWith('00')) p = '+' + p.slice(2);
  p = p.replace(/[\s().-]/g, '');
  if (p[0] === '+') {
    if (!/^\+\d+$/.test(p)) {
      const digits = p.replace(/\D/g, '');
      p = '+' + digits;
    }
  } else {
    const digits = p.replace(/\D/g, '');
    if (digits.length === 10) p = '+1' + digits; // Assume NANP
    else if (digits.length === 11 && digits.startsWith('1')) p = '+' + digits;
    else if (digits.length >= 8 && digits.length <= 15) p = '+' + digits;
    else return null;
  }
  if (!/^\+\d{8,15}$/.test(p)) return null;
  return p;
}

function json(statusCode, obj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      ...extraHeaders
    },
    body: JSON.stringify(obj)
  };
}

function error(statusCode, message, extras) {
  return json(statusCode, { error: message, ...(extras || {}) });
}

function ok(obj) { return json(200, obj); }

function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }
  return null;
}

let _twilioClient = null;
function getTwilioClient() {
  if (_twilioClient) return _twilioClient;
  const sid = getEnv('TWILIO_ACCOUNT_SID');
  const token = getEnv('TWILIO_AUTH_TOKEN');
  if (!(sid && token)) return null;
  try {
    _twilioClient = require('twilio')(sid, token);
  } catch (e) {
    console.error('Failed to init Twilio client', e.message);
    return null;
  }
  return _twilioClient;
}

function getVerifyServiceSid() {
  return getEnv('TWILIO_VERIFY_SERVICE_SID') || getEnv('TWILIO_VERIFY_SERVICE') || null;
}

function randomId(prefix = 'evt') {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

module.exports = {
  getEnv,
  normalizePhone,
  json,
  error,
  ok,
  handleOptions,
  getTwilioClient,
  getVerifyServiceSid,
  randomId
};
