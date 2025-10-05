// Netlify Function: send-sms
// Responsibilities:
// 1. Normalize & validate phone (basic E.164 US-first strategy)
// 2. Rate limit per phone & IP (lightweight in-memory; recommend Redis/Upstash for scale)
// 3. Generate 6-digit code (crypto), hash & store (Supabase optional TODO; using ephemeral map fallback)
// 4. Send via SMS provider (Twilio if configured). In demo mode returns demo_code (NON-PROD ONLY)
// 5. Never log raw code in production

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// In-memory ephemeral store (cold start resets); for production replace with persistent table
const ephemeralStore = {
  codes: new Map(), // key: phone, value: { codeHash, expiresAt, attempts, lastSentAt }
  ipCounters: new Map() // key: ip, value: { count, windowStart }
};

const WINDOW_MS = 60_000; // 1 minute window for simple IP rate limit
const MAX_PER_WINDOW = 8; // max requests per IP per minute
const MAX_SENDS_PER_PHONE_HOURLY = 6;
const CODE_TTL_MS = 10 * 60_000; // 10 minutes

function getEnv(name, fallback) {
  return process.env[name] || fallback;
}

const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

const TWILIO_SID = getEnv('TWILIO_ACCOUNT_SID');
const TWILIO_TOKEN = getEnv('TWILIO_AUTH_TOKEN');
// Allow fallback to TWILIO_PHONE_NUMBER for backwards compatibility
const TWILIO_FROM = getEnv('TWILIO_FROM') || getEnv('TWILIO_PHONE_NUMBER');
// Support Messaging Service SID (preferred for production scaling)
const TWILIO_MESSAGING_SERVICE_SID = getEnv('TWILIO_MESSAGING_SERVICE_SID');
const SMS_DEBUG = getEnv('SMS_DEBUG') === 'true';
const FALLBACK_SUPABASE_OTP = getEnv('FALLBACK_SUPABASE_OTP') === 'true';

let twilioClient = null;
if (TWILIO_SID && TWILIO_TOKEN) {
  try { twilioClient = require('twilio')(TWILIO_SID, TWILIO_TOKEN); } catch(e) { /* ignore */ }
}

// More robust phone normalization aiming for E.164. Strategy:
// 1. Trim & handle leading 00 -> +
// 2. Strip common formatting chars (space, (), -, .)
// 3. If no leading + treat as national/ambiguous:
//    - 10 digits -> assume NANP +1
//    - 11 digits & starts with 1 -> +1XXXXXXXXXX
//    - 8-15 digits -> assume already includes country code -> prepend +
// 4. Validate final length (8-15 digits after +)
// Returns null on failure.
function normalizePhone(raw) {
  if (raw == null) return null;
  let p = String(raw).trim();
  if (!p) return null;
  if (p.startsWith('00')) p = '+' + p.slice(2); // convert international prefix
  // Remove formatting artifacts
  p = p.replace(/[\s().-]/g, '');
  // If it already starts with + ensure only digits follow; if not, rebuild
  if (p[0] === '+') {
    if (!/^\+\d+$/.test(p)) {
      // salvage digits
      const digits = p.replace(/\D/g, '');
      p = '+' + digits;
    }
  } else {
    const digits = p.replace(/\D/g, '');
    if (digits.length === 10) {
      p = '+1' + digits; // NANP assumption
    } else if (digits.length === 11 && digits.startsWith('1')) {
      p = '+' + digits; // leading country code 1
    } else if (digits.length >= 8 && digits.length <= 15) {
      p = '+' + digits; // assume already includes CC
    } else {
      return null;
    }
  }
  if (!/^\+\d{8,15}$/.test(p)) return null;
  return p;
}

function rateLimitIP(ip) {
  if (!ip) return true;
  const now = Date.now();
  const entry = ephemeralStore.ipCounters.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  ephemeralStore.ipCounters.set(ip, entry);
  return entry.count <= MAX_PER_WINDOW;
}

function canSendPhone(phone) {
  const existing = ephemeralStore.codes.get(phone);
  if (!existing) return true;
  // limit hourly sends - approximate: if lastSentAt older than 1h reset counter
  if (!existing.hourWindowStart || Date.now() - existing.hourWindowStart > 3600_000) {
    existing.hourWindowStart = Date.now();
    existing.hourlyCount = 0;
  }
  if ((existing.hourlyCount || 0) >= MAX_SENDS_PER_PHONE_HOURLY) return false;
  return true;
}

function recordPhoneSend(phone) {
  const existing = ephemeralStore.codes.get(phone) || {};
  if (!existing.hourWindowStart || Date.now() - existing.hourWindowStart > 3600_000) {
    existing.hourWindowStart = Date.now();
    existing.hourlyCount = 0;
  }
  existing.hourlyCount = (existing.hourlyCount || 0) + 1;
  ephemeralStore.codes.set(phone, existing);
}

