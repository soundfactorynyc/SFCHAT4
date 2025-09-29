// Ensure a Stripe Customer exists for a verified phone/name
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

function buildCorsHeaders(event) {
  const origin = (event.headers?.origin) || (event.headers?.Origin) || '*';
  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

export const handler = async (event) => {
  const headers = buildCorsHeaders(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  if (!stripe) return { statusCode: 500, headers, body: JSON.stringify({ error: 'stripe_unconfigured' }) };
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const rawPhone = (body.phone || '').toString().trim();
    const phone = rawPhone.replace(/[^+\d]/g, ''); // keep digits and leading +
    const name = (body.name || '').toString().trim() || undefined;
    const email = (body.email || '').toString().trim() || undefined;
    if (!phone) return { statusCode: 400, headers, body: JSON.stringify({ error: 'phone_required' }) };

    // Try to find existing customer via Search API
    let customer = null;
    try {
      const queries = [];
      queries.push(`phone:'${phone}'`);
      if (email) queries.push(`email:'${email}'`);
      // also try metadata sf_phone
      queries.push(`metadata['sf_phone']:'${phone}'`);
      const query = queries.join(' OR ');
      const res = await stripe.customers.search({ query, limit: 1 });
      if (res?.data?.length) customer = res.data[0];
    } catch (e) {
      // Fallback: list and filter in code (less efficient, but avoids search issues)
      try {
        const res = await stripe.customers.list({ limit: 100 });
        customer = res.data.find(c => (c.phone && c.phone.replace(/[^+\d]/g,'') === phone) || (email && c.email === email)) || null;
      } catch {}
    }

    if (customer) {
      // Update minimal fields if missing
      const updates = {};
      if (name && customer.name !== name) updates.name = name;
      if (email && customer.email !== email) updates.email = email;
      if (!customer.metadata || customer.metadata.sf_phone !== phone) updates.metadata = { ...(customer.metadata||{}), sf_phone: phone };
      if (Object.keys(updates).length) {
        customer = await stripe.customers.update(customer.id, updates);
      }
    } else {
      customer = await stripe.customers.create({
        name,
        email,
        phone,
        metadata: { sf_phone: phone }
      });
    }

    return { statusCode: 200, headers, body: JSON.stringify({ customerId: customer.id }) };
  } catch (err) {
    console.error('ensure-customer failed', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ensure_failed', message: String(err) }) };
  }
};
