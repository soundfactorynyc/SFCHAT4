# 🚀 QUICK DEPLOYMENT COMMANDS
## For team.soundfactorynyc.com

---

## 📍 Navigate to Project
```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
```

---

## 🔧 UPDATE NETLIFY ENVIRONMENT VARIABLES

### Option 1: Using Netlify CLI (Fast)
```bash
# Install Netlify CLI if not installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site (if not already linked)
netlify link

# Set environment variables one by one
netlify env:set STRIPE_PUBLISHABLE_KEY "[STRIPE_PUBLISHABLE_KEY]"

netlify env:set STRIPE_SECRET_KEY "[STRIPE_SECRET_KEY]"

netlify env:set STRIPE_WEBHOOK_SECRET "YOUR_WEBHOOK_SECRET_HERE"
```

### Option 2: Using Netlify Dashboard (Manual)
1. Go to https://app.netlify.com
2. Select your site
3. Site Settings → Environment Variables
4. Add/update each variable

---

## 📤 DEPLOY TO NETLIFY

### Production Deploy
```bash
netlify deploy --prod
```

### Test Deploy First (Recommended)
```bash
# Deploy to preview URL first
netlify deploy

# If looks good, deploy to production
netlify deploy --prod
```

---

## 🧪 TEST WEBHOOK LOCALLY (Optional)

### Install Stripe CLI
```bash
# On Mac with Homebrew
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login
```

### Forward Webhooks to Local
```bash
# Start Netlify dev server
netlify dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

## 🔍 CHECK DEPLOYMENT STATUS

### View Site
```bash
netlify open:site
```

### View Netlify Dashboard
```bash
netlify open:admin
```

### View Build Logs
```bash
netlify logs
```

---

## 📊 VERIFY ENVIRONMENT VARIABLES

### List All Environment Variables
```bash
netlify env:list
```

### Get Specific Variable
```bash
netlify env:get STRIPE_PUBLISHABLE_KEY
```

---

## 🐛 DEBUGGING COMMANDS

### Check Function Logs (After Deployment)
```bash
netlify functions:list
netlify functions:invoke stripe-webhook --log
```

### Test Specific Function Locally
```bash
netlify functions:serve
```

---

## ⚡ QUICK FIXES

### If Webhook Not Working:
1. Check Stripe Dashboard for webhook secret:
   ```bash
   open https://dashboard.stripe.com/webhooks
   ```

2. Update webhook secret:
   ```bash
   netlify env:set STRIPE_WEBHOOK_SECRET "whsec_YOUR_SECRET_HERE"
   ```

3. Redeploy:
   ```bash
   netlify deploy --prod
   ```

### If Keys Not Working:
1. Verify keys are correct:
   ```bash
   netlify env:list | grep STRIPE
   ```

2. Update if needed:
   ```bash
   netlify env:set STRIPE_PUBLISHABLE_KEY "[STRIPE_PUBLISHABLE_KEY]..."
   netlify env:set STRIPE_SECRET_KEY "[STRIPE_SECRET_KEY]..."
   ```

3. Redeploy:
   ```bash
   netlify deploy --prod
   ```

---

## 📱 TEST URLS AFTER DEPLOYMENT

```bash
# Homepage
https://team.soundfactorynyc.com/

# Promoter Signup
https://team.soundfactorynyc.com/index.html

# Promoter Login
https://team.soundfactorynyc.com/promoter-login.html

# Promoter Dashboard
https://team.soundfactorynyc.com/promoter-dashboard.html

# Tickets & Tables
https://team.soundfactorynyc.com/team-tickets-tables.html

# Admin Panel
https://team.soundfactorynyc.com/admin-approvals.html

# Test Webhook
https://team.soundfactorynyc.com/.netlify/functions/stripe-webhook
```

---

## 🔐 SECURITY REMINDERS

### Never Commit These Files:
```bash
.env
.env.local
.env.production
```

### Check Git Status
```bash
git status
```

### If .env is tracked, remove it:
```bash
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"
```

---

## 🎯 COMPLETE DEPLOYMENT WORKFLOW

```bash
# 1. Navigate to project
cd /Users/jpwesite/Desktop/promo/promoters-new

# 2. Check current status
netlify status

# 3. Update environment variables (if needed)
netlify env:set STRIPE_PUBLISHABLE_KEY "[STRIPE_PUBLISHABLE_KEY]..."
netlify env:set STRIPE_SECRET_KEY "[STRIPE_SECRET_KEY]..."
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..."

# 4. Test build locally (optional)
netlify dev

# 5. Deploy to production
netlify deploy --prod

# 6. Open site to verify
netlify open:site

# 7. Check logs if issues
netlify logs
```

---

## 📞 GET HELP

### View Netlify CLI Help
```bash
netlify help
netlify deploy --help
netlify env --help
```

### Check Netlify Build Logs
```bash
netlify logs:function stripe-webhook
```

### View Site Info
```bash
netlify status --verbose
```

---

**Quick Reference Created:** October 15, 2025  
**Site:** team.soundfactorynyc.com  
**Status:** Ready for deployment after env var updates
