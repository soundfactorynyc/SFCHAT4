// VIRAL INVITATION SYSTEM - Facebook, Instagram, Twitter/X, WhatsApp
// Note: Many social APIs have strict policies. Set SOCIAL_INVITES_SAFE_MODE=1 to simulate without posting.

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getAdminClient, insert, update, select } from './lib/supabase.mjs';

// Twilio is optional; lazy-init to avoid bundler errors in local dev
let _twilio = null;
async function getTwilio() {
  if (_twilio) return _twilio;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
  try {
    const mod = await (new Function('return import("twilio")'))();
    const TwilioCtor = mod.default || mod;
    _twilio = TwilioCtor(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return _twilio;
  } catch (e) {
    console.warn('Twilio not available:', e?.message || e);
    return null;
  }
}

const SAFE_MODE = (process.env.SOCIAL_INVITES_SAFE_MODE === '1');
const twilio = (TwilioLib && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? TwilioLib(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// In-memory trackers (ephemeral on serverless)
const invitations = new Map();
const viralTracking = new Map();

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const base = '/.netlify/functions/social-invites';
  const path = (event.path || '').startsWith(base) ? event.path.slice(base.length) : (event.path || '');
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // 1) Facebook mass invite (limitations apply; friend list requires app usage and notifications are restricted)
    if (path === '/facebook-invite' && method === 'POST') {
      const { userId, accessToken, eventId, customMessage } = body;
      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL || ''}/join?ref=${inviteCode}&from=fb`;

      let friends = [];
      if (!SAFE_MODE) {
        const fbResponse = await axios.get('https://graph.facebook.com/v18.0/me/friends', {
          params: { access_token: accessToken, limit: 5000, fields: 'id,name' }
        });
        friends = fbResponse?.data?.data || [];
        // Batch notifications are only allowed for specific app types; many apps cannot use this.
        for (let i = 0; i < friends.length; i += 50) {
          const batch = friends.slice(i, i + 50).map(friend => ({
            method: 'POST',
            relative_url: `${friend.id}/notifications`,
            body: `template=${encodeURIComponent(customMessage || 'Join me at Sound Factory!')}&href=${encodeURIComponent(inviteLink)}`
          }));
          await axios.post('https://graph.facebook.com/v18.0/', {
            batch: JSON.stringify(batch),
            access_token: accessToken
          });
        }
      } else {
        // Simulate 200 friends in safe mode
        friends = Array.from({ length: 200 }).map((_,i)=>({ id:'sim'+i, name:'Friend '+(i+1) }));
      }

      const inviteData = {
        userId, platform: 'facebook', friendsInvited: friends.length, inviteCode,
        timestamp: new Date().toISOString(), conversions: 0, rewards: calculateRewards(friends.length)
      };
      invitations.set(inviteCode, inviteData);
      // Persist
      const supa = getAdminClient();
      if (supa) {
        await insert('invites', { invite_code: inviteCode, user_id: userId, platform: 'facebook', friends_invited: friends.length });
      }
      updateViralScore(userId, friends.length, 'facebook');

      return json(headers, 200, {
        success: true, invited: friends.length, inviteCode, rewards: inviteData.rewards,
        message: `Invited ${friends.length} Facebook friends${SAFE_MODE?' (simulated)':''}.`
      });
    }

    // 2) Instagram: cannot mass DM; provide story/bio/post guidance with link
    if (path === '/instagram-invite' && method === 'POST') {
      const { userId, accessToken, customMessage } = body;
      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL || ''}/join?ref=${inviteCode}&from=ig`;

      let followersCount = 0;
      if (!SAFE_MODE) {
        const igResponse = await axios.get('https://graph.instagram.com/me', {
          params: { fields: 'id,username,account_type,media_count', access_token: accessToken }
        });
        // Instagram Basic Display API does not expose followers_count; use 0 or another signal
        followersCount = igResponse?.data?.media_count || 0;
      } else {
        followersCount = 500; // simulate
      }

      const storyMessage = customMessage || `🔥 SOUND FACTORY INVITE 🔥\n\nJoin me at the wildest club experience!\n\n${inviteLink}\n\nFirst 50 people get VIP perks! 👑`;

      const inviteData = {
        userId, platform: 'instagram', followersReached: followersCount, inviteCode,
        timestamp: new Date().toISOString(), conversions: 0, rewards: calculateRewards(followersCount)
      };
      invitations.set(inviteCode, inviteData);
      const supa2 = getAdminClient();
      if (supa2) {
        await insert('invites', { invite_code: inviteCode, user_id: userId, platform: 'instagram', followers_reached: followersCount });
      }
      updateViralScore(userId, followersCount, 'instagram');

      return json(headers, 200, {
        success: true, followersReached: followersCount, inviteCode, inviteLink,
        storyText: storyMessage, rewards: inviteData.rewards,
        instructions: 'Share this link in your story and bio!'
      });
    }

    // 3) Twitter/X tweet creation
    if (path === '/twitter-invite' && method === 'POST') {
      const { userId, accessToken, customMessage } = body;
      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL || ''}/join?ref=${inviteCode}&from=tw`;

      let tweetId = 'simulated';
      let followerCount = 0;
      if (!SAFE_MODE) {
        const tweetText = customMessage || `🚨 SOUND FACTORY INVITE DROP 🚨\n\n${inviteLink}\n\nFirst 100 people get:\n✅ Skip the line forever\n✅ Free drink tickets\n✅ VIP table access\n\nRT to save a life 🔥\n\n#SoundFactory #ExclusiveInvite`;
        const twitterResponse = await axios.post('https://api.twitter.com/2/tweets', { text: tweetText }, {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        tweetId = twitterResponse?.data?.data?.id || tweetId;
        const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
          params: { 'user.fields': 'public_metrics' },
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        followerCount = userResponse?.data?.data?.public_metrics?.followers_count || 0;
      } else {
        tweetId = 'sim_' + Math.random().toString(36).slice(2,8);
        followerCount = 1200;
      }

      const inviteData = {
        userId, platform: 'twitter', followersReached: followerCount, inviteCode, tweetId,
        timestamp: new Date().toISOString(), conversions: 0, rewards: calculateRewards(followerCount)
      };
      invitations.set(inviteCode, inviteData);
      const supa3 = getAdminClient();
      if (supa3) {
        await insert('invites', { invite_code: inviteCode, user_id: userId, platform: 'twitter', followers_reached: followerCount, tweet_id: tweetId });
      }
      updateViralScore(userId, followerCount, 'twitter');

      return json(headers, 200, { success: true, followersReached: followerCount, inviteCode, tweetId, rewards: inviteData.rewards });
    }

    // 4) WhatsApp via Twilio (requires WhatsApp Business approval and opt-in)
    if (path === '/whatsapp-invite' && method === 'POST') {
      const { userId, phoneNumbers = [], customMessage } = body;
      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL || ''}/join?ref=${inviteCode}&from=wa`;
      const message = customMessage || `🔥 *SOUND FACTORY EXCLUSIVE* 🔥\n\nYou're invited to the most insane club experience!\n\n👉 ${inviteLink}\n\n*First 20 signups get:*\n• FREE entry this weekend\n• VIP table access\n• Drink tickets\n\nThis invite expires in 24 hours! Don't sleep on this 💀`;

      const results = [];
      const twilio = await getTwilio();
      for (const number of phoneNumbers) {
        if (SAFE_MODE || !twilio) {
          results.push({ number, success: true, simulated: true });
          continue;
        }
        try {
          await twilio.messages.create({ body: message, from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, to: `whatsapp:${number}` });
          results.push({ number, success: true });
        } catch (e) {
          results.push({ number, success: false, error: e.message });
        }
      }
      const successCount = results.filter(r=>r.success).length;

      const inviteData = {
        userId, platform: 'whatsapp', numbersInvited: successCount, inviteCode,
        timestamp: new Date().toISOString(), conversions: 0, rewards: calculateRewards(successCount)
      };
      invitations.set(inviteCode, inviteData);
      const supa4 = getAdminClient();
      if (supa4) {
        await insert('invites', { invite_code: inviteCode, user_id: userId, platform: 'whatsapp', numbers_invited: successCount });
      }
      updateViralScore(userId, successCount, 'whatsapp');

      return json(headers, 200, { success: true, sent: successCount, failed: phoneNumbers.length - successCount, inviteCode, rewards: inviteData.rewards, results });
    }

    // 5) Track conversion
    if (path === '/track-conversion' && method === 'POST') {
      const { inviteCode, newUserId } = body;
      let invite = invitations.get(inviteCode);
      if (!invite) {
        const supa = getAdminClient();
        if (supa) {
          const { data } = await select('invites', { invite_code: inviteCode });
          if (data && data[0]) invite = { userId: data[0].user_id, platform: data[0].platform, conversions: data[0].conversions||0 };
        }
      }
      if (!invite) return json(headers, 404, { error: 'Invalid invite code' });
      invite.conversions++;
      const conversionReward = calculateConversionReward(invite.conversions);
      await grantRewards(invite.userId, conversionReward);
      await sendRewardNotification(invite.userId, conversionReward, invite.conversions);
      trackViralChain(invite.userId, newUserId, inviteCode);
      const supa5 = getAdminClient();
      if (supa5) {
        await insert('invite_conversions', { invite_code: inviteCode, invitee_user_id: newUserId });
        await update('invites', { invite_code: inviteCode }, { conversions: invite.conversions });
      }
      return json(headers, 200, { success: true, inviterReward: conversionReward, totalConversions: invite.conversions });
    }

    // 6) Viral leaderboard (ephemeral)
    if (path === '/viral-leaderboard' && method === 'GET') {
      const leaderboard = [];
      viralTracking.forEach((data, userId) => {
        leaderboard.push({ userId, totalInvites: data.totalInvites, totalConversions: data.totalConversions, viralScore: data.viralScore, rank: 0 });
      });
      leaderboard.sort((a,b)=>b.viralScore-a.viralScore);
      leaderboard.forEach((e,i)=>{ e.rank = i+1; });
      return json(headers, 200, { success:true, leaderboard: leaderboard.slice(0,100), topInviters: leaderboard.slice(0,10).map(u=>({ ...u, prize: getLeaderboardPrize(u.rank) })) });
    }

    return json(headers, 404, { error: 'Route not found' });
  } catch (error) {
    console.error('Error:', error);
    return json(headers, 500, { error: 'Internal server error', message: error.message });
  }
}

function json(headers, statusCode, body){
  return { statusCode, headers, body: JSON.stringify(body) };
}

// Helpers (ported)
function generateInviteCode(userId) {
  const id = String(userId || '').slice(-4) || Math.random().toString(36).slice(2,6);
  return `SF_${id}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function calculateRewards(inviteCount) {
  const rewards = { tickets: 0, vipUpgrade: false, drinks: 0, cashBonus: 0 };
  if (inviteCount >= 10) rewards.drinks = 2;
  if (inviteCount >= 25) rewards.tickets = 1;
  if (inviteCount >= 50) { rewards.tickets = 2; rewards.drinks = 5; }
  if (inviteCount >= 100) { rewards.vipUpgrade = true; rewards.cashBonus = 50; }
  if (inviteCount >= 500) { rewards.cashBonus = 250; rewards.tickets = 10; }
  return rewards;
}

function calculateConversionReward(conversionCount) {
  return { drinks: Math.floor(conversionCount / 5), tickets: Math.floor(conversionCount / 10), cashBonus: conversionCount >= 20 ? conversionCount * 5 : 0, vipDays: conversionCount >= 50 ? 30 : 0 };
}

function updateViralScore(userId, invitesSent, platform) {
  if (!viralTracking.has(userId)) viralTracking.set(userId, { totalInvites: 0, totalConversions: 0, viralScore: 0, platforms: {} });
  const userData = viralTracking.get(userId);
  userData.totalInvites += invitesSent;
  userData.platforms[platform] = (userData.platforms[platform] || 0) + invitesSent;
  userData.viralScore = userData.totalInvites + (userData.totalConversions * 10);
  viralTracking.set(userId, userData);
}

function trackViralChain(inviterId, inviteeId, inviteCode) {
  const chainData = { from: inviterId, to: inviteeId, code: inviteCode, timestamp: new Date().toISOString(), generation: 1 };
  console.log('Viral chain:', chainData);
}

async function grantRewards(userId, rewards) {
  console.log(`Granting rewards to ${userId}:`, rewards);
}

async function sendRewardNotification(userId, rewards, totalConversions) {
  const message = `🎉 REWARD UNLOCKED!\n\nYour invite just brought in signup #${totalConversions}!\n\nYou earned:\n` +
    (rewards.drinks > 0 ? `🍹 ${rewards.drinks} free drinks\n` : '') +
    (rewards.tickets > 0 ? `🎫 ${rewards.tickets} free tickets\n` : '') +
    (rewards.cashBonus > 0 ? `💰 $${rewards.cashBonus} bonus\n` : '') +
    (rewards.vipDays > 0 ? `👑 ${rewards.vipDays} days of VIP\n` : '') +
    `\nKeep inviting to climb the leaderboard!`;
  console.log('Notification:', message);
}

function getLeaderboardPrize(rank) {
  const prizes = {
    1: '$1000 cash + Lifetime VIP + 50 tickets',
    2: '$500 cash + 1 Year VIP + 25 tickets',
    3: '$250 cash + 6 Months VIP + 15 tickets',
    4: '$100 cash + 3 Months VIP + 10 tickets',
    5: '$50 cash + 1 Month VIP + 5 tickets',
    '6-10': '2 Weeks VIP + 3 tickets',
    '11-20': '1 Week VIP + 1 ticket',
    '21-50': '2 free drinks',
    '51-100': '1 free drink'
  };
  if (rank <= 5) return prizes[rank];
  if (rank <= 10) return prizes['6-10'];
  if (rank <= 20) return prizes['11-20'];
  if (rank <= 50) return prizes['21-50'];
  if (rank <= 100) return prizes['51-100'];
  return 'Keep climbing!';
}
