// netlify/functions/ai-flyer-chat.js
// AI Flyer Assistant using Claude API

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { message, context } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message required' })
      };
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'sk-ant-api03-YOUR_KEY_HERE') {
      // Fallback to simple responses if no API key
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          response: generateFallbackResponse(message, context)
        })
      };
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: `You are a flyer customization assistant for Sound Factory Halloween event. When a promoter tells you what they want to add to their flyer, you CONFIRM the customization and describe exactly what will be added.

IMPORTANT: 
- Be direct and actionable
- Always confirm you're making the customization
- Describe exactly where/how it will appear on the flyer
- Match the purple/dark Halloween theme
- Keep responses under 75 words
- Use emojis sparingly

Example responses:
"Perfect! I'll add 'JONATHAN PETERS' in bold purple text at the top of the flyer with a glowing effect. ✨"
"Got it! Adding your Instagram @jonathanpeters in elegant script at the bottom corner. 🎃"
"Awesome! I'll overlay your tagline in a Halloween-style font that complements the design. 👻"`,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: aiResponse,
        usage: data.usage
      })
    };

  } catch (error) {
    console.error('AI Chat error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY
    });
    
    // Try to parse the body for fallback
    let fallbackMessage = '';
    let fallbackContext = {};
    
    try {
      const parsed = JSON.parse(event.body || '{}');
      fallbackMessage = parsed.message;
      fallbackContext = parsed.context;
    } catch (e) {
      console.error('Could not parse body for fallback:', e);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Something went wrong. Please try again.',
        details: error.message,
        fallback: generateFallbackResponse(fallbackMessage, fallbackContext)
      })
    };
  }
};

// Fallback responses when Claude API is not available
function generateFallbackResponse(message, context) {
  const msg = message.toLowerCase();
  
  // Extract name
  if (!context?.userName && (msg.includes('my name is') || msg.includes('i am') || msg.includes('call me'))) {
    const nameMatch = msg.match(/(?:my name is|i am|call me)\s+([a-z0-9\s]+)/i);
    if (nameMatch) {
      const name = nameMatch[1].trim().toUpperCase();
      return `Awesome! I've got your name as "${name}". 🎉\n\nWould you like to add your Instagram handle or any other text to the flyer? Or should I generate it now?`;
    }
  }
  
  // Just a name provided
  if (!context?.userName && /^[a-z0-9\s@]+$/i.test(msg) && !msg.includes(' ')) {
    const name = msg.toUpperCase();
    return `Perfect! I'll use "${name}" on your flyer. 🚀\n\nWant to add anything else like your Instagram handle, or should I create the flyer now?`;
  }
  
  // Instagram
  if (msg.includes('instagram') || msg.includes('@') || msg.includes('insta')) {
    const igMatch = msg.match(/@?([a-z0-9._]+)/i);
    if (igMatch) {
      const ig = '@' + igMatch[1];
      return `Got it! I'll add "${ig}" to your flyer. ✨\n\nReady to generate your custom flyer?`;
    }
  }
  
  // Style changes
  if (msg.includes('spooky') || msg.includes('scary') || msg.includes('dark')) {
    return `Ooh, making it extra spooky! 👻 I'll add some darker vibes to your flyer. Ready to see it?`;
  }
  
  // Generate command
  if (msg.includes('generate') || msg.includes('create') || msg.includes('make') || msg.includes('show')) {
    if (!context?.userName) {
      return `I need your name first! What should I put on the flyer? 🎭`;
    }
    
    return `📤 Perfect! I'm sending your custom flyer request to the Sound Factory team for approval.\n\n**Your Details:**\n• Name: ${context.userName}\n${context.instagram ? '• Instagram: ' + context.instagram + '\n' : ''}• Style: ${context.style === 'spooky' ? 'Extra Spooky 👻' : 'Classic Halloween 🎃'}\n\nYou'll receive an email within 24 hours with your approved flyer! In the meantime, you can still sign up below to get your referral link. 🚀`;
  }
  
  // Default
  return `Hey! I'm here to help you create a custom Sound Factory Halloween flyer. 🎃\n\nJust tell me your name to get started, and I can customize it with your Instagram handle too!`;
}
