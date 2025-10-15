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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email, name, phone, flyerRequest } = JSON.parse(event.body || '{}');

    if (!email || !name || !phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name, email, and phone are required' })
      };
    }

    // Normalize phone number (remove all non-digits and add +1 if needed)
    let normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length === 10) {
      normalizedPhone = '1' + normalizedPhone;
    }
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    console.log('Creating promoter:', { name, email, phone: normalizedPhone });

    // Check if already exists
    const { data: existing } = await supabase
      .from('promoters')
      .select('id, email, phone, status')
      .or(`email.eq.${email},phone.eq.${normalizedPhone}`)
      .single();

    if (existing) {
      if (existing.status === 'approved') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'You already have an account. Please sign in.',
            hasAccount: true
          })
        };
      }
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: existing.email === email 
            ? 'Email already registered. Please sign in.' 
            : 'Phone number already registered. Please sign in.',
          hasAccount: true
        })
      };
    }

    // Generate unique promo code
    const firstName = name.split(' ')[0].toUpperCase();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const promoCode = `${firstName.substring(0, 3)}${randomNum}`;

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      capabilities: { 
        card_payments: { requested: true },
        transfers: { requested: true } 
      },
      business_profile: { 
        name,
        mcc: '7999', // Entertainment/Recreation Services
        product_description: 'Event promotion and ticket sales'
      },
      metadata: { 
        name, 
        email, 
        phone: normalizedPhone,
        promo_code: promoCode 
      }
    });

    // Save to database with APPROVED status for streamlined flow
    const { data: newPromoter, error: dbError } = await supabase
      .from('promoters')
      .insert({
        name,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        email,
        phone: normalizedPhone,
        stripe_account_id: account.id,
        promo_code: promoCode,
        status: 'approved', // Auto-approve for immediate access
        admin_notes: 'Auto-approved on signup',
        flyer_request: flyerRequest || null,
        commission_earned: '0',
        tickets_sold: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Delete Stripe account if DB insert fails
      await stripe.accounts.del(account.id).catch(console.error);
      throw new Error('Failed to create promoter account');
    }

    // Generate Stripe onboarding link
    const base = process.env.PUBLIC_BASE_URL || getBaseUrl(event);
    const returnUrl = `${base}/promoter-login.html?onboarded=true&promo=${promoCode}`;
    const refreshUrl = `${base}/index.html`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: refreshUrl
    });

    console.log('Promoter created successfully:', { 
      email, 
      phone: normalizedPhone, 
      promoCode,
      status: 'approved'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        onboardingUrl: accountLink.url,
        promoCode,
        status: 'approved',
        message: 'Account created successfully! Complete Stripe setup to receive payments.'
      })
    };

  } catch (err) {
    console.error('Error creating promoter:', err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to create account. Please try again.' 
      }) 
    };
  }
};