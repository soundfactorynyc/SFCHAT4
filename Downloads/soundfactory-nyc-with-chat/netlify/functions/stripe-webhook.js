// Netlify Function: Stripe Webhook Handler
// Converts your Express-style webhook implementation into a Netlify serverless function.
// Raw body handling is required for Stripe signature verification.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase (service key required for server-side mutations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: { persistSession: false }
  }
);

// Helper: Ensure we can parse raw body for Stripe
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const signature = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      endpointSecret
    );
    console.log('✅ Webhook verified:', stripeEvent.type);
  } catch (err) {
    console.error('❌ Signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Log webhook event (best-effort — ignore unique violation)
  try {
    const { error: insertError } = await supabase
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: stripeEvent.id,
        event_type: stripeEvent.type,
        payload: stripeEvent,
        processed: false
      });
    if (insertError && insertError.code !== '23505') {
      console.warn('⚠️ Failed to log webhook:', insertError.message);
    }
  } catch (e) {
    console.warn('⚠️ Logging exception:', e.message);
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
      case 'transfer.created':
        await handleTransferCreated(stripeEvent.data.object);
        break;
      default:
        console.log('ℹ️ Unhandled event type:', stripeEvent.type);
    }

    // Mark processed
    await supabase
      .from('stripe_webhooks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', stripeEvent.id);

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('❌ Handler error:', err.message);
    return { statusCode: 500, body: 'Internal webhook processing error' };
  }
};

// ---------------------------------------------
// Handler Implementations
// ---------------------------------------------
async function handleCheckoutCompleted(session) {
  console.log('Processing checkout session:', session.id);
  const { booking_id, table_id, promoter_code, customer_phone } = session.metadata || {};

  // Update booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      confirmed_at: new Date().toISOString(),
      amount: session.amount_total / 100,
      customer_email: session.customer_email,
      customer_name: session.customer_details?.name
    })
    .eq('id', booking_id)
    .select()
    .single();

  if (bookingError) {
    console.error('Error updating booking:', bookingError.message);
    return;
  }

  // Generate secure unique PIN
  const pin = await generateUniquePin(supabase, 'numeric');
  const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabase.from('access_pins').insert({
    booking_id,
    pin_code: pin,
    valid_until: validUntil
  });

  await supabase
    .from('bookings')
    .update({ pin_code: pin })
    .eq('id', booking_id);

  // Update table status
  if (table_id) {
    await supabase
      .from('venue_tables')
      .update({ status: 'sold' })
      .eq('id', table_id);
  }

  if (promoter_code) {
    await processPromoterCommission({
      booking_id,
      promoter_code,
      amount: session.amount_total,
      session_id: session.id
    });
  }

  if (customer_phone) {
    await sendConfirmationSMS(customer_phone, pin);
  }

  console.log(`✅ Booking ${booking_id} confirmed with PIN ${pin}`);
}

async function processPromoterCommission({ booking_id, promoter_code, amount, session_id }) {
  const { data: promoter } = await supabase
    .from('promoters')
    .select('*')
    .eq('code', promoter_code)
    .single();

  if (!promoter) {
    console.log('Promoter not found:', promoter_code);
    return;
  }

  const saleAmount = amount / 100;

  if (!promoter.stripe_connected || !promoter.stripe_account_id) {
    await supabase.from('pending_commissions').insert({
      promoter_code,
      booking_id,
      sale_amount: saleAmount,
      commission_amount: saleAmount * promoter.commission_rate,
      status: 'pending'
    });
    console.log('Commission pending (not connected):', promoter_code);
    return;
  }

  const commissionAmountCents = Math.floor(amount * promoter.commission_rate);

  try {
    const transfer = await stripe.transfers.create({
      amount: commissionAmountCents,
      currency: 'usd',
      destination: promoter.stripe_account_id,
      transfer_group: `BOOKING_${booking_id}`,
      description: `Commission for booking ${booking_id}`,
      metadata: {
        booking_id,
        promoter_code,
        commission_rate: promoter.commission_rate,
        session_id
      }
    });

    await supabase.from('commissions').insert({
      promoter_id: promoter.id,
      booking_id,
      sale_amount: saleAmount,
      commission_rate: promoter.commission_rate,
      commission_amount: commissionAmountCents / 100,
      stripe_transfer_id: transfer.id,
      status: 'paid',
      paid_at: new Date().toISOString()
    });

    await supabase.rpc('increment_promoter_stats', {
      p_promoter_id: promoter.id,
      p_sales_amount: saleAmount,
      p_commission_amount: commissionAmountCents / 100
    });

    console.log('✅ Commission paid:', commissionAmountCents / 100, promoter_code);
  } catch (error) {
    console.error('Transfer failed:', error.message);
    await supabase.from('pending_commissions').insert({
      promoter_code,
      booking_id,
      sale_amount: saleAmount,
      commission_amount: commissionAmountCents / 100,
      error: error.message,
      status: 'pending'
    });
  }
}

// ------------ Secure PIN Generation Utilities ------------
function generateSecurePin(length = 6) {
  const digits = '0123456789';
  const buf = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += digits[buf[i] % 10];
  return out;
}

function generateAlphanumericPin(length = 8) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const buf = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += chars[buf[i] % chars.length];
  return out;
}

async function generateUniquePin(supabase, type = 'numeric') {
  const attempts = 10;
  for (let i = 0; i < attempts; i++) {
    const candidate = type === 'alphanumeric' ? generateAlphanumericPin() : generateSecurePin();
    const { data, error } = await supabase
      .from('access_pins')
      .select('id')
      .eq('pin_code', candidate)
      .limit(1);
    if (error) {
      console.warn('PIN uniqueness check error:', error.message);
      break; // fallback
    }
    if (!data || data.length === 0) return candidate;
  }
  return Date.now().toString().slice(-6);
}

async function sendConfirmationSMS(phone, pin) {
  // Placeholder: integrate with Twilio/other provider
  console.log(`(SMS) PIN ${pin} -> ${phone}`);
}

// Placeholder handlers for other event types (implement as needed)
async function handlePaymentSucceeded(obj) { console.log('payment_intent.succeeded', obj.id); }
async function handlePaymentFailed(obj) { console.log('payment_intent.payment_failed', obj.id); }
async function handleSubscriptionCreated(obj) { console.log('customer.subscription.created', obj.id); }
async function handleTransferCreated(obj) { console.log('transfer.created', obj.id); }
