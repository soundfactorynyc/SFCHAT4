// Admin Accounts API
// GET: list accounts (optional filter by platform)
// POST: upsert account (requires PROMO_ADMIN_TOKEN)
// DELETE: delete account by id (requires PROMO_ADMIN_TOKEN)

import { getAdminClient } from './lib/supabase.mjs';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function isAuthed(event) {
  const token = process.env.PROMO_ADMIN_TOKEN;
  if (!token) return true;
  const auth = event.headers?.authorization || event.headers?.Authorization;
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return false;
  return auth.split(' ')[1] === token;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  const supa = getAdminClient();
  if (!supa) return json(500, { error: 'Supabase not configured.' });

  try {
    if (event.httpMethod === 'GET') {
      const url = new URL(event.rawUrl || 'http://x.local');
      const platform = url.searchParams.get('platform');
      let q = supa.from('admin_accounts').select('*').order('created_at', { ascending: false });
      if (platform) q = q.eq('platform', platform);
      const { data, error } = await q;
      if (error) throw error;
      return json(200, { success: true, accounts: data || [] });
    }

    if (event.httpMethod === 'POST') {
      if (!isAuthed(event)) return json(401, { error: 'Unauthorized' });
      const body = event.body ? JSON.parse(event.body) : {};
      const { id, platform, label, is_active = true, credentials } = body;
      if (!platform || !label || !credentials) return json(400, { error: 'platform, label, credentials required' });
      const row = { platform, label, is_active, credentials, updated_at: new Date().toISOString() };
      let q = supa.from('admin_accounts');
      if (id) {
        q = q.update(row).eq('id', id).select();
      } else {
        q = q.insert(row).select();
      }
      const { data, error } = await q;
      if (error) throw error;
      return json(200, { success: true, account: data?.[0] });
    }

    if (event.httpMethod === 'DELETE') {
      if (!isAuthed(event)) return json(401, { error: 'Unauthorized' });
      const body = event.body ? JSON.parse(event.body) : {};
      const id = body.id;
      if (!id) return json(400, { error: 'id required' });
      const { error } = await supa.from('admin_accounts').delete().eq('id', id);
      if (error) throw error;
      return json(200, { success: true });
    }

    return json(404, { error: 'Not found' });
  } catch (err) {
    console.error('admin-accounts error:', err);
    return json(500, { error: 'Internal error', message: err.message });
  }
}
