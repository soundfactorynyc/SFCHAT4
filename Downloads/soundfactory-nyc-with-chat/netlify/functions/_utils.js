// Shared utilities for Netlify Functions
// Provides: JSON helpers, CORS handling

const crypto = require('crypto');

function getEnv(name, fallback) {
  return process.env[name] || fallback;
}

function json(statusCode, obj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      ...extraHeaders
    },
    body: JSON.stringify(obj)
  };
}

function error(statusCode, message, extras) {
  return json(statusCode, { error: message, ...(extras || {}) });
}

function ok(obj) { return json(200, obj); }

function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }
  return null;
}

function randomId(prefix = 'evt') {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

module.exports = {
  getEnv,
  json,
  error,
  ok,
  handleOptions,
  randomId
};
