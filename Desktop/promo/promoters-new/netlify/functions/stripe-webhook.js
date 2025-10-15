// netlify/functions/stripe-webhook.js
// Handles Stripe webhook events and credits promoter commissions
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    // Handle checkout session completed
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const { promo_code, promoter_id, product_type } = session.metadata || {};
      
      // Only process if there's a promoter
      if (promoter_id && promoter_id !== 'none') {
        const amountCents = session.amount_total; // Amount in cents
        const amountDollars = amountCents / 100;
        
        // Calculate commission
        let commission = 0;
        if (product_type === 'ticket') {
          commission = 10; // $10 per ticket
        } else if (product_type === 'table') {
          commission = amountDollars * 0.20; // 20% of table price
        }

        // Update promoter stats in database
        const { data: promoter, error: fetchError } = await supabase
          .from('promoters')
          .select('tickets_sold, commission_earned')
          .eq('id', promoter_id)
          .single();

        if (!fetchError && promoter) {
          const newTicketsSold = (promoter.tickets_sold || 0) + (product_type === 'ticket' ? 1 : 0);
          const newCommission = Number(promoter.commission_earned || 0) + commission;

          await supabase
            .from('promoters')
            .update({
              tickets_sold: newTicketsSold,
              commission_earned: newCommission.toFixed(2)
            })
            .eq('id', promoter_id);

          // Record the sale
          await supabase
            .from('promoter_sales')
            .insert({
              promoter_id: promoter_id,
              payment_intent_id: session.payment_intent,
              amount: amountCents,
              commission: Math.round(commission * 100), // Store in cents
              product_type: product_type
            });

          console.log('Commission credited:', {
            promoter_id,
            promo_code,
            product_type,
            commission: commission.toFixed(2),
            total_earned: newCommission.toFixed(2)
          });
        }
      }
    }

    // Handle payment intent succeeded (legacy support)
    else if (stripeEvent.type === 'payment_intent.succeeded') {
      const pi = stripeEvent.data.object;
      const promoCode = (pi.metadata && pi.metadata.promoCode) || 'none';

      if (promoCode !== 'none') {
        // Find the promoter by promo code
        const { data: promoter } = await supabase
          .from('promoters')
          .select('id, stripe_account_id')
          .eq('promo_code', promoCode)
          .single();

        if (promoter && promoter.stripe_account_id) {
          const commission = Number(process.env.COMMISSION_CENTS || 1000);
          await stripe.transfers.create({
            amount: commission,
            currency: 'usd',
            destination: promoter.stripe_account_id,
            description: `Commission for ${promoCode} on ${pi.id}`,
            metadata: { promoCode, payment_intent: pi.id }
          });
        }
      }
    }

  } catch (err) {
    console.error('Webhook handling failed:', err);
    // Log but don't fail - avoid retry storms
  }

  return { statusCode: 200, body: 'ok' };
};
