# 🚀 PROMOTER SYSTEM - DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT TESTING

### 1. Database Setup (Supabase)
- [ ] **Add missing columns to promoters table**
  ```sql
  ALTER TABLE promoters 
    ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS session_token text,
    ADD COLUMN IF NOT EXISTS session_expires_at timestamp with time zone;
  ```
- [ ] **Verify test promoter exists**
  - Phone: +19293629534
  - Promo Code: SFTEST001
  - Status: approved
- [ ] **Check promoter_sales table exists**
- [ ] **Enable Row Level Security (RLS) policies**

### 2. Environment Variables (Local .env)
✅ All variables configured in `/Users/jpwesite/Desktop/SF/promoters-new/.env`:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_KEY (in Netlify project settings)
- ✅ TWILIO_ACCOUNT_SID
- ✅ TWILIO_AUTH_TOKEN
- ✅ TWILIO_PHONE_NUMBER
- ✅ TWILIO_VERIFY_SERVICE_SID (VAd6f067a14593f46ba9b6cf80cb50f7a1)
- ✅ STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_CONNECT_CLIENT_ID
- ✅ ANTHROPIC_API_KEY (for AI flyer chat)

### 3. Local Testing Flow

#### Test 1: SMS Login
1. [ ] Go to http://localhost:8888/test-sms-login.html
2. [ ] Enter phone: +19293629534
3. [ ] Click "Send Code"
4. [ ] **EXPECTED**: Receive SMS on your phone
5. [ ] Enter verification code
6. [ ] Click "Verify Code"
7. [ ] **EXPECTED**: See "Login Successful!" and dashboard

#### Test 2: Promoter Signup Page
1. [ ] Go to http://localhost:8888/promoter-signup.html
2. [ ] Fill out form with new details
3. [ ] Submit
4. [ ] **EXPECTED**: Success message + pending approval status
5. [ ] Check Supabase - new promoter with status='pending'

#### Test 3: Team Tickets Page with Promo Code
1. [ ] Go to http://localhost:8888/team-tickets-tables.html?promo=SFTEST001&name=Test+Promoter
2. [ ] **EXPECTED**: See promo code in URL
3. [ ] Select ticket quantity
4. [ ] Click "Buy Tickets"
5. [ ] **EXPECTED**: Stripe Checkout opens
6. [ ] Complete test purchase (use test card: 4242 4242 4242 4242)
7. [ ] **EXPECTED**: Webhook processes, sale recorded in promoter_sales

#### Test 4: AI Flyer Customization
1. [ ] Go to http://localhost:8888/ai-flyer-customization.html
2. [ ] **EXPECTED**: Dark theme matching signup page
3. [ ] **EXPECTED**: Iframe shows team-tickets-tables.html
4. [ ] Try example prompt: "Add my name in large purple text at the top"
5. [ ] **EXPECTED**: AI generates design suggestions

#### Test 5: Dashboard/Account Page
1. [ ] After SMS login, go to http://localhost:8888/account.html
2. [ ] **EXPECTED**: See promoter details
3. [ ] **EXPECTED**: Referral link with promo code
4. [ ] **EXPECTED**: Commission tracking (if sales exist)

---

## 🌐 NETLIFY DEPLOYMENT

### 1. Environment Variables Setup
Go to Netlify Dashboard → Site Settings → Environment Variables and add:

```bash
# Supabase
SUPABASE_URL=https://axhsljfsrfkrpdtbgdpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from Supabase Settings → API)

# Twilio
TWILIO_ACCOUNT_SID=AC0b07f1131359606c90cb23e3d0eaca75
TWILIO_AUTH_TOKEN=<from Twilio Console>
TWILIO_PHONE_NUMBER=+16464664925
TWILIO_VERIFY_SERVICE_SID=VAd6f067a14593f46ba9b6cf80cb50f7a1

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Pricing
STRIPE_PRICE_TICKET=price_...
STRIPE_PRICE_VIP_TICKET=price_...
STRIPE_PRICE_TABLE=price_...
STRIPE_PRICE_DRINK=price_...
STRIPE_PRICE_BOTTLE=price_...
```

### 2. Build Settings
- **Base directory**: `promoters-new`
- **Build command**: (leave empty - static site)
- **Publish directory**: `public`
- **Functions directory**: `netlify/functions`

### 3. Deploy
```bash
cd /Users/jpwesite/Desktop/SF/promoters-new
git add .
git commit -m "Promoter system ready for deployment"
git push origin main
```

Or manual deploy:
```bash
cd /Users/jpwesite/Desktop/SF/promoters-new
netlify deploy --prod
```

