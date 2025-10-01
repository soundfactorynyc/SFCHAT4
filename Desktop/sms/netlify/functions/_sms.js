// netlify/functions/_sms.js
// SMS helpers: standardized templates, GSM-7 normalization, OTP storage, Twilio fallback sender
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

// Basic GSM-7 normalization: strip/replace common non-GSM chars
const REPLACEMENTS = new Map([
  ['“','"'], ['”','"'], ['‘','\''], ['’','\''], ['–','-'], ['—','-'], ['…','...'], ['•','*'],
  ['·','*'], ['•','*'], ['®','(R)'], ['™','(TM)'], ['©','(C)'], ['·','*']
]);

export function normalizeGSM(text = '') {
  let s = String(text);
  // Replace mapped chars
  for (const [from, to] of REPLACEMENTS.entries()) s = s.split(from).join(to);
  // Remove emojis and non-BMP as a coarse fallback
  s = s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
  // Remove other non-GSM-ish characters (keep basic latin, common punct)
  s = s.replace(/[^\x20-\x7E\n]/g, '');
  return s;
}

export function detectEncodingAndSegments(text = '') {
  // Very rough detection: if any non-basic-latin remains, treat as UCS-2
  const isBasicLatin = /^[\x00-\x7F\n\r\t]*$/.test(text);
  const encoding = isBasicLatin ? 'GSM-7' : 'UCS-2';
  const len = text.length;
  const perSeg = encoding === 'GSM-7' ? 160 : 70;
  const perConcat = encoding === 'GSM-7' ? 153 : 67;
  const segments = len <= perSeg ? 1 : Math.ceil(len / perConcat);
  return { encoding, segments };
}

const BRAND = 'Sound Factory';

// Message templates (must remain GSM-7 compatible after normalization)
const TEMPLATES = {
  otp_v1: ({ code, ttlMin }) => `${BRAND}: Your code is ${code}. Expires in ${ttlMin} min. Reply STOP to opt out.`,
  otp_ultra: ({ code }) => `${BRAND}: ${code} is your code. Reply STOP to opt out.`,
};

export function renderTemplate(name, vars) {
  const fn = TEMPLATES[name] || TEMPLATES.otp_v1;
  const raw = fn(vars || {});
  const gsm = normalizeGSM(raw);
  const info = detectEncodingAndSegments(gsm);
  // If not GSM-7 or too many segments, fallback to ultra-short
  if (info.encoding !== 'GSM-7' || info.segments > 2) {
    const alt = normalizeGSM(TEMPLATES.otp_ultra(vars || {}));
    return { body: alt, meta: detectEncodingAndSegments(alt) };
  }
  return { body: gsm, meta: info };
}

export function generateOtp(digits = 6) {
  const max = 10 ** digits;
  const num = crypto.randomInt(0, max).toString().padStart(digits, '0');
  return num;
}

const OTP_TTL_SEC = 10 * 60; // 10 minutes

export async function saveOtp(phone, code, ttlSec = OTP_TTL_SEC) {
  const store = getStore('otp');
  const key = `otp:phone:${phone}`;
  const now = Date.now();
  const data = {
    code,
    attempts: 0,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlSec * 1000).toISOString(),
  };
  await store.set(key, JSON.stringify(data), { contentType: 'application/json' });
  return data;
}

export async function readOtp(phone) {
  const store = getStore('otp');
  const key = `otp:phone:${phone}`;
  const json = await store.get(key, { type: 'json' });
  return json || null;
}

export async function clearOtp(phone) {
  const store = getStore('otp');
  const key = `otp:phone:${phone}`;
  await store.delete(key).catch(() => {});
}

export async function twilioSendSMS(client, fromNumber, to, body) {
  if (!fromNumber) throw new Error('Missing TWILIO_PHONE_NUMBER for fallback SMS');
  const res = await client.messages.create({ from: fromNumber, to, body });
  return res;
}
