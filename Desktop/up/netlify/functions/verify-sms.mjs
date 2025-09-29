// Deprecated endpoint. Kept for compatibility; always returns 410.
function buildCorsHeaders(event) {
  const hdrs = event.headers || {};
  const reqOrigin = hdrs.origin || hdrs.Origin || '';
  const allowed = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '*').trim();

  let allowOrigin = '*';
  if (allowed !== '*') {
    const list = allowed
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (reqOrigin && list.includes(reqOrigin)) {
      allowOrigin = reqOrigin;
    } else if (list.length === 1) {
      allowOrigin = list[0];
    } else {
      allowOrigin = list[0] || '*';
    }
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
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
  return {
    statusCode: 410,
    headers,
    body: JSON.stringify({
      error: 'Deprecated',
      message: 'Use external SMS widget endpoints. This function is discontinued.'
    })
  };
};
