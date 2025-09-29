// Fans API: single/bulk upsert, list/export, and email cleaning
// Endpoints (Netlify Functions):
// - GET    /.netlify/functions/fans?limit=1000&format=json|csv&audience_bucket=core|probation&consent=true|false&source=...&platform=...&email_status=...
//          Auth: Bearer FANS_ADMIN_TOKEN (or PROMO_ADMIN_TOKEN). Returns list or CSV.
// - POST   /.netlify/functions/fans            { phone|email, name?, platform?, source?, invite_code?|ref|ref_code, utm_*?, consent? }
//          Public consent-first upsert. Upserts by phone or email.
// - POST   /.netlify/functions/fans { mode: "bulk", items:[{...}] }
//          Admin only. Bulk upsert to a chosen audience (defaults: consent=false -> probation).
// - POST   /.netlify/functions/fans { mode: "clean", bucket?:"probation", limit?:500, ids?:[id...] }
//          Admin only. Runs syntax+MX checks and records email_status.

import { getAdminClient } from './lib/supabase.mjs';
import dns from 'node:dns/promises';

function cors(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

function hasAuth(event) {
  const required = process.env.FANS_ADMIN_TOKEN || process.env.PROMO_ADMIN_TOKEN || '';
  if (!required) return true;
  const token = (event.headers?.authorization || '').replace(/^Bearer\s+/i, '') || '';
  return token === required;
}

function normalizeFan(input) {
  const u = input.utm || {};
  const invite_code = input.invite_code || input.ref || input.ref_code || null;
  const consent = input.consent === true || input.consent_sms === true;
  const platform = input.platform || null;
  const source = input.source || null;
  const now = new Date().toISOString();
  const values = {
    phone: (input.phone || '').trim() || null,
    email: (input.email || '').trim() || null,
    name: (input.name || '').trim() || null,
    platform,
    source,
    invite_code,
    utm_source: input.utm_source || u.utm_source || u.source || null,
    utm_medium: input.utm_medium || u.utm_medium || u.medium || null,
    utm_campaign: input.utm_campaign || u.utm_campaign || u.campaign || null,
    utm_term: input.utm_term || u.utm_term || u.term || null,
    utm_content: input.utm_content || u.utm_content || u.content || null,
    consent: !!consent,
    updated_at: now
  };
  if (values.consent) values.consent_ts = now;
  const bucket = input.audience_bucket || (values.consent ? 'core' : 'probation');
  values.audience_bucket = bucket;
  return values;
}

function validEmailSyntax(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email);
}

async function checkEmailMX(email) {
  try {
    if (!validEmailSyntax(email)) return { status: 'invalid_syntax' };
    const domain = email.split('@')[1].toLowerCase();
    const mx = await dns.resolveMx(domain);
    if (Array.isArray(mx) && mx.length > 0) return { status: 'valid_mx' };
    return { status: 'no_mx' };
  } catch {
    return { status: 'no_mx' };
  }
}

