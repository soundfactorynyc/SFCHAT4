// Cloudflare Pages Function for Stripe webhooks
export async function onRequestPost(context) {
  const { request, env } = context;
  
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response(JSON.stringify({ 
      error: 'Missing webhook signature or secret' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.text();
    
    // Verify webhook signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Extract timestamp and signature from header
    const parts = sig.split(',');
    let timestamp, signature;
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') signature = value;
    }

    if (!timestamp || !signature) {
      throw new Error('Invalid signature header format');
    }

    // Verify signature
    const signedPayload = `${timestamp}.${body}`;
    const expectedSignature = Array.from(
      new Uint8Array(
        await crypto.subtle.sign(
          'HMAC',
          key,
          encoder.encode(signedPayload)
        )
      )
    ).map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedSignature !== signature) {
      throw new Error('Signature verification failed');
    }

    // Parse the event
    const stripeEvent = JSON.parse(body);

    // Handle the event
    switch (stripeEvent.type) {
      case 'account.updated':
        const account = stripeEvent.data.object;
        console.log('Account updated:', account.id);
        console.log('Charges enabled:', account.charges_enabled);
        console.log('Payouts enabled:', account.payouts_enabled);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Check if there's a promoter reference
        if (paymentIntent.metadata && paymentIntent.metadata.promoter_id) {
          const promoterId = paymentIntent.metadata.promoter_id;
          const commissionRate = parseFloat(paymentIntent.metadata.commission_rate || '0.10');
          const commissionAmount = Math.round(paymentIntent.amount * commissionRate);

          // Create transfer to promoter
          try {
            const transferResponse = await fetch('https://api.stripe.com/v1/transfers', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                'amount': commissionAmount.toString(),
                'currency': paymentIntent.currency,
                'destination': promoterId,
                'description': `Commission for ticket sale - Payment ${paymentIntent.id}`,
                'metadata[payment_intent_id]': paymentIntent.id,
                'metadata[commission_rate]': commissionRate.toString()
              })
            });

            if (transferResponse.ok) {
              const transfer = await transferResponse.json();
              console.log('Commission transferred to promoter:', transfer.id);
            } else {
              const error = await transferResponse.json();
              console.error('Transfer failed:', error);
            }
          } catch (transferError) {
            console.error('Transfer error:', transferError);
          }
        }
        break;

      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        console.log('Checkout completed:', session.id);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed',
      message: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
