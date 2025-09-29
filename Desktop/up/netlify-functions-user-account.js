// netlify/functions/user-account.js
// USER ACCOUNT SYSTEM - Profile, Tickets, History

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In production, use a real database (Supabase, Firebase, etc.)
// For now, using in-memory storage for example
const users = new Map();
const sessions = new Map();
const tickets = new Map();

// Generate unique user ID
const generateUserId = () => {
  return 'USR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Generate ticket code
const generateTicketCode = () => {
  return 'TKT_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET || 'sound-factory-secret-key',
    { expiresIn: '30d' }
  );
};

// Main handler
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const path = event.path.replace('/.netlify/functions/user-account', '');
  const method = event.httpMethod;

  try {
    // Parse body if present
    const body = event.body ? JSON.parse(event.body) : {};

    // ROUTES
    
    // 1. REGISTER NEW USER
    if (path === '/register' && method === 'POST') {
      const { 
        phoneNumber, 
        username, 
        email, 
        password,
        profilePic 
      } = body;

      // Check if user exists
      let existingUser = null;
      users.forEach(user => {
        if (user.phoneNumber === phoneNumber || user.email === email) {
          existingUser = user;
        }
      });

      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'User already exists with this phone or email'
          })
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user object
      const userId = generateUserId();
      const newUser = {
        userId,
        username: username || `SF_USER_${Date.now()}`,
        phoneNumber,
        email,
        password: hashedPassword,
        profilePic: profilePic || null,
        verified: false,
        pin: null,
        vipStatus: false,
        totalSpent: 0,
        energyLevel: 1,
        tickets: [],
        achievements: [],
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        preferences: {
          favoritePersonality: null,
          notifications: true,
          publicProfile: true
        },
        stats: {
          messagesSent: 0,
          effectsTriggered: 0,
          chaosLevel: 0,
          demonSummons: 0
        }
      };

      // Save user
      users.set(userId, newUser);

      // Generate token
      const token = generateToken(userId);
      sessions.set(token, userId);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            userId,
            username: newUser.username,
            profilePic: newUser.profilePic,
            verified: newUser.verified
          },
          token
        })
      };
    }

    // 2. LOGIN
    if (path === '/login' && method === 'POST') {
      const { phoneNumber, email, password } = body;

      // Find user
      let foundUser = null;
      users.forEach(user => {
        if ((phoneNumber && user.phoneNumber === phoneNumber) || 
            (email && user.email === email)) {
          foundUser = user;
        }
      });

      if (!foundUser) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, foundUser.password);
      if (!validPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid password' })
        };
      }

      // Update last active
      foundUser.lastActive = new Date().toISOString();

      // Generate token
      const token = generateToken(foundUser.userId);
      sessions.set(token, foundUser.userId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            userId: foundUser.userId,
            username: foundUser.username,
            profilePic: foundUser.profilePic,
            verified: foundUser.verified,
            vipStatus: foundUser.vipStatus,
            totalSpent: foundUser.totalSpent
          },
          token
        })
      };
    }

    // 3. UPDATE PROFILE
    if (path === '/profile' && method === 'PUT') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      
      if (!token || !sessions.has(token)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const userId = sessions.get(token);
      const user = users.get(userId);

      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

      // Update allowed fields
      const { username, profilePic, preferences } = body;
      
      if (username) user.username = username;
      if (profilePic) user.profilePic = profilePic;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };
      
      user.lastActive = new Date().toISOString();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            userId: user.userId,
            username: user.username,
            profilePic: user.profilePic,
            verified: user.verified
          }
        })
      };
    }

    // 4. SET PIN (Verification)
    if (path === '/pin' && method === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      
      if (!token || !sessions.has(token)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const userId = sessions.get(token);
      const user = users.get(userId);
      const { pin } = body;

      if (!pin || pin.length !== 4) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'PIN must be 4 digits' })
        };
      }

      // Hash PIN for security
      user.pin = await bcrypt.hash(pin, 10);
      user.verified = true;
      
      // Grant verification achievement
      if (!user.achievements.includes('VERIFIED')) {
        user.achievements.push('VERIFIED');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'PIN set successfully! You are now verified.',
          verified: true
        })
      };
    }

    // 5. PURCHASE TICKET
    if (path === '/purchase-ticket' && method === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      
      if (!token || !sessions.has(token)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const userId = sessions.get(token);
      const user = users.get(userId);
      const { eventName, price, date } = body;

      // Create Stripe checkout session for ticket
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Sound Factory - ${eventName}`,
              description: `Ticket for ${date}`,
              images: ['https://soundfactory.com/logo.png']
            },
            unit_amount: price * 100 // Convert to cents
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${process.env.SITE_URL}/success?ticket={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SITE_URL}/tickets`,
        metadata: {
          userId,
          eventName,
          date
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id
        })
      };
    }

    // 6. GET USER TICKETS
    if (path === '/tickets' && method === 'GET') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      
      if (!token || !sessions.has(token)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const userId = sessions.get(token);
      const user = users.get(userId);

      // Get all user tickets
      const userTickets = [];
      tickets.forEach((ticket, ticketId) => {
        if (ticket.userId === userId) {
          userTickets.push({
            ticketId,
            ...ticket
          });
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          tickets: userTickets
        })
      };
    }

    // 7. DOWNLOAD TICKET
    if (path.startsWith('/download-ticket/') && method === 'GET') {
      const ticketId = path.replace('/download-ticket/', '');
      const token = event.headers.authorization?.replace('Bearer ', '');
      
      if (!token || !sessions.has(token)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const userId = sessions.get(token);
      const ticket = tickets.get(ticketId);

      if (!ticket || ticket.userId !== userId) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Ticket not found' })
        };
      }

      // Generate QR code for ticket
      const qrData = {
        ticketId,
        userId,
        eventName: ticket.eventName,
        date: ticket.date,
        code: ticket.code,
        verified: ticket.verified
      };

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          ticket: {
            ...ticket,
            qrCode: Buffer.from(JSON.stringify(qrData)).toString('base64'),
            downloadUrl: `${process.env.SITE_URL}/api/ticket-pdf/${ticketId}`
          }
        })
      };
    }

    // 8. GET PUBLIC PROFILE
    if (path.startsWith('/public/') && method === 'GET') {
      const username = path.replace('/public/', '');
      
      let foundUser = null;
      users.forEach(user => {
        if (user.username === username && user.preferences.publicProfile) {
          foundUser = user;
        }
      });

      if (!foundUser) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Profile not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          profile: {
            username: foundUser.username,
            profilePic: foundUser.profilePic,
            verified: foundUser.verified,
            vipStatus: foundUser.vipStatus,
            achievements: foundUser.achievements,
            stats: foundUser.stats,
            joinDate: foundUser.joinDate,
            energyLevel: foundUser.energyLevel
          }
        })
      };
    }

    // 9. LEADERBOARD
    if (path === '/leaderboard' && method === 'GET') {
      const leaderboard = [];
      
      users.forEach(user => {
        if (user.preferences.publicProfile) {
          leaderboard.push({
            username: user.username,
            profilePic: user.profilePic,
            verified: user.verified,
            vipStatus: user.vipStatus,
            totalSpent: user.totalSpent,
            chaosLevel: user.stats.chaosLevel,
            energyLevel: user.energyLevel
          });
        }
      });

      // Sort by chaos level
      leaderboard.sort((a, b) => b.chaosLevel - a.chaosLevel);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          leaderboard: leaderboard.slice(0, 100) // Top 100
        })
      };
    }

    // 10. STRIPE WEBHOOK - Process ticket purchase
    if (path === '/stripe-webhook' && method === 'POST') {
      const sig = event.headers['stripe-signature'];
      
      try {
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );

        if (stripeEvent.type === 'checkout.session.completed') {
          const session = stripeEvent.data.object;
          const { userId, eventName, date } = session.metadata;
          
          // Create ticket
          const ticketCode = generateTicketCode();
          const ticketId = 'TKT_' + Date.now();
          
          const newTicket = {
            userId,
            eventName,
            date,
            code: ticketCode,
            purchaseDate: new Date().toISOString(),
            price: session.amount_total / 100,
            verified: true,
            used: false,
            qrScans: []
          };
          
          tickets.set(ticketId, newTicket);
          
          // Update user
          const user = users.get(userId);
          if (user) {
            user.tickets.push(ticketId);
            user.totalSpent += newTicket.price;
            
            // Check for VIP status
            if (user.totalSpent >= 500 && !user.vipStatus) {
              user.vipStatus = true;
              user.achievements.push('VIP');
            }
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ received: true })
        };
        
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Webhook error' })
        };
      }
    }

    // Default 404
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
