// netlify/functions/stripe-express-login.js
// Generates Stripe Express dashboard login link for returning promoters
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function getBaseUrl(event) {
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (event.headers['x-forwarded-host'] || event.headers.host);
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const baseUrl = getBaseUrl(event);

    // Create login link to Stripe Express
    // This sends the user to connect.stripe.com/express_login
    // Stripe will handle email + SMS verification
    // After successful login, Stripe redirects back to your return_url
    
    const loginUrl = `https://connect.stripe.com/express_login?redirect=${encodeURIComponent(`${baseUrl}/stripe-oauth-callback-login.html`)}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        loginUrl: loginUrl
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Login failed' 
      })
    };
  }
};
