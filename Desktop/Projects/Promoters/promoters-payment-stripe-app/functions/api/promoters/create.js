// Cloudflare Pages Function for creating promoter accounts
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { email, name, territory } = body;

    if (!email || !name) {
      return new Response(JSON.stringify({ 
        error: 'Email and name are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Express connected account using Stripe API
    const accountResponse = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'type': 'express',
        'email': email,
        'business_type': 'individual',
        'business_profile[name]': name,
        'business_profile[product_description]': 'Sound Factory NYC Promoter',
        'capabilities[card_payments][requested]': 'true',
        'capabilities[transfers][requested]': 'true',
        'metadata[promoter_name]': name,
        'metadata[territory]': territory || 'unassigned',
        'metadata[platform]': 'Sound Factory NYC'
      })
    });

    if (!accountResponse.ok) {
      const error = await accountResponse.json();
      throw new Error(error.error?.message || 'Failed to create Stripe account');
    }

    const account = await accountResponse.json();

    // Create account link for onboarding
    const accountLinkResponse = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'account': account.id,
        'refresh_url': `${env.BASE_URL}/promoter-signup.html?refresh=true`,
        'return_url': `${env.BASE_URL}/success.html?account=${account.id}`,
        'type': 'account_onboarding'
      })
    });

    if (!accountLinkResponse.ok) {
      const error = await accountLinkResponse.json();
      throw new Error(error.error?.message || 'Failed to create account link');
    }

    const accountLink = await accountLinkResponse.json();

    return new Response(JSON.stringify({
      success: true,
      account_id: account.id,
      onboarding_url: accountLink.url,
      message: 'Redirect promoter to Stripe onboarding'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Create promoter error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create promoter account',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
