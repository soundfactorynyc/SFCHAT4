// netlify/functions/create-promoter.js
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getBaseUrl(event) {
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (event.headers['x-forwarded-host'] || event.headers.host);
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { email, name, phone, flyerRequest } = JSON.parse(event.body || '{}');

    if (!email || !name || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, email, and phone are required' })
      };
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('promoters')
      .select('id, email, phone')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existing) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: existing.email === email 
            ? 'Email already registered' 
            : 'Phone number already registered' 
        })
      };
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      capabilities: { 
        card_payments: { requested: true },
        transfers: { requested: true } 
      },
      business_profile: { name },
      metadata: { name, email, phone }
    });

    const promoCode = `SF${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    // Save to Stripe metadata
    await stripe.accounts.update(account.id, { 
      metadata: { promoCode, name, email, phone } 
    });

    // Save to Supabase database with PENDING status
    const { error: dbError } = await supabase
      .from('promoters')
      .insert({
        name,
        email,
        phone,
        stripe_account_id: account.id,
        promo_code: promoCode,
        status: 'pending', // Awaiting admin approval
        admin_notes: 'New signup - pending review',
        flyer_request: flyerRequest || null
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Continue anyway - we have Stripe account
    }

    const base = process.env.PUBLIC_BASE_URL || getBaseUrl(event);
    const returnUrl = `${base}/promoter-dashboard.html?code=${promoCode}&registered=true`;
    const refreshUrl = `${base}/index.html`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: refreshUrl
    });

    console.log('Promoter created (pending approval):', { email, phone, promoCode });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        success: true,
        stripe_url: accountLink.url,  // Frontend expects this
        account_id: account.id,  // Frontend can use this as backup
        promo_code: promoCode,  // Frontend expects underscore version
        promoCode,  // Keep for compatibility
        status: 'pending',
        message: 'Account created! Complete Stripe onboarding, then await admin approval before you can log in.'
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, error: err.message }) };
  }
};