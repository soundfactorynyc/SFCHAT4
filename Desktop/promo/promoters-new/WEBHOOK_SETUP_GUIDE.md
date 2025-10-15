# ⚡ WEBHOOK SETUP GUIDE - DO THIS NOW
## Critical: 5-Minute Setup Required Before Launch

---

## 🎯 What This Does

**Webhooks = How promoters get paid**

When someone buys a ticket or table:
1. Customer pays → Stripe processes payment
2. Stripe sends notification → Your webhook receives it
3. Webhook calculates commission → Updates database
4. Promoter sees earnings → Gets paid instantly

**Without webhook secret = No tracking = No payments to promoters** ❌

---

## 📋 Step-by-Step Setup (5 Minutes)

### Step 1: Access Stripe Webhooks (1 min)

1. Go to: https://dashboard.stripe.com/webhooks
2. Log in to your Stripe account
3. Click **"Add endpoint"** button (top right)

---

### Step 2: Configure the Endpoint (2 min)

**Endpoint URL:**
```
https://YOUR-SITE-NAME.netlify.app/.netlify/functions/stripe-webhook
```

**Replace `YOUR-SITE-NAME` with your actual Netlify site name**

Example:
- If your site is: `soundfactory-promoters.netlify.app`
- Then use: `https://soundfactory-promoters.netlify.app/.netlify/functions/stripe-webhook`

**Select Events to Listen To:**
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`

**Click:** "Add endpoint"

---

### Step 3: Get the Signing Secret (1 min)

After creating the endpoint:

1. You'll see a section: **"Signing secret"**
2. Click **"Reveal"** to show the secret
3. It looks like: `whsec_abc123xyz...`
4. Copy this entire value

---

### Step 4: Add Secret to Environment (1 min)

#### A. Update Local `.env` File

Open: `/Users/jpwesite/Desktop/promo/promoters-new/.env`

Add this line (paste your actual secret):
```
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

#### B. Update Netlify Environment Variables

1. Go to: https://app.netlify.com
2. Select your site
3. Go to: **Site settings → Environment variables**
4. Click **"Add a variable"**
5. Key: `STRIPE_WEBHOOK_SECRET`
6. Value: `whsec_your_secret_here` (paste your secret)
7. Click **"Create variable"**

---

## ✅ How to Test It Works

### Quick Test (2 minutes)

1. **Make a Test Purchase:**
   - Use test card: `4242 4242 4242 4242`
   - Any expiry date in future (e.g., 12/25)
   - Any 3-digit CVC (e.g., 123)
   - Any ZIP code (e.g., 10001)

2. **Check Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint
   - Look at "Recent deliveries"
   - Should show: ✅ "Succeeded" (green checkmark)

3. **Check Database:**
   - Go to Supabase dashboard
   - Open `promoter_sales` table
   - Should see new row with the sale

4. **Check Promoter Dashboard:**
   - Log in as the promoter
   - Should see commission credited

### If Test Fails

**"401 Unauthorized" or "400 Bad Request":**
- ❌ Secret is wrong or missing
- Check you copied the FULL secret (starts with `whsec_`)
- Verify it's in both `.env` AND Netlify

**"404 Not Found":**
- ❌ Wrong endpoint URL
- Double-check your Netlify site name
- Make sure it ends with: `/.netlify/functions/stripe-webhook`

**No Response:**
- ❌ Site not deployed
- Deploy your site to Netlify first
- Then set up webhook

---

## 🚨 IMPORTANT NOTES

### Live Mode vs Test Mode

**You have TWO webhook secrets:**
- Test mode secret (for testing)
- Live mode secret (for production)

**Make sure you're using LIVE mode secret** since your `.env` has live API keys.

To confirm:
- Live secrets start with: `whsec_`
- In Stripe Dashboard, toggle should say: "Viewing live mode"

---

### Security Best Practices

**✅ DO:**
- Keep webhook secret private
- Add it to `.gitignore` (already done in your project)
- Use environment variables (already doing)
- Regenerate if exposed

**❌ DON'T:**
- Commit secret to git
- Share secret publicly
- Use same secret for test and live
- Hardcode in source files

---

## 🔄 Redeploy After Setup

After adding the webhook secret:

```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
netlify deploy --prod
```

Or via Netlify web interface:
1. Push changes to git
2. Netlify auto-deploys
3. Environment variable takes effect immediately

---

## 📊 Monitoring Webhooks

### Daily Monitoring (First Week)

Go to: https://dashboard.stripe.com/webhooks

**Check:**
- Success rate (should be 100% or close)
- Recent deliveries (all green checkmarks)
- Any errors or failures

**If you see errors:**
1. Click on the failed event
2. Read error message
3. Check function logs in Netlify
4. Common issues:
   - Wrong secret
   - Code error in webhook function
   - Database connection issue

---

## 🎯 What Happens After Setup

### Automatic Commission Flow

```
Customer Purchase
       ↓
Stripe processes payment
       ↓
Stripe sends webhook notification
       ↓
Your function verifies signature (using secret)
       ↓
Calculate commission:
  - Tickets: $10 each
  - Tables: 20% of price
       ↓
Update database:
  - promoters.commission_earned += commission
  - promoters.tickets_sold += 1 (if ticket)
  - promoter_sales.insert(new record)
       ↓
Promoter sees update instantly
       ↓
Money already in their Stripe account
```

**All automatic. No manual work required.**

---

## 🆘 Troubleshooting

### Problem: Webhook Shows "Failed"

**Check:**
1. Function logs in Netlify
2. Stripe event details for error message
3. Database connection working
4. Environment variables set correctly

### Problem: Commission Not Updating

**Check:**
1. Webhook receiving events (Stripe dashboard)
2. `promo_code` and `promoter_id` in purchase metadata
3. Promoter exists in database
4. `commission_earned` field updating

### Problem: "Webhook signature verification failed"

**Fix:**
- Wrong secret in environment variables
- Regenerate secret in Stripe
- Update in `.env` and Netlify
- Redeploy site

---

## ✅ Success Checklist

After setup, you should see:

- [ ] Webhook endpoint created in Stripe
- [ ] Secret copied to `.env` file
- [ ] Secret added to Netlify environment variables
- [ ] Site redeployed
- [ ] Test purchase completed successfully
- [ ] Webhook shows "Succeeded" in Stripe
- [ ] Commission appears in database
- [ ] Promoter dashboard shows earnings

**When all checked: You're 100% production ready!** 🎉

---

## 📞 Need Help?

**Stripe Support:**
- https://support.stripe.com

**Netlify Support:**
- https://answers.netlify.com

**Check Function Logs:**
- Netlify Dashboard → Functions → stripe-webhook → Logs

---

**Setup Time:** 5 minutes  
**Importance:** CRITICAL - Nothing works without this  
**Difficulty:** Easy - Just copy/paste

**Do this now, then you're ready to launch!** 🚀
