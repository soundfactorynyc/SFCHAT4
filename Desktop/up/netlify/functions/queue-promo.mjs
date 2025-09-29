// Queue Promo Function
// POST: create a scheduled post (requires PROMO_ADMIN_TOKEN if set)
// GET: list recent scheduled posts

import { getAdminClient } from './lib/supabase.mjs';

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function requireAuth(event) {
  const tokenRequired = process.env.PROMO_ADMIN_TOKEN;
  if (!tokenRequired) return true; // open if no token set
  const auth = event.headers?.authorization || event.headers?.Authorization;
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return false;
  const token = auth.split(' ')[1];
  return token && token === tokenRequired;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  const supa = getAdminClient();
  if (!supa) return json(500, { error: 'Supabase not configured on server.' });

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supa
        .from('scheduled_posts')
        .select('id, platform, caption, video_url, scheduled_for, status, updated_at, created_at')
        .order('scheduled_for', { ascending: false })
        .limit(20);
      if (error) throw error;
      return json(200, { success: true, posts: data || [] });
    }

    if (event.httpMethod === 'POST') {
      if (!requireAuth(event)) return json(401, { error: 'Unauthorized' });
      const body = event.body ? JSON.parse(event.body) : {};
  const platform = (body.platform || 'tiktok').toLowerCase();
      const caption = String(body.caption || '').trim();
      const video_url = body.videoUrl || body.video_url || null;
      const scheduled_for = body.scheduled_for || body.scheduledFor;
  const account_id = body.account_id || body.accountId || null;

      if (!caption) return json(400, { error: 'caption required' });
      if (!scheduled_for) return json(400, { error: 'scheduled_for required (ISO string)' });
      if (!['tiktok','twitter','facebook','instagram','whatsapp'].includes(platform)) {
        return json(400, { error: 'invalid platform' });
      }

      const { data, error } = await supa
        .from('scheduled_posts')
        .insert({ platform, caption, video_url, scheduled_for, status: 'pending', account_id })
        .select();
      if (error) throw error;
      return json(200, { success: true, post: data?.[0] });
    }

    return json(404, { error: 'Not found' });
  } catch (err) {
    console.error('queue-promo error:', err);
    return json(500, { error: 'Internal error', message: err.message });
  }
}
