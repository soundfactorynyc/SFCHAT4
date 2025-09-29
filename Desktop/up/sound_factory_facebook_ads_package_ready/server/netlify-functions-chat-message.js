// netlify/functions/chat-message.js
// THE BEAST - Sound Factory SMS + PAYMENT System

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);

// OpenAI for the AI responses
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Energy & Payment Tracking
const userSessions = new Map();

// PAYMENT TIERS - What money unlocks
const PAYMENT_EFFECTS = {
  1: { 
    effect: "SMALL_EXPLOSION",
    message: "💥 Small blast triggered!",
    personality: "funny"
  },
  5: {
    effect: "MEGA_EXPLOSION",
    message: "🔥🔥🔥 MEGA EXPLOSION INCOMING!",
    personality: "chaos",
    vibrate: true
  },
  10: {
    effect: "SCREEN_TAKEOVER",
    message: "👹 YOU'VE TAKEN OVER THE SCREEN!",
    personality: "demon",
    vibrate: true,
    duration: 10000
  },
  20: {
    effect: "REALITY_GLITCH",
    message: "🌀 REALITY.EXE HAS STOPPED WORKING",
    personality: "void",
    vibrate: true,
    bloodRain: true
  },
  50: {
    effect: "FULL_CHAOS",
    message: "💀 THE APOCALYPSE IS HERE 💀",
    personality: "ultimate_demon",
    vibrate: true,
    bloodRain: true,
    corrupt: true,
    duration: 30000
  },
  100: {
    effect: "LEGENDARY",
    message: "⚡ YOU ARE THE GOD OF CHAOS ⚡",
    personality: "god_mode",
    vibrate: true,
    bloodRain: true,
    corrupt: true,
    takeoverDJ: true,
    duration: 60000
  }
};

// PERSONALITY MODES
const PERSONALITIES = {
  funny: {
    prompt: "Make this hilarious and unhinged. Use caps and emojis:",
    temperature: 0.9
  },
  smart: {
    prompt: "Be overly intellectual and use unnecessary big words:",
    temperature: 0.7
  },
  shady: {
    prompt: "Throw shade and roast them subtly but savagely:",
    temperature: 0.8
  },
  demon: {
    prompt: "Respond as a demon from the void. Dark but weirdly funny:",
    temperature: 0.9
  },
  chaos: {
    prompt: "PURE CHAOS. Reality is breaking. Nothing makes sense:",
    temperature: 1.0
  },
  void: {
    prompt: "You are the void itself. Speak in cosmic horror but make it club-appropriate:",
    temperature: 0.95
  },
  ultimate_demon: {
    prompt: "You are the final boss of chaos. Every word drips with power and insanity:",
    temperature: 1.0
  },
  god_mode: {
    prompt: "You have transcended. Speak as if you control reality itself. Make it epic:",
    temperature: 1.0
  }
};

// THE 123 FLIP SYSTEM
const flipMessage = async (message, level) => {
  const flips = [
    "Tell the sarcastic truth about: ",
    "Reveal the dark existential reality of: ",
    "BREAK REALITY while discussing: "
  ];
  
  const prompt = flips[Math.min(level - 1, 2)] + message;
  
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.7 + (level * 0.1)
    });
    
    return `FLIP ${level}: ${completion.data.choices[0].text.trim()}`;
  } catch (error) {
    return `FLIP ${level}: Your reality cannot be processed right now 🌀`;
  }
};

// DETECT ENERGY LEVEL
const detectEnergyLevel = (phoneNumber) => {
  const session = userSessions.get(phoneNumber) || {
    messages: [],
    energy: 1,
    lastMessage: Date.now(),
    totalSpent: 0,
    vipStatus: false
  };
  
  const now = Date.now();
  const timeSinceLastMessage = now - session.lastMessage;
  
  // Energy increases based on:
  // - Message frequency (faster = more energy)
  // - Money spent
  // - Time of night (later = higher base energy)
  // - Keywords (CAPS, excitement, emojis)
  
  let energy = session.energy;
  
  if (timeSinceLastMessage < 5000) energy += 2; // Rapid fire messages
  if (timeSinceLastMessage < 10000) energy += 1;
  
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) energy += 3; // Peak hours bonus
  
  if (session.totalSpent > 20) energy += 2; // Big spender bonus
  if (session.vipStatus) energy += 3; // VIP always high energy
  
  energy = Math.min(energy, 10); // Max energy level 10
  
  session.energy = energy;
  session.lastMessage = now;
  userSessions.set(phoneNumber, session);
  
  return energy;
};

