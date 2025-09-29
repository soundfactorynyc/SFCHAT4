// netlify/functions/stripe-webhook.js
// Handles Stripe payment confirmations and triggers chaos

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// WebSocket for real-time effects (you'll need to set up a WebSocket server)
const WebSocket = require('ws');

// Effect triggers that happen when payment completes
const triggerEffect = async (effect, phoneNumber, amount) => {
  const effects = {
    SMALL_EXPLOSION: {
      duration: 3000,
      intensity: 1,
      visual: 'explosion_small',
      sound: 'boom_1'
    },
    MEGA_EXPLOSION: {
      duration: 10000,
      intensity: 5,
      visual: 'explosion_mega',
      sound: 'boom_mega',
      vibrate: true
    },
    SCREEN_TAKEOVER: {
      duration: 15000,
      intensity: 8,
      visual: 'full_takeover',
      sound: 'chaos_loop',
      vibrate: true,
      exclusive: true
    },
    REALITY_GLITCH: {
      duration: 20000,
      intensity: 9,
      visual: 'reality_break',
      sound: 'glitch_symphony',
      vibrate: true,
      exclusive: true,
      bloodRain: true
    },
    FULL_CHAOS: {
      duration: 30000,
      intensity: 10,
      visual: 'apocalypse',
      sound: 'chaos_ultimate',
      vibrate: true,
      exclusive: true,
      bloodRain: true,
      corrupt: true
    },
    LEGENDARY: {
      duration: 60000,
      intensity: 11,
      visual: 'god_mode',
      sound: 'transcendence',
      vibrate: true,
      exclusive: true,
      bloodRain: true,
      corrupt: true,
      takeoverDJ: true
    }
  };

  const effectData = effects[effect];
  
  // Broadcast to all connected clients (for live stream)
  try {
    // This would connect to your WebSocket server
    const ws = new WebSocket(process.env.WEBSOCKET_URL || 'wss://your-websocket-server.com');
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'PAYMENT_EFFECT',
        effect: effect,
        phoneNumber: phoneNumber,
        amount: amount,
        data: effectData,
        timestamp: Date.now()
      }));
      ws.close();
    });
  } catch (error) {
    console.error('WebSocket error:', error);
  }

  // Send confirmation SMS
  const messages = {
    SMALL_EXPLOSION: `💥 Your explosion just hit the floor! Watch the stream to see it!`,
    MEGA_EXPLOSION: `🔥🔥🔥 MEGA EXPLOSION ACTIVATED! The whole club felt that!`,
    SCREEN_TAKEOVER: `👹 YOU'VE TAKEN OVER! Your chaos controls the screen for ${effectData.duration/1000} seconds!`,
    REALITY_GLITCH: `🌀 REALITY.EXE HAS CRASHED! You broke the simulation!`,
    FULL_CHAOS: `💀 THE APOCALYPSE IS HERE! You are the destroyer of worlds!`,
    LEGENDARY: `⚡ GOD MODE ACTIVATED! You control Sound Factory for the next minute!`
  };

  await twilio.messages.create({
    body: messages[effect] || 'Your chaos has been unleashed!',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });

  // Store in database for leaderboard
  // You'd implement this with your database
  // await storePaymentEffect(phoneNumber, effect, amount);

  return effectData;
};

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        
        // Get metadata
        const phoneNumber = session.metadata.phoneNumber;
        const effect = session.metadata.effect;
        const amount = session.amount_total / 100; // Convert from cents
        
        console.log(`Payment received: $${amount} from ${phoneNumber} for ${effect}`);
        
        // Trigger the effect
        await triggerEffect(effect, phoneNumber, amount);
        
        // Update user status if they spent enough
        if (amount >= 50) {
          // Grant VIP status
          // await updateUserVIPStatus(phoneNumber, true);
          
          await twilio.messages.create({
            body: `👑 VIP STATUS UNLOCKED! You're now Sound Factory royalty. Text 'VIP' to see your perks.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
          });
        }
        
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = stripeEvent.data.object;
        console.log('Payment failed:', failedPayment);
        
        // Notify user
        if (failedPayment.metadata && failedPayment.metadata.phoneNumber) {
          await twilio.messages.create({
            body: `⚠️ Payment failed. The chaos remains contained... for now.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: failedPayment.metadata.phoneNumber
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Webhook processing failed',
        details: error.message
      })
    };
  }
};
