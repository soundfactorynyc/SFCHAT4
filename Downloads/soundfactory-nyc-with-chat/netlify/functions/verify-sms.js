// Netlify Function: verify-sms
// Validates a submitted phone + code against ephemeral store and (optionally) Supabase table.
// On success: marks consumed (ephemeral + supabase) and returns lightweight session payload.

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const ephemeralStore = require('./send-sms').ephemeralStore || null; // not exported currently; fallback to local map
// Because we didn't export ephemeral store above, we'll maintain our own process-level cache here too.
const localCache = { codes: new Map() };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

const CODE_TTL_MS = 10 * 60_000; // must match send-sms
const MAX_ATTEMPTS = 5;

// Mirror normalization logic from send-sms (keep in sync if updated)
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
    if (digits.length === 10) {
      p = '+1' + digits;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      p = '+' + digits;
    } else if (digits.length >= 8 && digits.length <= 15) {
      p = '+' + digits;
    } else {
      return null;
    }
  }
  if (!/^\+\d{8,15}$/.test(p)) return null;
  return p;
}

function hashCode(code, phone) {
  return crypto.createHash('sha256').update(code + ':' + phone + ':' + (process.env.SMS_PEPPER || 'pepper')).digest('hex');
}

async function fetchLatestFromSupabase(phone) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('phone_verifications')
    .select('*')
    .eq('phone', phone)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) { console.warn('Supabase fetch error', error.message); return null; }
  return data && data.length ? data[0] : null;
}

async function consumeSupabaseRow(id) {
  if (!supabase) return;
  try {
    await supabase.from('phone_verifications').update({ consumed_at: new Date().toISOString() }).eq('id', id);
  } catch (e) { console.warn('Supabase consume failed', e.message); }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  const { phone: rawPhone, code } = body;
  if (!code || typeof code !== 'string' || code.length !== 6) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code' }) };
  }
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid phone format' }) };
  }

  const submittedHash = hashCode(code, phone);

  // Check ephemeral first (if available)
  let rec = ephemeralStore?.codes?.get(phone) || localCache.codes.get(phone);

  // If nothing ephemeral and supabase exists, attempt fetch
  let supabaseRow = null;
  if (!rec && supabase) {
    supabaseRow = await fetchLatestFromSupabase(phone);
    if (supabaseRow) {
      rec = {
        codeHash: supabaseRow.code_hash,
        expiresAt: new Date(supabaseRow.expires_at).getTime(),
        attempts: supabaseRow.attempts || 0
      };
      localCache.codes.set(phone, rec);
    }
  }

  if (!rec) {
    // Uniform response to avoid enumeration
    await new Promise(r => setTimeout(r, 150));
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code or expired' }) };
  }

  if (Date.now() > rec.expiresAt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code or expired' }) };
  }

  if (rec.attempts >= MAX_ATTEMPTS) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many attempts' }) };
  }

  rec.attempts = (rec.attempts || 0) + 1;

  if (submittedHash !== rec.codeHash) {
    // Store back attempts locally
    localCache.codes.set(phone, rec);
    // Persist attempt increment if we have a Supabase row
    if (supabase && !supabaseRow) {
      // If row not previously fetched (ephemeral path), try to fetch now for update
      supabaseRow = await fetchLatestFromSupabase(phone);
    }
    if (supabase && supabaseRow) {
      try {
        await supabase.from('phone_verifications')
          .update({ attempts: rec.attempts })
          .eq('id', supabaseRow.id)
          .is('consumed_at', null);
      } catch(e) { console.warn('Attempt update failed', e.message); }
    }
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code or expired' }) };
  }

  // Success
  rec.consumed = true;
  localCache.codes.delete(phone);
  ephemeralStore?.codes?.delete(phone);

  if (supabase) {
    // Ensure we have row reference
    if (!supabaseRow) {
      supabaseRow = await fetchLatestFromSupabase(phone);
    }
    if (supabaseRow) {
      try {
        await supabase.from('phone_verifications')
          .update({ consumed_at: new Date().toISOString(), attempts: rec.attempts })
          .eq('id', supabaseRow.id)
          .is('consumed_at', null);
      } catch(e) { console.warn('Consume update failed', e.message); }
    }
  }

  // TODO: Optional: create a supabase profile / user row or issue JWT.
  // For now return minimal session object (client stores locally)
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      session: {
        phone,
        verified: true,
        issued_at: Date.now(),
        expires_in: CODE_TTL_MS / 1000
      }
    })
  };
};
