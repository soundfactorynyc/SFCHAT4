// List scheduled posts and promo logs
import { getAdminClient } from './lib/supabase.mjs';

function cors(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

export async function handler(event) {
  const headers = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'method_not_allowed' }) };

  const token = (event.headers?.authorization || '').replace(/^Bearer\s+/i, '') || '';
  const required = process.env.PROMO_ADMIN_TOKEN || '';
  if (required && token !== required) return { statusCode: 401, headers, body: JSON.stringify({ error: 'unauthorized' }) };

  const supa = getAdminClient();
  if (!supa) return { statusCode: 500, headers, body: JSON.stringify({ error: 'no-supabase' }) };

  try {
    const url = new URL(event.rawUrl || (process.env.URL || 'http://localhost') + event.path);
    const since = url.searchParams.get('since');
    const platform = url.searchParams.get('platform');
    const status = url.searchParams.get('status');

    // scheduled_posts
    let sp = supa.from('scheduled_posts').select('*').order('scheduled_for', { ascending: false }).limit(200);
    if (platform) sp = sp.eq('platform', platform);
    if (status) sp = sp.eq('status', status);
    if (since) sp = sp.gte('updated_at', since);

    // promo_logs
    let pl = supa.from('promo_logs').select('*').order('created_at', { ascending: false }).limit(300);
    if (platform) pl = pl.eq('platform', platform);
    if (since) pl = pl.gte('created_at', since);

    const [spRes, plRes] = await Promise.all([sp, pl]);
    if (spRes.error) throw new Error(spRes.error.message);
    if (plRes.error) throw new Error(plRes.error.message);

    return { statusCode: 200, headers, body: JSON.stringify({ scheduled: spRes.data || [], logs: plRes.data || [] }) };
  } catch (err) {
    console.error('promo-logs error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'server_error', message: String(err) }) };
  }
}
