// Shared utilities for Netlify functions (CORS + JWT)
import crypto from 'node:crypto';

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || '*';
  if (raw.trim() === '*' || raw.trim() === '') return '*';
  return raw
    .split(/[\s,]+/)
    .map((o) => o.trim())
    .filter(Boolean);
}

function getOrigin(event) {
  const h = event?.headers || {};
  return h.origin || h.Origin || '';
}

export function getCorsHeaders(event) {
  const allow = parseAllowedOrigins();
  const origin = getOrigin(event);

  let allowOrigin = '*';
  if (Array.isArray(allow)) {
    // exact or wildcard match support (e.g., https://*.example.com)
    const matches = (pattern, value) => {
      if (!pattern || !value) return false;
      if (pattern === value) return true;
      if (!pattern.includes('*')) return false;
      // Escape regex special chars except *
      const esc = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
      const re = new RegExp(`^${esc}$`);
      return re.test(value);
    };
    const hit = allow.find((p) => matches(p, origin));
    allowOrigin = hit ? origin : (allow[0] || 'null');
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin'
  };
}

export function preflight(event) {
  const allow = parseAllowedOrigins();
  const origin = getOrigin(event);
  const strict = String(process.env.CORS_STRICT || '').toLowerCase() === 'true';

  if (strict && Array.isArray(allow) && origin && !allow.includes(origin)) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json', Vary: 'Origin', 'Access-Control-Allow-Origin': 'null' },
      body: JSON.stringify({ error: 'Origin not allowed' })
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    // Return 200 for preflight to match stricter CORS clients
    return { statusCode: 200, headers: getCorsHeaders(event), body: '' };
  }
  return null;
}

export function json(event, body, statusCode = 200, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event), ...extraHeaders },
    body: JSON.stringify(body)
  };
}

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(payload, secret, expiresInSec = 3600) {
  if (!secret) throw new Error('Missing JWT_SECRET');
  const header = { alg: 'HS256', typ: 'JWT' };

  const now = Math.floor(Date.now() / 1000);
  const claims = { iat: now, exp: now + expiresInSec, ...payload };

  const encodedHeader = b64url(JSON.stringify(header));
  const encodedPayload = b64url(JSON.stringify(claims));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

function b64urlToBuffer(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return Buffer.from(str, 'base64');
}

export function verifyJwt(token, secret) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const data = `${h}.${p}`;
    const expected = crypto
      .createHmac('sha256', String(secret || ''))
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (s !== expected) return null;
    const payload = JSON.parse(b64urlToBuffer(p).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// --- Additional helpers used by functions ---
// Set a short-lived auth cookie (HttpOnly, Secure, SameSite=Lax)
export function setAuthCookie(headers, token, maxAgeSec = 3600) {
  const h = headers || {};
  if (!token) return h;
  const parts = [
    `sf_token=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/'
  ];
  if (maxAgeSec && Number.isFinite(maxAgeSec)) parts.push(`Max-Age=${Math.floor(maxAgeSec)}`);
  // Add Secure in non-http environments; Netlify prod is HTTPS. For local http, browsers ignore Secure.
  parts.push('Secure');
  h['Set-Cookie'] = parts.join('; ');
  return h;
}

// Normalize phone to E.164. Supports basic US defaults.
// Example inputs: "+16464664925", "(646) 466-4925", "6464664925" -> "+16464664925"
export function toE164(input, defaultCountry = 'US') {
  if (!input) return null;
  let s = String(input).trim();
  // allow leading +, strip other non-digits
  s = s.replace(/(?!^\+)[^\d]/g, '');
  if (s.startsWith('+')) {
    const digits = s.slice(1).replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return null;
    return '+' + digits;
  }
  const digits = s.replace(/\D/g, '');
  if (defaultCountry.toUpperCase() === 'US') {
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    return null;
  }
  return null;
}
