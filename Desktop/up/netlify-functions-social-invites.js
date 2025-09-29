// netlify/functions/social-invites.js
// VIRAL INVITATION SYSTEM - Facebook & Instagram mass invites

const jwt = require('jsonwebtoken');
const axios = require('axios');
const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Track invitations for rewards
const invitations = new Map();
const viralTracking = new Map();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const path = event.path.replace('/.netlify/functions/social-invites', '');
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    
    // 1. FACEBOOK MASS INVITE
    if (path === '/facebook-invite' && method === 'POST') {
      const {
        userId,
        accessToken, // Facebook access token from OAuth
        eventId,
        customMessage
      } = body;

      // Get user's Facebook friends
      const fbResponse = await axios.get('https://graph.facebook.com/v18.0/me/friends', {
        params: {
          access_token: accessToken,
          limit: 5000, // Get max friends
          fields: 'id,name,email'
        }
      });

      const friends = fbResponse.data.data;
      const inviteCode = generateInviteCode(userId);
      
      // Create personalized invite link
      const inviteLink = `${process.env.SITE_URL}/join?ref=${inviteCode}&from=fb`;
      
      // Send batch invites via Facebook
      const batchRequests = friends.map(friend => ({
        method: 'POST',
        relative_url: `${friend.id}/notifications`,
        body: `template=${encodeURIComponent(customMessage || 'Join me at Sound Factory!')}&href=${encodeURIComponent(inviteLink)}`
      }));

      // Facebook batch API (send up to 50 at a time)
      const batches = [];
      for (let i = 0; i < batchRequests.length; i += 50) {
        const batch = batchRequests.slice(i, i + 50);
        
        const batchResponse = await axios.post('https://graph.facebook.com/v18.0/', {
          batch: JSON.stringify(batch),
          access_token: accessToken
        });
        
        batches.push(batchResponse.data);
      }

      // Track invitations
      const inviteData = {
        userId,
        platform: 'facebook',
        friendsInvited: friends.length,
        inviteCode,
        timestamp: new Date().toISOString(),
        conversions: 0,
        rewards: calculateRewards(friends.length)
      };

      invitations.set(inviteCode, inviteData);
      
      // Update user's viral score
      updateViralScore(userId, friends.length, 'facebook');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          invited: friends.length,
          inviteCode,
          rewards: inviteData.rewards,
          message: `Invited ${friends.length} Facebook friends! You'll earn rewards for each signup!`
        })
      };
    }

    // 2. INSTAGRAM MASS INVITE  
    if (path === '/instagram-invite' && method === 'POST') {
      const {
        userId,
        accessToken, // Instagram Basic Display API token
        customMessage
      } = body;

      // Get Instagram followers/following
      const igResponse = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username,account_type,media_count,followers_count',
          access_token: accessToken
        }
      });

      // Get user's recent media to comment with invite
      const mediaResponse = await axios.get('https://graph.instagram.com/me/media', {
        params: {
          fields: 'id,caption,media_type,media_url,permalink',
          access_token: accessToken
        }
      });

      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL}/join?ref=${inviteCode}&from=ig`;
      
      // Create story with invite link
      const storyMessage = customMessage || 
        `🔥 SOUND FACTORY INVITE 🔥\n\nJoin me at the wildest club experience!\n\n${inviteLink}\n\nFirst 50 people get VIP perks! 👑`;

      // Instagram doesn't allow automated DMs, but we can:
      // 1. Post story with link
      // 2. Update bio with link  
      // 3. Create a post with invite code

      // Track invitation
      const inviteData = {
        userId,
        platform: 'instagram',
        followersReached: igResponse.data.followers_count,
        inviteCode,
        timestamp: new Date().toISOString(),
        conversions: 0,
        rewards: calculateRewards(igResponse.data.followers_count)
      };

      invitations.set(inviteCode, inviteData);
      updateViralScore(userId, igResponse.data.followers_count, 'instagram');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          followersReached: igResponse.data.followers_count,
          inviteCode,
          inviteLink,
          storyText: storyMessage,
          rewards: inviteData.rewards,
          instructions: 'Share this link in your story and bio! We\'ve copied it to your clipboard.'
        })
      };
    }

    // 3. TWITTER/X MASS INVITE
    if (path === '/twitter-invite' && method === 'POST') {
      const {
        userId,
        accessToken,
        customMessage
      } = body;

      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL}/join?ref=${inviteCode}&from=tw`;
      
      // Create viral tweet
      const tweetText = customMessage || 
        `🚨 SOUND FACTORY INVITE DROP 🚨\n\n${inviteLink}\n\nFirst 100 people get:\n✅ Skip the line forever\n✅ Free drink tickets\n✅ VIP table access\n\nRT to save a life 🔥\n\n#SoundFactory #ExclusiveInvite`;

      // Post tweet with Twitter API v2
      const twitterResponse = await axios.post('https://api.twitter.com/2/tweets', {
        text: tweetText
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Get follower count for rewards calculation
      const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
        params: {
          'user.fields': 'public_metrics'
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const followerCount = userResponse.data.data.public_metrics.followers_count;

      const inviteData = {
        userId,
        platform: 'twitter',
        followersReached: followerCount,
        inviteCode,
        tweetId: twitterResponse.data.data.id,
        timestamp: new Date().toISOString(),
        conversions: 0,
        rewards: calculateRewards(followerCount)
      };

      invitations.set(inviteCode, inviteData);
      updateViralScore(userId, followerCount, 'twitter');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          followersReached: followerCount,
          inviteCode,
          tweetId: twitterResponse.data.data.id,
          rewards: inviteData.rewards
        })
      };
    }

    // 4. WHATSAPP MASS INVITE
    if (path === '/whatsapp-invite' && method === 'POST') {
      const {
        userId,
        phoneNumbers, // Array of phone numbers
        customMessage
      } = body;

      const inviteCode = generateInviteCode(userId);
      const inviteLink = `${process.env.SITE_URL}/join?ref=${inviteCode}&from=wa`;
      
      const message = customMessage || 
        `🔥 *SOUND FACTORY EXCLUSIVE* 🔥\n\nYou're invited to the most insane club experience!\n\n👉 ${inviteLink}\n\n*First 20 signups get:*\n• FREE entry this weekend\n• VIP table access\n• Drink tickets\n\nThis invite expires in 24 hours! Don't sleep on this 💀`;

      // Send WhatsApp messages via Twilio
      const sendPromises = phoneNumbers.map(async (number) => {
        try {
          await twilio.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${number}`
          });
          return { number, success: true };
        } catch (error) {
          return { number, success: false, error: error.message };
        }
      });

      const results = await Promise.all(sendPromises);
      const successCount = results.filter(r => r.success).length;

      const inviteData = {
        userId,
        platform: 'whatsapp',
        numbersInvited: successCount,
        inviteCode,
        timestamp: new Date().toISOString(),
        conversions: 0,
        rewards: calculateRewards(successCount)
      };

      invitations.set(inviteCode, inviteData);
      updateViralScore(userId, successCount, 'whatsapp');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sent: successCount,
          failed: phoneNumbers.length - successCount,
          inviteCode,
          rewards: inviteData.rewards,
          results
        })
      };
    }

    // 5. TRACK CONVERSION (when someone signs up with invite code)
    if (path === '/track-conversion' && method === 'POST') {
      const { inviteCode, newUserId } = body;
      
      const invite = invitations.get(inviteCode);
      if (!invite) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Invalid invite code' })
        };
      }

      // Update conversion count
      invite.conversions++;
      
      // Calculate bonus rewards for inviter
      const conversionReward = calculateConversionReward(invite.conversions);
      
      // Grant rewards to inviter
      await grantRewards(invite.userId, conversionReward);
      
      // Send notification to inviter
      await sendRewardNotification(invite.userId, conversionReward, invite.conversions);

      // Track viral chain
      trackViralChain(invite.userId, newUserId, inviteCode);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          inviterReward: conversionReward,
          totalConversions: invite.conversions
        })
      };
    }

    // 6. GET VIRAL LEADERBOARD
    if (path === '/viral-leaderboard' && method === 'GET') {
      const leaderboard = [];
      
      viralTracking.forEach((data, userId) => {
        leaderboard.push({
          userId,
          totalInvites: data.totalInvites,
          totalConversions: data.totalConversions,
          viralScore: data.viralScore,
          rank: 0
        });
      });

      // Sort by viral score
      leaderboard.sort((a, b) => b.viralScore - a.viralScore);
      
      // Add ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          leaderboard: leaderboard.slice(0, 100), // Top 100
          topInviters: leaderboard.slice(0, 10).map(u => ({
            ...u,
            prize: getLeaderboardPrize(u.rank)
          }))
        })
      };
    }

    // Default
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Helper functions
function generateInviteCode(userId) {
  return `SF_${userId.substr(-4)}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function calculateRewards(inviteCount) {
  const rewards = {
    tickets: 0,
    vipUpgrade: false,
    drinks: 0,
    cashBonus: 0
  };

  if (inviteCount >= 10) rewards.drinks = 2;
  if (inviteCount >= 25) rewards.tickets = 1;
  if (inviteCount >= 50) {
    rewards.tickets = 2;
    rewards.drinks = 5;
  }
  if (inviteCount >= 100) {
    rewards.vipUpgrade = true;
    rewards.cashBonus = 50;
  }
  if (inviteCount >= 500) {
    rewards.cashBonus = 250;
    rewards.tickets = 10;
  }

  return rewards;
}

function calculateConversionReward(conversionCount) {
  const rewards = {
    drinks: Math.floor(conversionCount / 5),
    tickets: Math.floor(conversionCount / 10),
    cashBonus: conversionCount >= 20 ? conversionCount * 5 : 0,
    vipDays: conversionCount >= 50 ? 30 : 0
  };
  
  return rewards;
}

function updateViralScore(userId, invitesSent, platform) {
  if (!viralTracking.has(userId)) {
    viralTracking.set(userId, {
      totalInvites: 0,
      totalConversions: 0,
      viralScore: 0,
      platforms: {}
    });
  }
  
  const userData = viralTracking.get(userId);
  userData.totalInvites += invitesSent;
  userData.platforms[platform] = (userData.platforms[platform] || 0) + invitesSent;
  
  // Viral score = invites + (conversions * 10)
  userData.viralScore = userData.totalInvites + (userData.totalConversions * 10);
  
  viralTracking.set(userId, userData);
}

function trackViralChain(inviterId, inviteeId, inviteCode) {
  // Track the viral spread chain
  // This could be used to visualize how invites spread through the network
  const chainData = {
    from: inviterId,
    to: inviteeId,
    code: inviteCode,
    timestamp: new Date().toISOString(),
    generation: 1 // How many levels deep in the invite chain
  };
  
  // Store in database for viral analytics
  console.log('Viral chain:', chainData);
}

async function grantRewards(userId, rewards) {
  // In production, update user's account with rewards
  console.log(`Granting rewards to ${userId}:`, rewards);
}

async function sendRewardNotification(userId, rewards, totalConversions) {
  // Send SMS notification about earned rewards
  // In production, look up user's phone number from database
  const message = `🎉 REWARD UNLOCKED!\n\nYour invite just brought in signup #${totalConversions}!\n\nYou earned:\n` +
    (rewards.drinks > 0 ? `🍹 ${rewards.drinks} free drinks\n` : '') +
    (rewards.tickets > 0 ? `🎫 ${rewards.tickets} free tickets\n` : '') +
    (rewards.cashBonus > 0 ? `💰 $${rewards.cashBonus} bonus\n` : '') +
    (rewards.vipDays > 0 ? `👑 ${rewards.vipDays} days of VIP\n` : '') +
    `\nKeep inviting to climb the leaderboard!`;
  
  // await twilio.messages.create({...})
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
