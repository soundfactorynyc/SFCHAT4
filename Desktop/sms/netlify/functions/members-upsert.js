import { preflight, json as jsonRes, verifyJwt } from './_utils.js';
import { getStore } from '@netlify/blobs';

export const config = { path: '/api/members/upsert' };

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  if (event.httpMethod !== 'POST') return jsonRes(event, { error: 'Method Not Allowed' }, 405);

  try {
    const { tokenOrAdminKey, phone, email, tier, source } = JSON.parse(event.body || '{}');

    const adminKey = process.env.ADMIN_KEY;
    let subject = null;
    if (tokenOrAdminKey && adminKey && tokenOrAdminKey === adminKey) {
      subject = 'admin';
    } else if (tokenOrAdminKey) {
      const payload = verifyJwt(tokenOrAdminKey, process.env.JWT_SECRET);
      if (!payload) return jsonRes(event, { error: 'Unauthorized' }, 401);
      subject = payload.sub || 'user';
    } else {
      return jsonRes(event, { error: 'Unauthorized' }, 401);
    }

    if (!phone && !email) return jsonRes(event, { error: 'phone or email required' }, 400);

    const key = phone ? `member:phone:${phone.trim()}` : `member:email:${String(email).trim().toLowerCase()}`;
    const store = getStore('members');
    const now = new Date().toISOString();
    const existing = (await store.get(key, { type: 'json' })) || {};
    const updated = {
      ...existing,
      phone: phone || existing.phone || null,
      email: email || existing.email || null,
      tier: (tier || existing.tier || 'free'),
      lastSource: source || existing.lastSource || null,
      updatedAt: now,
      createdAt: existing.createdAt || now,
      updatedBy: subject
    };
    await store.set(key, JSON.stringify(updated), { contentType: 'application/json' });

    return jsonRes(event, { ok: true, member: updated });
  } catch (err) {
    return jsonRes(event, { error: err.message }, 500);
  }
}
