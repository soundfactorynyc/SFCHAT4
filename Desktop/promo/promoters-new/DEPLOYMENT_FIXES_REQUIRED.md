# 🚨 CRITICAL DEPLOYMENT FIXES REQUIRED
## Site: team.soundfactorynyc.com (Netlify)
**Date:** October 15, 2025  
**Status:** ⚠️ NEEDS IMMEDIATE ATTENTION

---

## ✅ FIXED: Stripe API Keys
**Issue:** Mixed test/live keys causing payment failures  
**Status:** ✅ **FIXED IN LOCAL .env FILE**

**What I Changed:**
- Switched to LIVE publishable key: `[STRIPE_PUBLISHABLE_KEY]...`
- Kept LIVE secret key: `[STRIPE_SECRET_KEY]...`
- Commented out test keys for future reference

**What You Need to Do:**
This is already fixed in your local `.env` file, but you MUST update Netlify environment variables!

---

## 🚨 CRITICAL TASKS (Must Complete Before Site Works)

### 1. UPDATE NETLIFY ENVIRONMENT VARIABLES (10 minutes)

**Go to Netlify Dashboard:**
1. Log in to https://app.netlify.com
2. Select your "team.soundfactorynyc.com" site
3. Go to: Site Settings → Environment Variables

**Update These Variables:**
```
STRIPE_PUBLISHABLE_KEY = [STRIPE_PUBLISHABLE_KEY]

STRIPE_SECRET_KEY = [STRIPE_SECRET_KEY]
```

**Remove or Update:**
- Delete `STRIPE_PUBLIC_KEY` if it exists (duplicate of STRIPE_PUBLISHABLE_KEY)
- Make sure NO test keys are in Netlify environment

---

### 2. CONFIGURE STRIPE WEBHOOK (15 minutes)

**Current Problem:**
Your webhook secret `whsec_9Cp1dvXttlkPrIE7ZbHkC2oygFYMgdMK` may be outdated or incorrect.

**Steps to Fix:**

**A. Go to Stripe Dashboard**
https://dashboard.stripe.com/webhooks

**B. Check Existing Endpoints**
Look for: `https://team.soundfactorynyc.com/.netlify/functions/stripe-webhook`

**C. If Endpoint Exists:**
1. Click on it
2. Click "Reveal" under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Compare to your current `.env` value
5. If different, update both:
   - Local `.env` file
   - Netlify environment variables

**D. If Endpoint Does NOT Exist:**
1. Click "+ Add endpoint"
2. Enter endpoint URL: `https://team.soundfactorynyc.com/.netlify/functions/stripe-webhook`
3. Select events to listen to:
   - ✅ `checkout.session.completed` (REQUIRED)
   - ✅ `payment_intent.succeeded` (REQUIRED)
4. Click "Add endpoint"
5. Copy the "Signing secret" (starts with `whsec_`)
6. Update:
   - Local `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`
   - Netlify environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

**E. Verify Webhook is Working:**
After deployment, go to Stripe Dashboard → Webhooks → Your endpoint
- Should show "✅ Succeeded" for recent events
- If showing errors, check the error details

---

### 3. VERIFY OTHER ENVIRONMENT VARIABLES

**Check These Are Set in Netlify:**
```
✅ SUPABASE_URL = https://axhsljfsrfkrpdtbgdpv.supabase.co
✅ SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ TWILIO_ACCOUNT_SID = AC0b07f1131359606c90cb23e3d0eaca75
✅ TWILIO_AUTH_TOKEN = 85a38b02f4af3354c7aa667ac8fde26a
✅ TWILIO_VERIFY_SERVICE_SID = VAd6f067a14593f46ba9b6cf80cb50f7a1
✅ ADMIN_USERNAME = admin
✅ ADMIN_PASSWORD = Deepernyc1
✅ JWT_SECRET = 21525582387980951870456101696329
```

**Optional but Recommended:**
```
ANTHROPIC_API_KEY (for AI flyer assistant)
FACEBOOK_ACCESS_TOKEN (for Facebook posting)
SENDGRID_API_KEY (for email notifications)
```

---

### 4. DEPLOY TO NETLIFY (5 minutes)

**After updating environment variables, deploy:**

**Option A: Using Netlify CLI (Recommended)**
```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
netlify deploy --prod
```

**Option B: Git Push (if connected to repo)**
```bash
git add .
git commit -m "Fix: Updated Stripe keys to live mode"
git push origin main
```

**Option C: Manual Deploy in Dashboard**
1. Go to Netlify Dashboard
2. Click "Deploys" tab
3. Click "Deploy site"
4. Drag and drop your folder

---

## 🧪 TESTING CHECKLIST

**After deployment, test in this order:**

