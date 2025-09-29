// Promo Scheduler (Netlify Scheduled Function)
// Runs on a cron to auto-post promos to TikTok (SAFE_MODE by default). Extend to other platforms later.

import { postToTikTok } from './platforms/tiktok.mjs';
import { getAdminClient, insert, select, update } from './lib/supabase.mjs';

let SAFE_MODE = process.env.SOCIAL_POST_SAFE_MODE === '1';

// Optional: read queued posts from DB table `scheduled_posts` (see db/schema.sql)
async function fetchScheduledPosts() {
  const supa = getAdminClient();
  if (!supa) return [];
  const { data, error } = await supa.from('scheduled_posts').select('*').eq('status', 'pending').lte('scheduled_for', new Date().toISOString()).limit(10);
  if (error) {
    console.error('fetchScheduledPosts error', error);
    return [];
  }
  return data || [];
}

async function getAccountCredentials(platform, account_id) {
  const supa = getAdminClient();
  if (!supa) return null;
  if (account_id) {
    const { data } = await supa.from('admin_accounts').select('*').eq('id', account_id).single();
    return data || null;
  }
  // fallback: pick any active account for platform
  const { data } = await supa.from('admin_accounts').select('*').eq('platform', platform).eq('is_active', true).limit(1);
  return (data && data[0]) || null;
}

async function markPostResult(id, status, result) {
  const supa = getAdminClient();
  if (!supa) return;
  await supa.from('scheduled_posts').update({ status, result, updated_at: new Date().toISOString() }).eq('id', id);
}

async function ensureLog(entry) {
  const supa = getAdminClient();
  if (!supa) return;
  await insert('promo_logs', entry).catch(()=>{});
}

export async function handler(event, context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    // Override SAFE_MODE from admin_settings if set
    try {
      const supa = getAdminClient();
      if (supa) {
        const { data } = await supa.from('admin_settings').select('key,value').eq('key','SAFE_MODE').single();
        if (data && typeof data.value?.enabled === 'boolean') {
          SAFE_MODE = !!data.value.enabled;
        }
      }
    } catch (_) {}
    // If no DB configured, run a simple default post in SAFE_MODE
    let toPost = await fetchScheduledPosts();
    if (!toPost || toPost.length === 0) {
      toPost = [
        { id: 0, platform: 'tiktok', caption: 'Sound Factory tonight. Doors at 10. 🔥', video_url: null }
      ];
    }

    const results = [];
    for (const item of toPost) {
      if (item.platform !== 'tiktok') continue; // extend later
      try {
        const account = await getAccountCredentials('tiktok', item.account_id);
        const creds = account?.credentials || null;
        const res = await postToTikTok({ caption: item.caption, videoUrl: item.video_url, credentials: creds });
        results.push({ id: item.id, platform: 'tiktok', ok: res.success, res });
        await ensureLog({ platform: 'tiktok', scheduled_post_id: item.id || null, success: res.success, response: res, created_at: new Date().toISOString() });
        if (item.id) await markPostResult(item.id, res.success ? 'posted' : 'failed', res);
      } catch (e) {
        results.push({ id: item.id, platform: 'tiktok', ok: false, error: e.message });
        await ensureLog({ platform: 'tiktok', scheduled_post_id: item.id || null, success: false, response: { error: e.message }, created_at: new Date().toISOString() });
        if (item.id) await markPostResult(item.id, 'failed', { error: e.message });
      }
    }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true, SAFE_MODE, results }) };
  } catch (err) {
    console.error('promo-scheduler error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error', message: err.message }) };
  }
}

// Netlify Scheduled Functions:
// Set PROMO_SCHEDULE_CRON in env to change cadence. Examples: '@hourly', '@daily', '0 17 * * 5'
const CRON = process.env.PROMO_SCHEDULE_CRON || '@hourly';
export const config = { schedule: CRON };
