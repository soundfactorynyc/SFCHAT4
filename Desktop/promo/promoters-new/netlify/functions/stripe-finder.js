// stripe-finder.js - Stripe search and lookup functionality
const Stripe = require('stripe');

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { searchTerm, filter } = body;

    if (!searchTerm) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Search term is required' })
      };
    }

    const results = [];

    // Search based on filter type
    if (filter === 'all' || filter === 'customers') {
      try {
        // Search customers by email
        const customers = await stripe.customers.search({
          query: `email~'${searchTerm}' OR name~'${searchTerm}' OR phone~'${searchTerm}'`,
          limit: 10
        });
        
        results.push(...customers.data.map(customer => ({
          type: 'customer',
          id: customer.id,
          name: customer.name || 'Unknown',
          email: customer.email,
          phone: customer.phone,
          metadata: customer.metadata,
          created: new Date(customer.created * 1000).toISOString(),
          status: customer.deleted ? 'deleted' : 'active'
        })));
      } catch (err) {
        console.error('Customer search error:', err);
      }
    }

    if (filter === 'all' || filter === 'payments') {
      try {
        // Search payment intents
        const payments = await stripe.paymentIntents.search({
          query: `metadata['phone']~'${searchTerm}' OR metadata['email']~'${searchTerm}'`,
          limit: 10
        });
        
        results.push(...payments.data.map(payment => ({
          type: 'payment',
          id: payment.id,
          amount: `$${(payment.amount / 100).toFixed(2)}`,
          currency: payment.currency.toUpperCase(),
          customer: payment.customer,
          status: payment.status,
          created: new Date(payment.created * 1000).toISOString(),
          metadata: payment.metadata,
          receiptEmail: payment.receipt_email
        })));
      } catch (err) {
        console.error('Payment search error:', err);
      }
    }

    if (filter === 'all' || filter === 'subscriptions') {
      try {
        // Search subscriptions
        const subscriptions = await stripe.subscriptions.search({
          query: `metadata['phone']~'${searchTerm}' OR metadata['email']~'${searchTerm}'`,
          limit: 10
        });
        
        results.push(...subscriptions.data.map(sub => ({
          type: 'subscription',
          id: sub.id,
          customer: sub.customer,
          status: sub.status,
          plan: sub.items.data[0]?.price?.nickname || 'Unknown Plan',
          amount: `$${(sub.items.data[0]?.price?.unit_amount / 100).toFixed(2)}`,
          interval: sub.items.data[0]?.price?.recurring?.interval,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          metadata: sub.metadata
        })));
      } catch (err) {
        console.error('Subscription search error:', err);
      }
    }

    if (filter === 'all' || filter === 'invoices') {
      try {
        // Search invoices
        const invoices = await stripe.invoices.search({
          query: `metadata['phone']~'${searchTerm}' OR metadata['email']~'${searchTerm}'`,
          limit: 10
        });
        
        results.push(...invoices.data.map(invoice => ({
          type: 'invoice',
          id: invoice.id,
          customer: invoice.customer,
          status: invoice.status,
          amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
          paid: invoice.paid,
          dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null
        })));
      } catch (err) {
        console.error('Customer ID lookup error:', err);
      }
    }

    // Return all results
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        results: results,
        total: results.length
      })
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error' 
      })
    };
  }
};