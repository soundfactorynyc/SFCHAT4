import { getAdminClient } from './lib/supabase.mjs';

export async function handler(event) {
  const headers = { 'Access-Control-Allow-Origin': '*' };
  const supa = getAdminClient();
  if (!supa) return { statusCode: 200, headers, body: JSON.stringify({ ok: false, reason: 'no-supabase-env' }) };
  try{
    const { data: invites, error } = await supa.from('invites').select('*').limit(1);
    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, tables: { invites: invites?.length ?? 0 } }) };
  } catch(e){
    return { statusCode: 500, headers, body: JSON.stringify({ ok:false, error: e.message }) };
  }
}