// CREATE STRIPE PAYMENT LINK
const createPaymentLink = async (amount, phoneNumber) => {
  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sound Factory Chaos Level ${amount}`,
            description: PAYMENT_EFFECTS[amount].message
          },
          unit_amount: amount * 100, // Convert to cents
        },
        quantity: 1,
      }],
      metadata: {
        phoneNumber: phoneNumber,
        effect: PAYMENT_EFFECTS[amount].effect
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `https://sf-sms-service.netlify.app/success?effect=${PAYMENT_EFFECTS[amount].effect}`
        }
      }
    });
    
    return paymentLink.url;
  } catch (error) {
    console.error('Stripe error:', error);
    return null;
  }
};

// MAIN HANDLER
exports.handler = async (event, context) => {
  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  try {
    const { phoneNumber, message, action, amount, personality } = JSON.parse(event.body);
    
    // Get or create user session
    let session = userSessions.get(phoneNumber) || {
      messages: [],
      energy: 1,
      lastMessage: Date.now(),
      totalSpent: 0,
      vipStatus: false,
      warnings: 0
    };
    
    // HANDLE DIFFERENT ACTIONS
    
    // 1. PAYMENT REQUEST
    if (action === 'pay') {
      const paymentUrl = await createPaymentLink(amount, phoneNumber);
      
      if (paymentUrl) {
        await twilio.messages.create({
          body: `🔥 UNLEASH CHAOS LEVEL ${amount}! Pay here: ${paymentUrl}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            success: true,
            message: 'Payment link sent!',
            paymentUrl
          })
        };
      }
    }
    
    // 2. FLIP MESSAGE (123 System)
    if (action === 'flip') {
      const flipLevel = parseInt(message.match(/\d/)?.[0] || '1');
      const originalMessage = message.replace(/\d/, '').trim();
      const flippedMessage = await flipMessage(originalMessage, flipLevel);
      
      await twilio.messages.create({
        body: flippedMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          message: flippedMessage,
          flipLevel
        })
      };
    }
    
    // 3. PERSONALITY FILTER MESSAGE
    if (personality && PERSONALITIES[personality]) {
      const energyLevel = detectEnergyLevel(phoneNumber);
      
      // Higher energy = more intense response
      const intensityMultiplier = energyLevel / 10;
      
      const prompt = `${PERSONALITIES[personality].prompt} "${message}"`;
      
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 100,
        temperature: PERSONALITIES[personality].temperature * (1 + intensityMultiplier * 0.2)
      });
      
      let response = completion.data.choices[0].text.trim();
      
      // Add energy-based effects
      if (energyLevel >= 8) {
        response = response.toUpperCase() + " 🔥🔥🔥";
      }
      if (energyLevel === 10) {
        response = "⚡PEAK ENERGY⚡ " + response;
        // Trigger vibration command
        response += "\n[VIBRATE]";
      }
      
      await twilio.messages.create({
        body: response,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          message: response,
          energyLevel,
          personality
        })
      };
    }
    
    // 4. DEMON MODE / CHAOS DETECTION
    if (message && message.toLowerCase().includes('demon')) {
      const demonResponse = "👹 YOU'VE AWAKENED THE DEMON MODE. Text 'PAY 10' to unleash full chaos or 'STOP' to flee like a coward.";
      
      await twilio.messages.create({
        body: demonResponse,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          demonMode: true,
          message: demonResponse
        })
      };
    }
    
    // 5. DEFAULT AI RESPONSE WITH ATTITUDE
    const energyLevel = detectEnergyLevel(phoneNumber);
    
    // Build AI prompt based on energy
    let aiPrompt = `You're an AI at Sound Factory, the most intense club ever. `;
    
    if (energyLevel < 3) {
      aiPrompt += "The user seems chill. Be cool but encouraging. ";
    } else if (energyLevel < 6) {
      aiPrompt += "The user is vibing. Match their energy and hype them up. ";
    } else if (energyLevel < 9) {
      aiPrompt += "The user is RAGING. Be chaotic and intense. ";
    } else {
      aiPrompt += "PEAK ENERGY DETECTED. BE ABSOLUTELY UNHINGED. ";
    }
    
    aiPrompt += `Respond to: "${message}"`;
    
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: aiPrompt,
      max_tokens: 100,
      temperature: 0.8 + (energyLevel * 0.02)
    });
    
    let response = completion.data.choices[0].text.trim();
    
    // Add energy indicators
    if (energyLevel >= 10) {
      response = "🌀 REALITY PEAK 🌀 " + response + " [VIBRATE]";
    }
    
    await twilio.messages.create({
      body: response,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    // Store message history
    session.messages.push({
      sent: message,
      received: response,
      timestamp: Date.now(),
      energy: energyLevel
    });
    
    userSessions.set(phoneNumber, session);
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: response,
        energyLevel,
        sessionData: {
          totalMessages: session.messages.length,
          currentEnergy: energyLevel,
          vipStatus: session.vipStatus
        }
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'The void consumed your message. Try again.',
        details: error.message
      })
    };
  }
};
