import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false }, global: { headers: { 'x-application-name': 'sf-social-invites' } } });
}

export async function upsert(table, values, conflict) {
  const supa = getAdminClient(); if (!supa) return { error: 'no-supabase' };
  const q = supa.from(table).upsert(values, { onConflict: conflict, ignoreDuplicates: false }).select();
  const { data, error } = await q; return { data, error };
}

export async function insert(table, values) {
  const supa = getAdminClient(); if (!supa) return { error: 'no-supabase' };
  const { data, error } = await supa.from(table).insert(values).select();
  return { data, error };
}

export async function update(table, match, values) {
  const supa = getAdminClient(); if (!supa) return { error: 'no-supabase' };
  const { data, error } = await supa.from(table).update(values).match(match).select();
  return { data, error };
}

export async function select(table, match, columns='*') {
  const supa = getAdminClient(); if (!supa) return { error: 'no-supabase' };
  let q = supa.from(table).select(columns);
  if (match) q = q.match(match);
  const { data, error } = await q; return { data, error };
}
