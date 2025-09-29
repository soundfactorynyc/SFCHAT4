// Proxy to external SMS service with permissive CORS
const SMS_API = process.env.SMS_API_BASE || 'https://sf-sms-service.netlify.app';

function buildCorsHeaders(event) {
  const origin = (event.headers?.origin) || (event.headers?.Origin) || '*';
  return {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

export const handler = async (event) => {
  const headers = buildCorsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const url = `${SMS_API}/.netlify/functions/verify-code`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await resp.text();
    return { statusCode: resp.status, headers, body: text };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'proxy_failed', message: String(err) }) };
  }
};
