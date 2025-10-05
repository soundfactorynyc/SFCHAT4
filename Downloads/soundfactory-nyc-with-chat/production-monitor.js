#!/usr/bin/env node
/**
 * Simple production monitor.
 * - Polls key endpoints on an interval.
 * - Logs status code + latency + rolling failure counts.
 * - Exits non-zero if failure threshold exceeded (optional) once MAX_CYCLES reached.
 */

const https = require('https');

const DOMAIN = process.env.DOMAIN_OVERRIDE || 'soundfactorynyc.com';
const BASE = `https://${DOMAIN}`;
const INTERVAL_MS = parseInt(process.env.MONITOR_INTERVAL || '15000', 10); // 15s
const MAX_CYCLES = parseInt(process.env.MONITOR_CYCLES || '0', 10); // 0 = infinite
const FAIL_THRESHOLD = parseInt(process.env.FAIL_THRESHOLD || '5', 10); // fail after 5 consecutive fails on any endpoint

const endpoints = [
  '/',
  '/.netlify/functions/send-sms',
  '/.netlify/functions/verify-sms',
  '/.netlify/functions/stripe-webhook'
];

const state = endpoints.reduce((acc, ep) => { acc[ep] = { fails: 0 }; return acc; }, {});
let cycle = 0;

function fetchHead(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.request(url, { method: 'GET', timeout: 8000 }, (res) => {
      const latency = Date.now() - start;
      resolve({ status: res.statusCode, latency });
      res.resume();
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, latency: Date.now() - start }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout', latency: Date.now() - start }); });
    req.end();
  });
}

async function runCycle() {
  cycle += 1;
  const timestamp = new Date().toISOString();
  console.log(`\n[Cycle ${cycle}] ${timestamp}`);
  for (const ep of endpoints) {
    const url = BASE + ep;
    const result = await fetchHead(url);
    const ok = result.status >= 200 && result.status < 400;
    if (!ok) state[ep].fails += 1; else state[ep].fails = 0;
    const level = ok ? (result.latency < 500 ? 'OK ' : 'SLOW') : 'FAIL';
    console.log(`${level.padEnd(5)} ${result.status.toString().padEnd(3)} ${result.latency.toString().padStart(4)}ms ${ep}${result.error ? ' (' + result.error + ')' : ''}`);
    if (state[ep].fails >= FAIL_THRESHOLD) {
      console.error(`Endpoint ${ep} exceeded failure threshold (${FAIL_THRESHOLD}).`);
    }
  }
  if (MAX_CYCLES > 0 && cycle >= MAX_CYCLES) {
    const hardFail = endpoints.some(ep => state[ep].fails >= FAIL_THRESHOLD);
    process.exit(hardFail ? 1 : 0);
  }
}

console.log(`Starting production monitor for ${BASE}`);
runCycle();
setInterval(runCycle, INTERVAL_MS);
