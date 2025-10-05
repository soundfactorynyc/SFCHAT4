// Netlify Edge Function: Basic rate limiting with Stripe signature bypass
// Requires enabling Edge Functions and optionally a KV / Blobs store. Here we use in-memory map fallback (per instance).

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Limit scope: only webhook endpoints
  if (!path.startsWith('/.netlify/functions/stripe-webhook') && !path.startsWith('/api/webhook/')) {
    return context.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const key = `rl:${ip}:${path}`;
  const limit = 100; // per hour
  const ttlSeconds = 3600;

  // Try Netlify env store (kv / blobs) if bound; else ephemeral memory
  const store = context.env?.RATE_LIMIT_STORE;

  let count = 0;
  if (store && store.get) {
    try { count = parseInt(await store.get(key) || '0', 10); } catch (_) {}
  } else {
    globalThis.__RL_CACHE = globalThis.__RL_CACHE || new Map();
    const existing = globalThis.__RL_CACHE.get(key);
    if (existing && existing.expires > Date.now()) count = existing.count; else globalThis.__RL_CACHE.delete(key);
  }

  if (count >= limit) {
    // Allow Stripe signed retries even if over limit
    if (!request.headers.get('stripe-signature')) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: ttlSeconds }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': ttlSeconds.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0'
        }
      });
    }
  }

  // Increment
  const newCount = count + 1;
  if (store && store.set) {
    try { await store.set(key, String(newCount), { expirationTtl: ttlSeconds }); } catch (_) {}
  } else {
    globalThis.__RL_CACHE.set(key, { count: newCount, expires: Date.now() + ttlSeconds * 1000 });
  }

  const response = await context.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, limit - newCount)));
  return response;
};
