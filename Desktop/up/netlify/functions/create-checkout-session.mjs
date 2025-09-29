// Create a Stripe Checkout Session for a drink purchase
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
    const priceId = body.priceId || process.env.STRIPE_PRICE_ID; // precreated Price for "drink"

    // Determine origin/success URLs
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || (event.headers?.origin) || 'http://localhost:8888';
    const successUrl = `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/`;

    let session;
    if (priceId) {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        customer: body.customerId || undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          item: body.item || 'drink',
          userId: body.userId || '',
          userName: body.userName || ''
        }
      });
    } else {
      // Fallback: one-time amount in cents via amount/currency
      const amount = Number(body.amount) || 1200; // $12 default
      const currency = (body.currency || 'usd').toLowerCase();
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        allow_promotion_codes: true,
        line_items: [{ price_data: { currency, product_data: { name: body.name || 'Drink' }, unit_amount: amount }, quantity: 1 }],
        customer: body.customerId || undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          item: body.item || 'drink',
          userId: body.userId || '',
          userName: body.userName || ''
        }
      });
    }
    return { statusCode: 200, headers, body: JSON.stringify({ id: session.id, url: session.url }) };
  } catch (err) {
    console.error('create session failed', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'create_failed', message: String(err) }) };
  }
};
