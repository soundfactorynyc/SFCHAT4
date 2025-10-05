// Inbound SMS webhook (Twilio will POST). Logs payload; optional Twilio signature validation and auto-reply.
// Env:
//  ENABLE_TWILIO_SIGNATURE_CHECK=true  -> enforce X-Twilio-Signature verification
//  INBOUND_AUTOREPLY="Thanks!"        -> send simple reply via plain text (or TwiML if available)
const { handleOptions, error } = require('./_utils');
let twilioLib = null;
try { twilioLib = require('twilio'); } catch(_) {}

exports.handler = async (event) => {
  const opt = handleOptions(event); if (opt) return opt;
  if (event.httpMethod !== 'POST') return error(405, 'Method not allowed');
  try {
    const ct = event.headers['content-type'] || '';
    let payload = {};
    let paramsObj = {};

    if (ct.includes('application/x-www-form-urlencoded')) {
      const usp = new URLSearchParams(event.body || '');
      payload = Object.fromEntries(usp);
      usp.forEach((v,k)=>{ paramsObj[k]=v; });
    } else if (ct.includes('application/json')) {
      payload = JSON.parse(event.body || '{}');
      paramsObj = payload;
    } else {
      payload.raw = event.body;
    }

    // Optional signature verification
    if (process.env.ENABLE_TWILIO_SIGNATURE_CHECK === 'true' && twilioLib) {
      const validator = new twilioLib.webhooks.RequestValidator(process.env.TWILIO_AUTH_TOKEN || '');
      const signature = event.headers['x-twilio-signature'];
      const proto = event.headers['x-forwarded-proto'] || 'https';
      const host = event.headers['host'];
      const url = `${proto}://${host}${event.path}`;
      if (!validator.validate(signature, url, paramsObj)) {
        return { statusCode: 403, headers: { 'Content-Type':'text/plain','Access-Control-Allow-Origin':'*' }, body: 'Invalid signature' };
      }
    }

    console.log('Inbound SMS', payload.From, '->', payload.To, 'Body:', payload.Body);
    const auto = process.env.INBOUND_AUTOREPLY;
    if (auto && twilioLib?.twiml) {
      const resp = new twilioLib.twiml.MessagingResponse();
      resp.message(auto);
      return { statusCode: 200, headers: { 'Content-Type':'application/xml','Access-Control-Allow-Origin':'*' }, body: resp.toString() };
    }
    return { statusCode: 200, headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }, body: 'OK' };
  } catch (e) {
    console.error('Inbound parse error', e.message);
    return error(500, 'Inbound processing error');
  }
};
