// Inbound SMS webhook (Twilio will POST). Logs payload; respond 200 quickly.
// Can be extended to process commands (STOP, HELP) or capture replies.
const { handleOptions, ok, error } = require('./_utils');

exports.handler = async (event) => {
  const opt = handleOptions(event); if (opt) return opt;
  if (event.httpMethod !== 'POST') return error(405, 'Method not allowed');
  try {
    const ct = event.headers['content-type'] || '';
    let payload = {};
    if (ct.includes('application/x-www-form-urlencoded')) {
      payload = Object.fromEntries(new URLSearchParams(event.body));
    } else if (ct.includes('application/json')) {
      payload = JSON.parse(event.body || '{}');
    } else {
      payload.raw = event.body;
    }
    console.log('Inbound SMS', payload.From, '->', payload.To, 'Body:', payload.Body);
    return { statusCode: 200, headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }, body: 'OK' };
  } catch (e) {
    console.error('Inbound parse error', e.message);
    return error(500, 'Inbound processing error');
  }
};
