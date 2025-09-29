// Deprecated endpoint. Kept for compatibility; always returns 410.
// Build CORS headers based on env and request origin
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
      // default to first entry if multi-origin and request origin not matched
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

// Normalize phone to simple E.164 handling for US default
function normalizePhone(input) {
  if (!input) return null;
  let v = String(input).trim();
  if (v.startsWith('+')) return v;
  v = v.replace(/\D/g, '');
  if (v.length === 10) return `+1${v}`; // US default
  if (v.length === 11 && v.startsWith('1')) return `+${v}`;
  return null;
}

export const handler = async (event) => {
  const headers = buildCorsHeaders(event);
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  // Always gone: use external widget endpoints instead
  return {
    statusCode: 410,
    headers,
    body: JSON.stringify({
      error: 'Deprecated',
      message: 'Use external SMS widget endpoints. This function is discontinued.'
    })
  };
};
