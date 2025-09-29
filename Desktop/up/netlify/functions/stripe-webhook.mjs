// Stripe webhook handler
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

export const handler = async (event) => {
  // Stripe requires raw body for signature verification; Netlify passes event.body as string
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (!stripe || !webhookSecret) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'stripe_unconfigured' }) };
  }
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verify failed', err);
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'invalid_signature' }) };
  }
  try {
    switch (evt.type) {
      case 'checkout.session.completed':
        // Persist to DB if Supabase env present
        try {
          const session = evt.data.object;
          const supaUrl = process.env.SUPABASE_URL;
          const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
          if (supaUrl && supaKey) {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supaUrl, supaKey);
            await supabase.from('purchases').insert({
              id: session.id,
              amount_total: session.amount_total,
              currency: session.currency,
              status: session.status,
              item: session.metadata?.item || null,
              user_id: session.metadata?.userId || null,
              user_name: session.metadata?.userName || null,
              created_at: new Date().toISOString()
            });
          }
        } catch (dbErr) {
          console.warn('Supabase insert failed (non-fatal):', dbErr);
        }
        break;
      default:
        break;
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook processing error', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'processing_error' }) };
  }
};
