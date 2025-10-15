// netlify/functions/get-promoter.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function json(body, statusCode=200){
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json({ error: 'Method Not Allowed' }, 405);

  try {
    const parts = event.path.split('/');
    const promoCode = decodeURIComponent(parts[parts.length - 1]);

    // Find the connected account that has this promoCode in metadata
    let accountId = null, name = 'Promoter', email = '';
    let starting_after = undefined;
    while (true) {
      const listParams = { limit: 100 };
      if (starting_after) {
        listParams.starting_after = starting_after;
      }
      const list = await stripe.accounts.list(listParams);
      for (const acct of list.data) {
        if (acct.metadata && acct.metadata.promoCode === promoCode) {
          accountId = acct.id; name = acct.metadata.name || 'Promoter'; email = acct.metadata.email || ''; break;
        }
      }
      if (accountId || !list.has_more) break;
      starting_after = list.data[list.data.length - 1].id;
    }
    if (!accountId) return json({ error: 'Promoter not found' }, 404);

    // Count successful payment intents with this promo code
    const search = await stripe.paymentIntents.search({
      query: `metadata['promoCode']:'${promoCode}' AND status:'succeeded'`,
      limit: 100
    });

    const ticketsSold = search.data.length;
    const commissionCents = Number(process.env.COMMISSION_CENTS || 1000) * ticketsSold;

    const base = process.env.PUBLIC_BASE_URL || `https://${event.headers.host}`;
    return json({
      name, email,
      ticketsSold,
      commissionEarned: (commissionCents / 100).toFixed(2),
      referralLink: `${base}/team-tickets-tables.html?promo=${promoCode}`
    });
  } catch (err) {
    console.error(err);
    return json({ error: err.message }, 500);
  }
};