export async function handler(event) {
  const headers = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  const supa = getAdminClient();
  if (!supa) return { statusCode: 500, headers, body: JSON.stringify({ error: 'no-supabase' }) };

  const url = new URL(event.rawUrl || (process.env.URL || 'http://localhost') + event.path);
  const q = url.searchParams;

  try {
    // Admin list/export
    if (event.httpMethod === 'GET') {
      if (!hasAuth(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'unauthorized' }) };
      const format = (q.get('format') || 'json').toLowerCase();
      const limit = Math.min(parseInt(q.get('limit') || '1000', 10), 5000);
      let sel = supa.from('fans').select('*').order('updated_at', { ascending: false }).limit(limit);
      const filters = ['consent','source','platform','audience_bucket','email_status'];
      for (const f of filters) {
        const v = q.get(f);
        if (v != null) sel = sel.eq(f, f === 'consent' ? v === 'true' : v);
      }
      const since = q.get('since'); if (since) sel = sel.gte('updated_at', since);
      const search = q.get('search'); if (search) sel = sel.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      const { data, error } = await sel;
      if (error) throw error;
      if (format === 'csv') {
        const rows = data || [];
        const cols = ['id','name','phone','email','platform','source','audience_bucket','invite_code','utm_source','utm_medium','utm_campaign','utm_term','utm_content','consent','consent_ts','email_status','bounce_count','last_email_check_at','created_at','updated_at'];
        const needsQuote = new RegExp('[",\n]');
        const csv = [cols.join(',')]
          .concat(rows.map(r => cols.map(c => {
            let v = r[c];
            if (v == null) return '';
            v = String(v).replace(/"/g, '""');
            return needsQuote.test(v) ? '"' + v + '"' : v;
          }).join(',')))
          .join('\n');
        return { statusCode: 200, headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8' }, body: csv };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ fans: data || [] }) };
    }

    // Upserts and cleaning
    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const mode = body.mode || 'single';

      if (mode === 'bulk') {
        if (!hasAuth(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'unauthorized' }) };
        const items = Array.isArray(body.items) ? body.items : [];
        if (!items.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'no-items' }) };
        const normalized = items.map(normalizeFan).filter(x=>x.phone || x.email);
        const byPhone = normalized.filter(i=>i.phone);
        const byEmail = normalized.filter(i=>!i.phone && i.email);
        let inserted = 0;
        if (byPhone.length) {
          const { data, error } = await supa.from('fans').upsert(byPhone, { onConflict: 'phone', ignoreDuplicates: false }).select();
          if (error) throw error; inserted += (data?.length||0);
        }
        if (byEmail.length) {
          const { data, error } = await supa.from('fans').upsert(byEmail, { onConflict: 'email', ignoreDuplicates: false }).select();
          if (error) throw error; inserted += (data?.length||0);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok:true, inserted }) };
      }

      if (mode === 'clean') {
        if (!hasAuth(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'unauthorized' }) };
        const bucket = body.bucket || 'probation';
        const limit = Math.min(parseInt(body.limit || '500', 10), 2000);
        let sel = supa.from('fans').select('id,email').eq('audience_bucket', bucket).is('email_status', null).not('email', 'is', null).limit(limit);
        if (Array.isArray(body.ids) && body.ids.length) sel = supa.from('fans').select('id,email').in('id', body.ids).limit(limit);
        const { data, error } = await sel;
        if (error) throw error;
        const updates = [];
        for (const r of (data||[])) {
          const check = await checkEmailMX(r.email);
          updates.push({ id: r.id, email_status: check.status, last_email_check_at: new Date().toISOString() });
        }
        if (updates.length) {
          const { error: uerr } = await supa.from('fans').upsert(updates, { onConflict: 'id' });
          if (uerr) throw uerr;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok:true, checked: updates.length }) };
      }

      if (mode === 'promote') {
        if (!hasAuth(event)) return { statusCode: 401, headers, body: JSON.stringify({ error: 'unauthorized' }) };
        const ids = Array.isArray(body.ids) ? body.ids : [];
        const bucket = body.bucket || 'core';
        if (!ids.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'no-ids' }) };
        const { data, error } = await supa.from('fans').update({ audience_bucket: bucket }).in('id', ids).select('id');
        if (error) throw error;
        return { statusCode: 200, headers, body: JSON.stringify({ ok:true, updated: data?.length || 0, bucket }) };
      }

      // default: single upsert (public, consent-first)
      const values = normalizeFan(body);
      if (!values.phone && !values.email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing_identifier', message: 'phone or email required' }) };
      const conflict = values.phone ? 'phone' : 'email';
      const { data, error } = await supa.from('fans').upsert(values, { onConflict: conflict, ignoreDuplicates: false }).select();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok:true, fan: data?.[0]||null }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method_not_allowed' }) };
  } catch (err) {
    console.error('fans api error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'server_error', message: String(err?.message||err) }) };
  }
}