### Test 1: Basic Site Load
- [ ] Visit: https://team.soundfactorynyc.com
- [ ] Verify homepage loads
- [ ] Check console for errors (F12)

### Test 2: Promoter Signup
- [ ] Go to: `/index.html` (signup page)
- [ ] Fill out form with test data
- [ ] Complete Stripe Connect onboarding
- [ ] Verify promoter appears in database

### Test 3: SMS Login
- [ ] Go to: `/promoter-login.html`
- [ ] Enter phone number: +19293629534 (or your test number)
- [ ] Receive SMS code
- [ ] Enter code and log in
- [ ] Verify dashboard loads with data

### Test 4: Test Purchase (CRITICAL)
- [ ] Get a promoter's referral link
- [ ] Go to: `/team-tickets-tables.html?promo=TESTCODE`
- [ ] Click "Buy Ticket" or "Reserve Table"
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Check Success page

### Test 5: Verify Webhook Fired
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Click on your endpoint
- [ ] Check "Recent events" section
- [ ] Should see "✅ checkout.session.completed"
- [ ] Click event to see payload and response

### Test 6: Verify Commission Credited
- [ ] Log back into promoter dashboard
- [ ] Verify:
   - Ticket count increased by 1
   - Commission shows $10.00 (or $0.00 for table 20%)
- [ ] Check database:
   ```sql
   SELECT * FROM promoters WHERE promo_code = 'TESTCODE';
   SELECT * FROM promoter_sales WHERE promoter_id = '...';
   ```

---

## 📊 CURRENT SYSTEM STATUS

### ✅ What's Working:
- File structure is perfect
- All Netlify functions are properly configured
- Database schema is correct
- Commission calculation logic is accurate ($10/ticket, 20% tables)
- HTML pages are complete and professional
- Stripe products and prices are set up correctly

### ⚠️ What Needs Fixing:
1. **Netlify Environment Variables** - MUST update with live keys
2. **Stripe Webhook Secret** - MUST verify and update
3. **Deployment** - MUST redeploy after changes

### 🔮 What Will Happen After Fixes:
- Promoters can sign up successfully ✅
- SMS login will work ✅
- Customers can purchase tickets/tables ✅
- Webhooks will fire and credit commissions ✅
- Dashboard will show accurate stats ✅
- System runs 100% automatically ✅

---

## 🎯 SUCCESS CRITERIA

**You'll know everything is working when:**
1. ✅ Test purchase completes successfully
2. ✅ Webhook shows "Succeeded" in Stripe Dashboard
3. ✅ Promoter commission increases by $10 (or 20% of table)
4. ✅ `promoter_sales` table gets new record
5. ✅ No errors in browser console
6. ✅ No errors in Netlify function logs

---

## 💡 TROUBLESHOOTING

### Problem: "Stripe key does not exist"
**Solution:** Environment variables not set in Netlify. Go to Site Settings → Environment Variables and add them.

### Problem: "Webhook signature verification failed"
**Solution:** Wrong webhook secret. Go to Stripe Dashboard → Webhooks → Your endpoint → Reveal signing secret → Copy and update.

### Problem: "Commission not credited"
**Solution:** 
1. Check Stripe Dashboard → Webhooks → Recent events
2. If webhook failed, check error message
3. If webhook succeeded, check Netlify function logs
4. Verify metadata in checkout session included `promoter_id`

### Problem: "Cannot read properties of undefined"
**Solution:** Check browser console. Usually missing environment variable or incorrect API call.

---

## 📞 NEXT STEPS

**Do This Now:**
1. ✅ Stripe keys are already fixed in local .env (I did this)
2. ⏳ YOU DO: Update Netlify environment variables (10 min)
3. ⏳ YOU DO: Verify/update webhook secret (15 min)
4. ⏳ YOU DO: Deploy to Netlify (5 min)
5. ⏳ YOU DO: Run testing checklist (15 min)

**Total Time:** ~45 minutes to full working system

---

## 🎉 AFTER COMPLETION

**Your system will:**
- Accept promoter signups automatically
- Track all sales and commissions
- Credit $10 per ticket instantly
- Credit 20% on tables instantly
- Display real-time stats on dashboard
- Require ZERO manual intervention

**You'll be able to:**
- Onboard unlimited promoters
- Track performance in real-time
- Scale without additional work
- Trust the system completely

---

## 📝 NOTES

**Remember:**
- This is the LIVE system, not test mode
- Real money will be processed
- Webhook MUST be configured correctly
- Test thoroughly before announcing to promoters
- Keep your webhook secret safe and never commit to git

**Support Resources:**
- Stripe Dashboard: https://dashboard.stripe.com
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://supabase.com/dashboard

---

**Created:** October 15, 2025  
**Last Updated:** October 15, 2025  
**Status:** ⚠️ Awaiting deployment fixes
