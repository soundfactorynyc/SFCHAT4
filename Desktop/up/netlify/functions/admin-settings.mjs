// Admin Settings API
// GET: returns all settings (key/value)
// POST: upserts provided settings (requires PROMO_ADMIN_TOKEN if set)

import { getAdminClient } from './lib/supabase.mjs';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function isAuthorized(event) {
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
      const { data, error } = await supa.from('admin_settings').select('*');
      if (error) throw error;
      const settings = {};
      (data||[]).forEach(r=>{ settings[r.key] = r.value; });
      return json(200, { success: true, settings });
    }

    if (event.httpMethod === 'POST') {
      if (!isAuthorized(event)) return json(401, { error: 'Unauthorized' });
      const body = event.body ? JSON.parse(event.body) : {};
      if (typeof body !== 'object' || Array.isArray(body)) return json(400, { error: 'Invalid payload' });
      const rows = Object.entries(body).map(([key, value])=>({ key, value, updated_at: new Date().toISOString() }));
      const { data, error } = await supa.from('admin_settings').upsert(rows, { onConflict: 'key' }).select();
      if (error) throw error;
      return json(200, { success: true, updated: data?.length || 0 });
    }

    return json(404, { error: 'Not found' });
  } catch (err) {
    console.error('admin-settings error:', err);
    return json(500, { error: 'Internal error', message: err.message });
  }
}
