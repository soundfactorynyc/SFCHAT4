# 🚀 Production Deployment Guide
## Sound Factory Promoter System - team.soundfactorynyc.com

### ✅ Production Ready Checklist

#### **1. Core Features Complete**
- ✅ Promoter Dashboard with AI Promotional Kit
- ✅ Admin Dashboard with Master Promoters List
- ✅ Team Tracking (Tables & Tickets)
- ✅ Sales Map with Geographic Pins
- ✅ Real-time Commission Tracking
- ✅ Stripe Integration (Webhooks + Payments)
// SMS verification is handled by Stripe during login (no Twilio required)
- ✅ Supabase Database Integration

#### **2. Pages Deployed**
- ✅ `/` - Homepage (index.html) - Team signup
- ✅ `/promoter-signup.html` - Team member registration
- ✅ `/promoter-login.html` - Team member login
- ✅ `/promoter-dashboard.html` - Team member dashboard with AI kit & map
- ✅ `/admin-dashboard.html` - Admin view with master promoters list
- ✅ `/team-tickets-tables.html` - Sales tracking page
- ✅ `/success.html` - Success confirmation

#### **3. AI Promotional Kit Features**
- ✅ Read-only fields (Promo Code, Event, Date, Base Link) for tracking integrity
- ✅ Editable fields (Platforms, Tone, CTA, Hashtags, Notes) for customization
- ✅ Platform selection (Instagram, TikTok, Facebook, X, WhatsApp)
- ✅ Automated caption generation (5 variations)
- ✅ Hashtag packs (Core & Alt)
- ✅ UTM link builder
- ✅ Asset kit placeholder
- ✅ Copy buttons for all outputs

#### **4. Sales Map**
- ✅ Geographic visualization with pins
- ✅ Interactive tooltips on hover
- ✅ Click-through for detailed breakdowns
- ✅ Legend with sale volume indicators
- ✅ Real-time updates

#### **5. Master Promoters Directory (Admin)**
- ✅ Complete promoter list with all details
- ✅ Multi-field search (Name, Promo Code, Status)
- ✅ Status filtering (All, Approved, Pending, Suspended)
- ✅ Detailed metrics (ID, Email, Phone, Commission, Sales, Join Date)
- ✅ Edit/View actions for each promoter
- ✅ Export all promoters to CSV
- ✅ Add new promoter button

---

## 🌐 Deploy to Netlify

### **Quick Deploy (Recommended)**

1. **Push to GitHub:**
   ```bash
   cd /Users/jpwesite/Desktop/promo/promoters-new
   git add .
   git commit -m "Production ready: AI Kit + Sales Map + Master Promoters List"
   git push origin master
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" → Select `sf-promoters-system` repository
   - Build settings:
     - **Branch:** master
     - **Publish directory:** public
     - **Build command:** (leave empty)

3. **Configure Custom Domain:**
   - In Netlify site settings → Domain management
   - Click "Add custom domain"
   - Enter: `team.soundfactorynyc.com`
   - Follow DNS instructions (add CNAME record)

4. **Set Environment Variables:**
   Go to Site settings → Environment variables, add:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (~30 seconds)
   - Site will be live at `team.soundfactorynyc.com`

---

## 🔧 DNS Configuration

### **Add CNAME Record to soundfactorynyc.com:**

| Type  | Name | Value                          | TTL  |
|-------|------|--------------------------------|------|
| CNAME | team | your-site-name.netlify.app     | 3600 |

**Example:**
```
CNAME  team  sf-promoters.netlify.app  3600
```

---

## 📋 Environment Variables Reference

### **Supabase** (Database)
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Stripe** (Payments)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx (production) or sk_test_xxxxx (test)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### **Login**
Handled by Stripe Express/OAuth with built‑in SMS verification. No Twilio configuration required.

---

## 🧪 Testing Checklist

### **Before Go-Live:**

1. **Test AI Kit:**
   - ✅ Fill all fields
   - ✅ Click "Build Links" → Verify promo link generated
   - ✅ Click "Generate Captions" → Verify 5 captions appear
   - ✅ Test all copy buttons
   - ✅ Verify read-only fields cannot be edited

2. **Test Sales Map:**
   - ✅ Hover over pins → Tooltips appear
   - ✅ Click pins → Details shown
   - ✅ Verify legend displays correctly

3. **Test Master Promoters List:**
   - ✅ Search by name
   - ✅ Search by promo code
   - ✅ Filter by status
   - ✅ Click Edit/View buttons
   - ✅ Export CSV

4. **Test Workflows:**
   - ✅ Promoter signup flow
   - ✅ Stripe login redirect + return
   - ✅ Dashboard login
   - ✅ Promo link tracking
   - ✅ Commission calculation

5. **Test Integrations:**
   - ✅ Stripe webhook receiving events
   - ✅ Database updates on sales
   - ✅ Stripe login completes and returns to site
   - ✅ Real-time dashboard updates

---

## 🔒 Security Checklist

- ✅ Environment variables in Netlify (not in code)
- ✅ Stripe webhook signature verification
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting on API endpoints
- ✅ CORS configured properly
- ✅ HTTPS enforced (Netlify auto-provisions SSL)

---

## 📊 Monitoring & Analytics

### **Set up:**
1. **Netlify Analytics** - Track page views, bandwidth
2. **Stripe Dashboard** - Monitor payments, failed charges
3. **Supabase Logs** - Database query performance
4. **Sentry** (optional) - Error tracking

---

## 🚨 Troubleshooting

### **Common Issues:**

1. **Netlify Functions not working:**
   - Check function logs in Netlify dashboard
   - Verify environment variables are set
   - Check function timeout (default 10s, max 26s)

2. **Stripe webhooks failing:**
   - Update webhook endpoint in Stripe: `https://team.soundfactorynyc.com/.netlify/functions/stripe-webhook`
   - Verify webhook secret matches
   - Check webhook signature verification

3. **Database connection errors:**
   - Verify Supabase URL and key
   - Check RLS (Row Level Security) policies
   - Ensure tables exist

4. **Login not returning from Stripe:**
   - Verify redirect URLs in Stripe Connect settings
   - Check Netlify function logs for stripe-express-login
   - Ensure site is served over HTTPS in production

---

## 📞 Support Contacts

- **Netlify Support:** support@netlify.com
- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** https://supabase.com/support
 

---

## 🎉 Post-Deployment

### **Once Live:**

1. **Test with real promo code:**
   ```
   https://team.soundfactorynyc.com?promo=TEST_CODE
   ```

2. **Share with team:**
   - Promoter dashboard: `https://team.soundfactorynyc.com/promoter-dashboard.html?code=PROMO_CODE`
   - Admin dashboard: `https://team.soundfactorynyc.com/admin-dashboard.html`

3. **Monitor first 24 hours:**
   - Check Netlify analytics
   - Review function logs
   - Watch for errors

4. **Celebrate! 🎊**

---

## 📝 Notes

- All tracking parameters (?promo=CODE) are automatically preserved
- AI Kit fields are locked for tracking integrity
- Sales map updates in real-time as new sales come in
- Master promoters list refreshes every 30 seconds
- CSV exports include all historical data

---

**System Status:** ✅ **PRODUCTION READY**  
**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Domain:** team.soundfactorynyc.com
