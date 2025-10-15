# ✅ DEPLOYMENT CHECKLIST
## team.soundfactorynyc.com
**Date:** October 15, 2025

---

## 🎯 CRITICAL FIXES (REQUIRED)

### 1. Fix Stripe Keys
- [x] **DONE** - Fixed in local .env file (Claude did this)
- [ ] **YOU DO** - Update Netlify environment variables
  - Go to: https://app.netlify.com → Site Settings → Environment Variables
  - Update: `STRIPE_PUBLISHABLE_KEY` = `pk_live_51PY93a...`
  - Update: `STRIPE_SECRET_KEY` = `sk_live_51PY93a...`
  - Delete: `STRIPE_PUBLIC_KEY` (duplicate)

### 2. Configure Stripe Webhook
- [ ] **YOU DO** - Go to https://dashboard.stripe.com/webhooks
- [ ] Check if endpoint exists: `https://team.soundfactorynyc.com/.netlify/functions/stripe-webhook`
- [ ] If yes: Get signing secret and verify it matches
- [ ] If no: Create new endpoint with events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
- [ ] Copy signing secret (starts with `whsec_`)
- [ ] Update local .env: `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Update Netlify env vars: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 3. Deploy to Netlify
- [ ] **YOU DO** - Run: `cd /Users/jpwesite/Desktop/promo/promoters-new`
- [ ] **YOU DO** - Run: `netlify deploy --prod`
- [ ] Wait for deployment to complete
- [ ] Note the deploy URL

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: Basic Site
- [ ] Visit: https://team.soundfactorynyc.com
- [ ] Check: Page loads without errors
- [ ] Open console (F12): No red errors
- [ ] **PASS/FAIL:** __________

### Test 2: Promoter Signup
- [ ] Visit: https://team.soundfactorynyc.com/index.html
- [ ] Fill form with test data
- [ ] Complete Stripe Connect signup
- [ ] Note promo code: __________
- [ ] **PASS/FAIL:** __________

### Test 3: SMS Login
- [ ] Visit: https://team.soundfactorynyc.com/promoter-login.html
- [ ] Enter test phone number
- [ ] Receive SMS code
- [ ] Enter code and login
- [ ] Dashboard loads with data
- [ ] **PASS/FAIL:** __________

### Test 4: Test Purchase (MOST IMPORTANT)
- [ ] Visit: https://team.soundfactorynyc.com/team-tickets-tables.html?promo=__________
- [ ] Click "Buy Ticket" ($50)
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] Complete checkout
- [ ] Success page appears
- [ ] **PASS/FAIL:** __________

### Test 5: Verify Webhook
- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Click on your endpoint
- [ ] Check "Recent events" section
- [ ] Find the checkout.session.completed event
- [ ] Status shows: ✅ Succeeded
- [ ] **PASS/FAIL:** __________

### Test 6: Verify Commission
- [ ] Go back to promoter dashboard
- [ ] Check "Tickets Sold": Should show 1
- [ ] Check "Total Earned": Should show $10.00
- [ ] **PASS/FAIL:** __________

### Test 7: Check Database (Optional)
- [ ] Go to Supabase Dashboard
- [ ] Open `promoters` table
- [ ] Find your test promoter
- [ ] Verify `tickets_sold` = 1
- [ ] Verify `commission_earned` = 10.00
- [ ] Open `promoter_sales` table
- [ ] Verify new sale record exists
- [ ] **PASS/FAIL:** __________

---

## ✅ ALL TESTS PASSED?

### If YES:
- 🎉 **System is LIVE and WORKING!**
- You can now onboard real promoters
- Everything will run automatically
- Commissions will credit instantly

### If NO:
- Check which test failed: __________
- Review error messages in:
  - Browser console (F12)
  - Netlify function logs
  - Stripe webhook events
- See troubleshooting section in `DEPLOYMENT_FIXES_REQUIRED.md`

---

## 🚀 LAUNCH READINESS

### Pre-Launch (Do After All Tests Pass)
- [ ] Test 3 more purchases to confirm consistency
- [ ] Test on mobile device
- [ ] Test on different browser
- [ ] Verify admin panel accessible
- [ ] Review all documentation
- [ ] Backup database

### Ready to Launch When:
- [ ] All 7 tests passed ✅
- [ ] Webhook success rate: 100%
- [ ] Multiple purchases tested successfully
- [ ] Mobile experience verified
- [ ] No console errors
- [ ] Commission tracking accurate

---

## 📊 SYSTEM HEALTH CHECKS

### Daily (First Week)
- [ ] Check Stripe Dashboard → Webhooks for errors
- [ ] Review Netlify function logs
- [ ] Monitor promoter signups
- [ ] Verify commission credits
- [ ] Check for support questions

### Weekly (Ongoing)
- [ ] Review total sales and commissions
- [ ] Check for failed webhooks
- [ ] Monitor database performance
- [ ] Review top performing promoters
- [ ] Check for system errors

---

## 🔐 SECURITY CHECKS

- [ ] .env file NOT committed to git
- [ ] .gitignore includes .env
- [ ] Webhook secret is secure
- [ ] API keys are live (not test)
- [ ] Admin password is strong
- [ ] Database RLS enabled

---

## 📞 SUPPORT CONTACTS

### If You Need Help:
1. **Check Documentation First:**
   - DEPLOYMENT_FIXES_REQUIRED.md
   - QUICK_DEPLOY_COMMANDS.md
   - WORKFLOW_AUDIT_SUMMARY.md

2. **Check Logs:**
   - Netlify: Site → Functions → Logs
   - Stripe: Webhooks → Events
   - Browser: F12 Console

3. **Common Issues:**
   - Keys not working → Check Netlify env vars
   - Webhook failing → Verify signing secret
   - Commission not crediting → Check webhook logs

---

## 📝 NOTES & OBSERVATIONS

**Test Date:** __________  
**Tested By:** __________

**Issues Found:**
_____________________________________
_____________________________________
_____________________________________

**Issues Resolved:**
_____________________________________
_____________________________________
_____________________________________

**System Performance:**
- Average page load: ______ seconds
- Function response time: ______ ms
- Webhook success rate: ______%

**Ready for Launch:** YES / NO

**Launch Date:** __________

---

## 🎯 FINAL SIGN-OFF

- [ ] All critical fixes completed
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Support contacts saved
- [ ] Backup created
- [ ] Launch plan ready

**Signed:** __________  
**Date:** __________

---

**CHECKLIST CREATED:** October 15, 2025  
**SYSTEM STATUS:** Awaiting deployment and testing  
**ESTIMATED COMPLETION:** 30-45 minutes
