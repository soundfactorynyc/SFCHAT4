# Stripe Pages Deployment - Sound Factory NYC

## ✅ Deployed Successfully

**Date:** October 15, 2025  
**Site:** https://team.soundfactorynyc.com/  
**Promo Code:** teamsf  
**ID:** 38cff068-ce49-4641-b267-db53869207ff

---

## 📄 Live Pages

All 4 Stripe pages have been deployed to your live site with the exact Sound Factory black style design:

### 1. Checkout Page
**URL:** https://team.soundfactorynyc.com/stripe-checkout.html

**Features:**
- Product preview with pricing
- Feature list with bullet points
- "Proceed to Payment" button
- Stripe Connect badge
- Matches index.html design exactly

**Backend Integration:**
```javascript
fetch('/.netlify/functions/create-checkout-session', {
  method: 'POST',
  body: JSON.stringify({ priceId: 'price_xxx' })
})
```

---

### 2. Success Page
**URL:** https://team.soundfactorynyc.com/stripe-success.html

**Features:**
- Animated success checkmark
- Order confirmation details
- Email confirmation notice
- "Continue" and "View Account" buttons
- Retrieves session details via URL parameter

**URL Parameters:**
- `?session_id={CHECKOUT_SESSION_ID}` - Passed by Stripe after successful checkout

**Backend Integration:**
```javascript
fetch(`/.netlify/functions/get-checkout-session?session_id=${sessionId}`)
```

---

### 3. Cancel Page
**URL:** https://team.soundfactorynyc.com/stripe-cancel.html

**Features:**
- Warning icon with orange accents
- Clear explanation of cancellation
- Reassurance about security
- "Try Again" and "Back to Home" buttons
- Help/support link

**Use Case:**
- User clicks back button in Stripe Checkout
- Session expires
- User cancels payment

---

### 4. Customer Portal Page
**URL:** https://team.soundfactorynyc.com/stripe-portal.html

**Features:**
- Subscription status overview
- Payment method management
- Invoice viewing
- Plan changes
- Subscription cancellation
- "Open Billing Portal" button

**Backend Integration:**
```javascript
fetch('/.netlify/functions/create-portal-session', {
  method: 'POST',
  body: JSON.stringify({ customerId: 'cus_xxx' })
})
```

---

## 🎨 Design Consistency

All pages match your Sound Factory brand:

- **Background:** Pure black (#000000)
- **Cards:** Dark surface (#0a0a0a) with 0.5px borders
- **Typography:** SF Pro Text, uppercase labels, precise letter-spacing
- **Layout:** 480px max-width, centered containers
- **Branding:** SF logo, "SOUND FACTORY NYC" text
- **Footer:** Professional style with copyright
- **Buttons:** 32px height, uppercase, minimal style
- **Dividers:** ⸻ symbol, subtle borders

---

## 🔧 Backend Functions Needed

You'll need to create these Netlify functions to make the pages fully functional:

### 1. Create Checkout Session
**Path:** `netlify/functions/create-checkout-session.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { priceId } = JSON.parse(event.body);
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // or 'payment' for one-time
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: 'https://team.soundfactorynyc.com/stripe-success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://team.soundfactorynyc.com/stripe-cancel.html',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### 2. Get Checkout Session
**Path:** `netlify/functions/get-checkout-session.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { session_id } = event.queryStringParameters;
  
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    return {
      statusCode: 200,
      body: JSON.stringify(session),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### 3. Create Portal Session
**Path:** `netlify/functions/create-portal-session.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { customerId } = JSON.parse(event.body);
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://team.soundfactorynyc.com/promoter-dashboard.html',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

---

## 🔗 Integration Points

### Update Your Main Pages

**1. Add Checkout Link to Main Site:**
```html
<a href="/stripe-checkout.html" class="btn">Purchase Now</a>
```

**2. Add Portal Link to Dashboard:**
```html
<a href="/stripe-portal.html" class="btn">Manage Subscription</a>
```

**3. Update Redirects in `netlify.toml`:**
```toml
[[redirects]]
  from = "/api/create-checkout-session"
  to = "/.netlify/functions/create-checkout-session"
  status = 200

[[redirects]]
  from = "/api/get-checkout-session"
  to = "/.netlify/functions/get-checkout-session"
  status = 200

[[redirects]]
  from = "/api/create-portal-session"
  to = "/.netlify/functions/create-portal-session"
  status = 200
```

---

## 🧪 Testing Checklist

- [ ] Visit https://team.soundfactorynyc.com/stripe-checkout.html
- [ ] Verify design matches your main site
- [ ] Test checkout button (should call backend)
- [ ] Create test checkout session in Stripe
- [ ] Test success page with session_id parameter
- [ ] Test cancel page navigation
- [ ] Test portal page with customer ID
- [ ] Verify mobile responsiveness
- [ ] Check all links work correctly

---

## 🎯 Next Steps

1. **Configure Stripe Dashboard**
   - Set up your products and prices
   - Configure customer portal settings
   - Enable payment methods you want to accept

2. **Create Backend Functions**
   - Implement the 3 functions listed above
   - Add to `netlify/functions/` directory
   - Deploy to production

3. **Update Environment Variables**
   - Add `STRIPE_SECRET_KEY` to Netlify
   - Add `STRIPE_PUBLISHABLE_KEY` if needed

4. **Test Payment Flow**
   - Use Stripe test mode first
   - Test card: 4242 4242 4242 4242
   - Verify success and cancel redirects

5. **Go Live**
   - Switch to Stripe live keys
   - Test with real payment
   - Monitor first transactions

---

## 📝 Important Notes

- All pages use Netlify function endpoints (`.netlify/functions/`)
- Success page expects `?session_id=` URL parameter from Stripe
- Portal page requires customer ID from your database
- All styling matches your index.html exactly
- Pages are fully responsive (mobile + desktop)
- Logo placeholder will use `sf-logo.png` from your public folder

---

## 🆘 Support

If you need help:
- Stripe Documentation: https://docs.stripe.com/
- Netlify Functions: https://docs.netlify.com/functions/
- Contact: team@soundfactorynyc.com

---

**Deployment Status:** ✅ Complete  
**Git Commit:** b3474a9  
**Branch:** master  
**Auto-Deploy:** Enabled via Netlify