### 4. Post-Deployment Verification
1. [ ] Visit production URL (e.g., https://soundfactory-promoters.netlify.app)
2. [ ] Test SMS login with your phone
3. [ ] Test Stripe checkout with test card
4. [ ] Verify webhook endpoint in Stripe Dashboard
5. [ ] Check Supabase logs for any connection errors

---

## 🔧 STRIPE CONFIGURATION

### 1. Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy webhook signing secret → Add to Netlify env vars as `STRIPE_WEBHOOK_SECRET`

### 2. Connect Platform Setup
1. Go to Stripe Dashboard → Connect → Settings
2. Add redirect URI: `https://your-site.netlify.app/promoter-signup.html`
3. Copy Client ID → Already in env vars as `STRIPE_CONNECT_CLIENT_ID`

### 3. Product & Price IDs
Create products in Stripe Dashboard and update env vars:
- GA Ticket: $20 → `STRIPE_PRICE_TICKET`
- VIP Ticket: $40 → `STRIPE_PRICE_VIP_TICKET`
- Table: $500 → `STRIPE_PRICE_TABLE`
- Drink: $15 → `STRIPE_PRICE_DRINK`
- Bottle: $300 → `STRIPE_PRICE_BOTTLE`

---

## 📊 SUPABASE SECURITY

### Row Level Security Policies

```sql
-- Promoters can only read their own data
CREATE POLICY "Promoters can view own data"
ON promoters FOR SELECT
USING (auth.uid() = id OR phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- Only authenticated promoters can update their session
CREATE POLICY "Promoters can update own session"
ON promoters FOR UPDATE
USING (phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- Promoters can view their own sales
CREATE POLICY "Promoters can view own sales"
ON promoter_sales FOR SELECT
USING (promoter_id IN (
  SELECT id FROM promoters 
  WHERE phone = current_setting('request.jwt.claims', true)::json->>'phone'
));

-- Enable RLS
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_sales ENABLE ROW LEVEL SECURITY;
```

---

## 🧪 PRODUCTION TESTING CHECKLIST

### After Deployment:
1. [ ] **SMS Login Test**
   - Use your phone number
   - Verify SMS arrives
   - Complete login flow
   - Session persists on refresh

2. [ ] **New Promoter Signup**
   - Fill form with new email/phone
   - Verify Stripe Connect onboarding
   - Check status='pending' in Supabase
   - Admin approves → status='approved'
   - SMS login works for new promoter

3. [ ] **Ticket Purchase Flow**
   - Use referral link with promo code
   - Complete Stripe checkout
   - Verify webhook processes successfully
   - Check promoter_sales table has new record
   - Verify commission calculated correctly

4. [ ] **AI Flyer Customization**
   - Load page in production
   - Test prompts
   - Verify Anthropic API calls work
   - Check CORS settings

5. [ ] **Dashboard**
   - View promoter stats
   - Copy referral link
   - Share on social media
   - Track clicks/conversions

---

## 🚨 TROUBLESHOOTING

### Common Issues:

**SMS Not Sending:**
- Check TWILIO_VERIFY_SERVICE_SID has no extra quotes/spaces/periods
- Verify Twilio account has credits
- Check phone number format: +1XXXXXXXXXX

**Stripe Checkout Fails:**
- Verify STRIPE_PUBLISHABLE_KEY matches environment (test vs live)
- Check product price IDs exist in Stripe Dashboard
- Ensure webhook endpoint is reachable

**Database Errors:**
- Verify all columns exist (especially last_login_at, session_token, session_expires_at)
- Check RLS policies don't block legitimate requests
- Ensure SUPABASE_SERVICE_KEY is set for admin operations

**AI Chat Not Working:**
- Verify ANTHROPIC_API_KEY is valid
- Check API rate limits not exceeded
- Ensure CORS allows requests from your domain

---

## 📝 FINAL CHECKLIST

Before going live:
- [ ] All environment variables configured in Netlify
- [ ] Database schema complete with all columns
- [ ] RLS policies enabled and tested
- [ ] Stripe webhook endpoint configured
- [ ] Twilio SMS tested with real phone number
- [ ] Test purchase completed successfully
- [ ] Commission tracking verified
- [ ] AI flyer customization working
- [ ] Mobile responsive design tested
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring setup (optional: Sentry)
- [ ] Analytics configured (optional: Google Analytics)

---

## 🎉 GO LIVE!

Once all tests pass:
1. Switch Stripe keys from test to live mode
2. Update environment variables in Netlify
3. Test one final purchase with real card
4. Announce to promoters!
5. Monitor logs for first 24 hours

**Support Contacts:**
- Database: Supabase Dashboard → Logs
- SMS: Twilio Console → Logs → Verify
- Payments: Stripe Dashboard → Events
- Functions: Netlify Dashboard → Functions → Logs

---

## 📱 CURRENT TEST ACCOUNT

**Test Promoter:**
- Phone: +19293629534
- Promo Code: SFTEST001
- Status: approved
- Name: Test Promoter

**Quick Test URL:**
http://localhost:8888/test-sms-login.html

**Production URLs (after deployment):**
- Signup: https://your-site.netlify.app/promoter-signup.html
- Login: https://your-site.netlify.app/test-sms-login.html
- Tickets: https://your-site.netlify.app/team-tickets-tables.html?promo=SFTEST001
- AI Flyer: https://your-site.netlify.app/ai-flyer-customization.html

---

**Status: Ready for Testing & Deployment** ✅
