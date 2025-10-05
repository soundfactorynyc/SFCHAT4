#!/usr/bin/env node
/**
 * Sync Netlify environment variables locally.
 * Requirements: netlify-cli authenticated (run `netlify login` if needed).
 * Outputs:
 *  - .env.netlify (key=value lines for all site env vars)
 *  - Updates config/netlify-env-inject.js for whitelisted public vars.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PUBLIC_KEYS = [
  'STRIPE_PUBLISHABLE_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'STRIPE_PRICE_TABLE',
  'SF_PRESENCE_ENABLED',
  'USE_SUPABASE_PHONE_OTP'
];

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
}

function getSiteId() {
  // netlify status outputs current linked site id
  try {
    const out = run('netlify status --json');
    const json = JSON.parse(out);
    return json.siteId || json.site?.id || null;
  } catch (e) {
    return null;
  }
}

function fetchEnv(siteId) {
  // Use netlify api for env list in JSON
  const cmd = `netlify api listSiteEnv --data '{"site_id":"${siteId}"}'`;
  const out = run(cmd);
  const json = JSON.parse(out);
  return json; // array of { key, values: [{context,value}] }
}

function flatten(envArray) {
  const map = {};
  for (const entry of envArray) {
    // pick production context value if exists else first
    let val = null;
    if (Array.isArray(entry.values)) {
      const prod = entry.values.find(v => v.context === 'production');
      val = prod?.value || entry.values[0]?.value || '';
    }
    map[entry.key] = val || '';
  }
  return map;
}

function writeDotEnv(vars) {
  const lines = Object.entries(vars).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${escapeValue(v)}`);
  fs.writeFileSync(path.join(process.cwd(), '.env.netlify'), lines.join('\n') + '\n');
  console.log('[sync-env] Wrote .env.netlify with', lines.length, 'vars');
}

function escapeValue(v){
  if (v == null) return '';
  if (/^[A-Za-z0-9_:-]+$/.test(v)) return v; // no quotes needed
  return JSON.stringify(v);
}

function updateInject(vars) {
  const injectPath = path.join(process.cwd(), 'config', 'netlify-env-inject.js');
  const current = fs.existsSync(injectPath) ? fs.readFileSync(injectPath, 'utf8') : '';
  const exposed = PUBLIC_KEYS.reduce((acc,k)=>{acc[k]=vars[k]||'';return acc;},{});
  const body = 'window.ENV = ' + JSON.stringify(exposed, null, 4) + ';\n';
  if (current.trim() === body.trim()) {
    console.log('[sync-env] netlify-env-inject.js unchanged');
  } else {
    fs.writeFileSync(injectPath, body);
    console.log('[sync-env] Updated netlify-env-inject.js');
  }
}

async function main() {
  const siteId = getSiteId();
  if (!siteId) {
    console.error('[sync-env] Unable to determine linked Netlify site. Run `netlify link` or `netlify status`.');
    process.exit(1);
  }
  console.log('[sync-env] Using site id:', siteId);
  const envArray = fetchEnv(siteId);
  const flat = flatten(envArray);
  writeDotEnv(flat);
  updateInject(flat);
  console.log('[sync-env] Done. Review .env.netlify for secrets (do not commit).');
}

main().catch(e => { console.error('[sync-env] Failed', e); process.exit(1); });
