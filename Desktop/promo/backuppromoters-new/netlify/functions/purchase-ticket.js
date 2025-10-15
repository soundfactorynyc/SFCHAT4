// netlify/functions/purchase-ticket.js
// Creates Stripe Checkout sessions with promoter tracking
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getBaseUrl(event) {
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (event.headers['x-forwarded-host'] || event.headers.host);
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { type, amount, promoCode, tableType, paymentType } = JSON.parse(event.body || '{}');
    
    if (!amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount required' })
      };
    }

    const baseUrl = getBaseUrl(event);
    const successUrl = `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/team-tickets-tables.html${promoCode ? '?promo=' + promoCode : ''}`;

    // Get promoter info if promo code provided
    let promoterId = null;
    if (promoCode && promoCode !== 'none') {
      const { data: promoter } = await supabase
        .from('promoters')
        .select('id, name, stripe_account_id')
        .eq('promo_code', promoCode)
        .eq('status', 'approved')
        .single();
      
      if (promoter) {
        promoterId = promoter.id;
      }
    }

    // Build line item description
    let description = type === 'ticket' 
      ? 'Sound Factory Séance Halloween Ticket' 
      : `${tableType} - ${paymentType === 'full' ? 'Full Payment' : '20% Deposit'}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
            description: 'Sound Factory Séance - Halloween 2025'
          },
          unit_amount: amount * 100 // Convert to cents
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        promo_code: promoCode || 'none',
        promoter_id: promoterId || 'none',
        product_type: type,
        table_type: tableType || 'n/a',
        payment_type: paymentType || 'n/a'
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        checkoutUrl: session.url,
        sessionId: session.id
      })
    };
  } catch (err) {
    console.error('Purchase error:', err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ success: false, error: err.message }) 
    };
  }
};
