// netlify/functions/track-sale.js
// Comprehensive sale tracking system for promo codes
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { 
      promo_code,
      product_type,
      amount,
      customer_email,
      customer_name,
      payment_method,
      metadata = {}
    } = JSON.parse(event.body || '{}');

    // Find promoter by promo code
    const { data: promoter, error: promoterError } = await supabase
      .from('promoters')
      .select('*')
      .eq('promo_code', promo_code)
      .single();

    if (!promoter) {
      // Log unattributed sale for admin review
      await supabase
        .from('unattributed_sales')
        .insert({
          promo_code_used: promo_code,
          amount: amount,
          customer_email: customer_email,
          customer_name: customer_name,
          product_type: product_type,
          created_at: new Date().toISOString(),
          metadata: metadata
        });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Promo code not found, sale logged for review'
        })
      };
    }

    // Calculate commission
    let commission = 0;
    if (product_type === 'ticket') {
      commission = 10; // $10 per ticket
    } else if (product_type === 'table') {
      commission = (amount / 100) * 0.20; // 20% of table price
    }

    // Record the sale with full attribution
    const { data: sale, error: saleError } = await supabase
      .from('promoter_sales')
      .insert({
        promoter_id: promoter.id,
        promo_code: promo_code,
        amount: amount, // Amount in cents
        commission: Math.round(commission * 100), // Commission in cents
        product_type: product_type,
        customer_email: customer_email,
        customer_name: customer_name,
        payment_method: payment_method,
        status: 'completed',
        created_at: new Date().toISOString(),
        metadata: metadata
      })
      .select()
      .single();

    if (saleError) {
      console.error('Error recording sale:', saleError);
      throw saleError;
    }

    // Update promoter totals
    const newCommission = parseFloat(promoter.commission_earned || 0) + commission;
    const newTickets = (promoter.tickets_sold || 0) + (product_type === 'ticket' ? 1 : 0);
    const newTables = (promoter.tables_sold || 0) + (product_type === 'table' ? 1 : 0);

    await supabase
      .from('promoters')
      .update({
        commission_earned: newCommission.toFixed(2),
        tickets_sold: newTickets,
        tables_sold: newTables,
        last_sale_at: new Date().toISOString()
      })
      .eq('id', promoter.id);

    // Log commission payout record
    await supabase
      .from('commission_payouts')
      .insert({
        promoter_id: promoter.id,
        sale_id: sale.id,
        amount: Math.round(commission * 100),
        status: 'pending',
        stripe_account_id: promoter.stripe_account_id,
        created_at: new Date().toISOString()
      });

    console.log('Sale tracked successfully:', {
      promoter: promoter.name,
      promo_code: promo_code,
      commission: commission,
      total_earned: newCommission
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sale_id: sale.id,
        commission: commission,
        promoter: promoter.name
      })
    };

  } catch (error) {
    console.error('Track sale error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to track sale'
      })
    };
  }
};