function generateCode() {
  const num = crypto.randomInt(0, 1_000_000); // 0 - 999999
  return num.toString().padStart(6, '0');
}

function hashCode(code, phone) {
  return crypto.createHash('sha256').update(code + ':' + phone + ':' + (process.env.SMS_PEPPER || 'pepper')).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  const rawPhone = body.phone;
  const ip = event.headers['x-forwarded-for']?.split(',')[0].trim();

  if (!rateLimitIP(ip)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
  }
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid phone format' }) };
  }
  if (!canSendPhone(phone)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Send limit reached, try later' }) };
  }

  const code = generateCode();
  const codeHash = hashCode(code, phone);
  const record = ephemeralStore.codes.get(phone) || { attempts: 0 };
  record.codeHash = codeHash;
  record.expiresAt = Date.now() + CODE_TTL_MS;
  record.attempts = 0;
  record.lastSentAt = Date.now();
  ephemeralStore.codes.set(phone, record);
  recordPhoneSend(phone);

  // If configured to fallback, skip Twilio entirely
  if (FALLBACK_SUPABASE_OTP) {
    return { statusCode: 200, body: JSON.stringify({ success: false, fallback: 'supabase', message: 'Twilio bypassed (fallback mode)', phone, sms: 'fallback' }) };
  }

  let smsResult = 'skipped';
  const demoMode = !twilioClient;
  let twilioAttempted = false;
  let twilioFailed = false;
  if (!demoMode) {
    // Build Twilio message params with fallbacks
    if (!TWILIO_FROM && !TWILIO_MESSAGING_SERVICE_SID) {
      console.error('Twilio configuration missing: need TWILIO_FROM (or TWILIO_PHONE_NUMBER) or TWILIO_MESSAGING_SERVICE_SID');
      return { statusCode: 500, body: JSON.stringify({ error: 'SMS not configured' }) };
    }
    const msgParams = { to: phone, body: `Your Sound Factory code: ${code}` };
    if (TWILIO_MESSAGING_SERVICE_SID) msgParams.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    else msgParams.from = TWILIO_FROM;
    try {
      twilioAttempted = true;
      const twilioResp = await twilioClient.messages.create(msgParams);
      smsResult = 'sent';
      if (SMS_DEBUG) console.log('Twilio message SID', twilioResp.sid);
    } catch (e) {
      console.error('Twilio send failed', e.message, e.code, e.status);
      twilioFailed = true;
      if (!FALLBACK_SUPABASE_OTP) {
        const payload = { error: 'Failed to dispatch SMS' };
        if (SMS_DEBUG) {
          payload.twilio = { code: e.code, status: e.status, message: e.message };
        }
        return { statusCode: 500, body: JSON.stringify(payload) };
      }
    }
  }

  // If Twilio failed and fallback enabled, trigger Supabase OTP (requires service role)
  if (twilioFailed && FALLBACK_SUPABASE_OTP && supabase && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      // Use Auth admin API to send OTP (Supabase JS v2: auth.admin.generateLink not ideal; use REST direct)
      // We can call the public OTP endpoint if anon key were available here, but we avoid leaking anon in function logs.
      // Instead instruct client to use Supabase OTP route.
      return { statusCode: 200, body: JSON.stringify({ success: false, fallback: 'supabase', message: 'Use Supabase OTP flow', phone, sms: 'fallback' }) };
    } catch (e) {
      console.error('Supabase fallback failed', e.message);
      return { statusCode: 500, body: JSON.stringify({ error: 'All SMS providers failed' }) };
    }
  }

  // Optionally persist to Supabase table if configured
  if (supabase) {
    try {
      // Insert new verification row with attempts=0
      await supabase.from('phone_verifications').insert({ phone, code_hash: codeHash, expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(), attempts: 0 });
      // Optional cleanup: remove older unconsumed rows beyond 3 for this phone to prevent accumulation
      await supabase.rpc('cleanup_old_phone_verifications', { p_phone: phone, p_keep: 3 }).catch(()=>{});
    } catch (e) {
      console.warn('Supabase insert failed (non-fatal)', e.message);
    }
  }

  const response = { success: true, expires_in: CODE_TTL_MS / 1000, sms: smsResult, provider: twilioAttempted ? (twilioFailed ? 'fallback' : 'twilio') : 'demo' };
  if (demoMode && process.env.ALLOW_DEMO_CODES !== 'false') {
    response.demo_code = code; // DO NOT enable in production
  }
  return { statusCode: 200, body: JSON.stringify(response) };
};
