// Lightweight function tester (node scripts/test-functions.mjs)
// Runs handlers directly with simulated Netlify events.

import * as promoScheduler from '../netlify/functions/promo-scheduler.mjs';
import * as adminSettings from '../netlify/functions/admin-settings.mjs';
import * as adminAccounts from '../netlify/functions/admin-accounts.mjs';
import * as queuePromo from '../netlify/functions/queue-promo.mjs';

function makeEvent({ method = 'GET', path = '/', body = null, headers = {}, rawUrl = 'http://localhost/.netlify/functions/x' } = {}) {
  return {
    httpMethod: method,
    path,
    body: body ? JSON.stringify(body) : null,
    headers,
    rawUrl
  };
}

async function run() {
  const results = {};
  // Force SAFE_MODE for testing
  process.env.SOCIAL_POST_SAFE_MODE = process.env.SOCIAL_POST_SAFE_MODE || '1';

  // 1) promo-scheduler smoke test
  try {
    const res = await promoScheduler.handler(makeEvent({ method: 'GET', path: '/.netlify/functions/promo-scheduler' }));
    results['promo-scheduler'] = { status: res.statusCode, body: JSON.parse(res.body) };
  } catch (e) { results['promo-scheduler'] = { error: e.message }; }

  // 2) admin-settings GET (works without Supabase? will 500 if missing env)
  try {
    const res = await adminSettings.handler(makeEvent({ method:'GET', path:'/.netlify/functions/admin-settings' }));
    results['admin-settings:GET'] = { status: res.statusCode, body: safeJson(res.body) };
  } catch (e) { results['admin-settings:GET'] = { error: e.message }; }

  // 3) admin-accounts GET
  try {
    const res = await adminAccounts.handler(makeEvent({ method:'GET', path:'/.netlify/functions/admin-accounts', rawUrl:'http://localhost/.netlify/functions/admin-accounts' }));
    results['admin-accounts:GET'] = { status: res.statusCode, body: safeJson(res.body) };
  } catch (e) { results['admin-accounts:GET'] = { error: e.message }; }

  // 4) queue-promo GET
  try {
    const res = await queuePromo.handler(makeEvent({ method:'GET', path:'/.netlify/functions/queue-promo' }));
    results['queue-promo:GET'] = { status: res.statusCode, body: safeJson(res.body) };
  } catch (e) { results['queue-promo:GET'] = { error: e.message }; }

  console.log(JSON.stringify(results, null, 2));
}

function safeJson(body){
  try { return JSON.parse(body); } catch { return body; }
}

run().catch(err=>{ console.error(err); process.exit(1); });
