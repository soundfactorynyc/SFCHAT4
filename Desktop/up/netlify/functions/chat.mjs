// Simple Chat API: accepts { message, personality, energyLevel } and returns a reply
// Methods: POST (JSON), OPTIONS

function cors(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

const RESPONSES = {
  neutral: [ 'Got it.', 'Noted.', 'Okay.' ],
  funny: [
    "BRUH that's wilder than my uncle at Thanksgiving! 😂",
    "I'm DECEASED! 💀 You really said that with your whole chest!",
    "Sir, this is a Wendy's... JK IT'S SOUND FACTORY BABY! 🔥"
  ],
  smart: [
    'Your linguistic expression reveals fascinating neurological patterns...',
    'The dopaminergic response to your query is statistically significant.',
    'Fascinating. Your statement correlates with quantum entanglement theory.'
  ],
  shady: [
    "Oh honey, that's... certainly a choice you made. 💅",
    'The confidence... we love to see it. Kind of. 👀',
    'Not you thinking that was the move... 🙄'
  ],
  demon: [
    'YOUR SOUL TASTES LIKE MEDIOCRITY! 👹',
    'THE VOID ACKNOWLEDGES YOUR POOR DECISIONS! 🔥',
    'CHAOS ACCEPTS YOUR OFFERING... RELUCTANTLY! 💀'
  ],
  default: [ 'The vibe is IMMACULATE! 🔥', 'Sound Factory energy detected! ⚡', 'You just unlocked a new dimension! 🌀' ]
};

export async function handler(event) {
  const headers = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'method_not_allowed' }) };
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const personality = String(body.personality || '').toLowerCase();
    const toneOff = body.toneOffNext === true || personality === 'off';
    const bank = toneOff ? RESPONSES.neutral : (RESPONSES[personality] || RESPONSES.default);
    const reply = bank[Math.floor(Math.random() * bank.length)];
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, reply }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'server_error', message: String(e?.message || e) }) };
  }
}
