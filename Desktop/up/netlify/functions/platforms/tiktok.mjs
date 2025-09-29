// TikTok Content Posting stub
// Real TikTok Content Posting API access requires approved app and business account.
// This module provides a SAFE_MODE simulator and validates required env for live mode.

const SAFE_MODE = process.env.SOCIAL_POST_SAFE_MODE === '1';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/**
 * postToTikTok
 * Inputs:
 * - caption: string
 * - videoUrl: string (publicly accessible URL) or null to skip
 * Returns: { success: boolean, platformPostId?: string, simulated?: boolean, note?: string }
 */
export async function postToTikTok({ caption, videoUrl, credentials }) {
  if (SAFE_MODE) {
    return {
      success: true,
      simulated: true,
      platformPostId: `sim_${Math.random().toString(36).slice(2, 10)}`,
      note: 'SAFE_MODE enabled; no TikTok API calls were made.'
    };
  }

  // Validate env for live mode (placeholder names; adjust to your approved app credentials)
  const accessToken = credentials?.access_token || process.env.TIKTOK_ACCESS_TOKEN || null;
  const businessAccountId = credentials?.business_account_id || process.env.TIKTOK_BUSINESS_ACCOUNT_ID || null;
  if (!accessToken) throw new Error('Missing TikTok access_token in account credentials or env');
  if (!businessAccountId) throw new Error('Missing TikTok business_account_id in account credentials or env');

  // NOTE: Implementing TikTok Content Posting requires partner access and the correct endpoints.
  // To avoid broken live attempts, we throw a clear error here.
  // Reference: https://developers.tiktok.com/
  throw new Error('TikTok live posting not implemented in this repo. Contact admin to enable with approved API credentials.');
}

export default { postToTikTok };
