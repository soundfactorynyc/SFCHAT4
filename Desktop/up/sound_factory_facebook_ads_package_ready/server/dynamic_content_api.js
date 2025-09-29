/**
 * Sound Factory Dynamic Content API
 * 
 * This Node.js Express server provides endpoints for dynamic content
 * that can be used in Facebook Dynamic Ads for Sound Factory.
 * 
 * To use:
 * 1. Install dependencies: npm install express cors
 * 2. Run server: node dynamic_content_api.js
 * 3. Configure Facebook Dynamic Ads to fetch data from these endpoints
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS using env-configured origins (fallback to FB domains)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || [
  'https://www.facebook.com',
  'https://facebook.com',
  'https://www.instagram.com',
  'https://instagram.com'
]).toString().split(',');
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser tools
    const ok = allowedOrigins.some(o => origin === o || origin.startsWith(o));
    if (ok) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  }
}));

// Mock database for demonstration
// In production, connect to your actual database
const mockDatabase = {
  inventory: {
    tables: {
      premium: { total: 10, reserved: 3, available: 7 },
      standard: { total: 20, reserved: 8, available: 12 }
    },
    tickets: {
      general: { total: 500, sold: 377, available: 123 },
      vip: { total: 100, sold: 65, available: 35 }
    }
  },
  recentPurchases: [
    { time: '2 minutes ago', item: 'Premium VIP Table', price: 1500 },
    { time: '5 minutes ago', item: 'General Admission (2)', price: 150 },
    { time: '8 minutes ago', item: 'Standard VIP Table', price: 1000 },
    { time: '12 minutes ago', item: 'VIP Tickets (4)', price: 600 }
  ],
  events: [
    {
      id: 'sf-nov-2025',
      name: 'Sound Factory Grand Opening',
      date: '2025-11-01T20:00:00-04:00',
      ticketsAvailable: 123,
      tablesAvailable: 7
    },
    {
      id: 'sf-dec-2025',
      name: 'Sound Factory Holiday Special',
      date: '2025-12-15T21:00:00-05:00',
      ticketsAvailable: 350,
      tablesAvailable: 15
    }
  ]
};

// Track active visitors (simulated)
let activeVisitors = 145;

// Update active visitors randomly every minute
setInterval(() => {
  // Random fluctuation between -10 and +10
  const change = Math.floor(Math.random() * 21) - 10;
  activeVisitors = Math.max(100, activeVisitors + change);
}, 60000);

/**
 * Site Activity API Endpoint
 * Returns current site activity metrics for dynamic ads
 */
app.get('/api/site-activity', (req, res) => {
  // Add CORS headers specifically for Facebook
  res.header("Access-Control-Allow-Origin", "https://www.facebook.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Return the data
  res.json({
    activeVisitors: activeVisitors,
    recentPurchases: mockDatabase.recentPurchases,
    timestamp: new Date().toISOString()
  });
});

/**
 * Inventory API Endpoint
 * Returns current inventory levels for dynamic ads
 */
app.get('/api/inventory', (req, res) => {
  // Add CORS headers specifically for Facebook
  res.header("Access-Control-Allow-Origin", "https://www.facebook.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Calculate totals
  const tablesRemaining = mockDatabase.inventory.tables.premium.available + 
                         mockDatabase.inventory.tables.standard.available;
  
  const ticketsRemaining = mockDatabase.inventory.tickets.general.available + 
                          mockDatabase.inventory.tickets.vip.available;
  
  // Return the data
  res.json({
    tablesRemaining: tablesRemaining,
    ticketsRemaining: ticketsRemaining,
    premiumTablesAvailable: mockDatabase.inventory.tables.premium.available,
    standardTablesAvailable: mockDatabase.inventory.tables.standard.available,
    generalTicketsAvailable: mockDatabase.inventory.tickets.general.available,
    vipTicketsAvailable: mockDatabase.inventory.tickets.vip.available,
    timestamp: new Date().toISOString()
  });
});

/**
 * Recent Activity API Endpoint
 * Returns recent purchase activity for dynamic ads
 */
app.get('/api/recent-activity', (req, res) => {
  // Add CORS headers specifically for Facebook
  res.header("Access-Control-Allow-Origin", "https://www.facebook.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Return the data
  res.json({
    recentPurchases: mockDatabase.recentPurchases,
    timestamp: new Date().toISOString()
  });
});

/**
 * Events API Endpoint
 * Returns upcoming events data for dynamic ads
 */
app.get('/api/events', (req, res) => {
  // Add CORS headers specifically for Facebook
  res.header("Access-Control-Allow-Origin", "https://www.facebook.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Return the data
  res.json({
    events: mockDatabase.events,
    timestamp: new Date().toISOString()
  });
});

/**
 * Facebook Dynamic Creative API Endpoint
 * Specifically formatted for Facebook's Dynamic Creative feature
 */
app.get('/api/facebook-dynamic-content', (req, res) => {
  // Add CORS headers specifically for Facebook
  res.header("Access-Control-Allow-Origin", "https://www.facebook.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Format specifically for Facebook's Dynamic Creative
  const dynamicContent = {
    active_visitors: activeVisitors,
    tables_remaining: mockDatabase.inventory.tables.premium.available + 
                     mockDatabase.inventory.tables.standard.available,
    tickets_remaining: mockDatabase.inventory.tickets.general.available + 
                      mockDatabase.inventory.tickets.vip.available,
    recent_purchase: mockDatabase.recentPurchases[0].item,
    days_remaining: calculateDaysRemaining(mockDatabase.events[0].date),
    event_name: mockDatabase.events[0].name,
    event_date: formatEventDate(mockDatabase.events[0].date)
  };
  
  res.json(dynamicContent);
});

/**
 * Helper function to calculate days remaining until an event
 */
function calculateDaysRemaining(eventDate) {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = Math.abs(event - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Helper function to format event date for display
 */
function formatEventDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Start the server
app.listen(port, () => {
  console.log(`Sound Factory Dynamic Content API running on port ${port}`);
  console.log('Allowed origins:', allowedOrigins);
});

/**
 * IMPLEMENTATION NOTES:
 * 
 * 1. In production, replace the mockDatabase with actual database connections
 * 2. Add proper authentication for API endpoints
 * 3. Implement rate limiting to prevent abuse
 * 4. Add error handling and logging
 * 5. Consider using a CDN for better performance
 * 6. Set up monitoring and alerts for API health
 * 
 * For implementation assistance, contact the NinjaTech AI team.
 */