# 🚀 DEPLOYMENT CHECKLIST - SMS Finder & Promoter System

## Pre-Deployment

### 1. Database Setup ✅
- [x] Supabase project created
- [x] Schema applied (`supabase-promoter-schema.sql`)
- [ ] Test promoter added (`add-test-promoter.sql`)
- [ ] Verify test promoter exists:
  ```sql
  SELECT * FROM promoters WHERE promo_code = 'SFTEST001';
  ```

### 2. Environment Variables ✅
Check these are set in Netlify (Settings → Environment Variables):

**Required:**
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`  
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_VERIFY_SERVICE_SID`
- [ ] `TWILIO_PHONE_NUMBER`

**Optional:**
- [ ] `PUBLIC_BASE_URL` (your site URL)
- [ ] `COMMISSION_CENTS` (default: 1000 = $10)

### 3. Dependencies Installed ✅
```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
cd netlify/functions
npm install
cd ../..
```

## Deployment Steps

### Step 1: Local Testing

```bash
# Start local dev server
cd /Users/jpwesite/Desktop/promo/promoters-new
netlify dev
```

**Test These Features:**
- [ ] Promoter login page loads (http://localhost:8888/promoter-login.html)
- [ ] SMS code sends successfully
- [ ] SMS code verification works
- [ ] Dashboard loads with promoter data
- [ ] SMS Finder tool opens (http://localhost:8888/sms-finder-popup.html)
- [ ] Stripe search returns results

### Step 2: Deploy to Netlify

```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
./deploy.sh
```

Or manually:
```bash
netlify deploy --prod
```

### Step 3: Post-Deployment Testing

Test on production URL:
- [ ] Visit: https://YOUR-SITE.netlify.app/promoter-login.html
- [ ] Complete SMS login flow
- [ ] Verify dashboard displays correctly
- [ ] Test SMS Finder tool
- [ ] Check Netlify function logs for errors

## Files Deployed

### HTML Pages (public/)
- ✅ `index.html` - Main landing/signup
- ✅ `promoter-login.html` - SMS login
- ✅ `promoter-dashboard.html` - Promoter dashboard
- ✅ `sms-finder-popup.html` - SMS/Stripe search tool
- ✅ `team-tickets-tables.html` - Ticket purchase page
- ✅ `success.html` - Purchase success
- ✅ `admin-approvals.html` - Admin panel
- ✅ `admin-flyer-approvals.html` - Flyer approvals

### Netlify Functions
- ✅ `send-sms-code.js` - Sends Twilio SMS verification
- ✅ `verify-sms-code.js` - Verifies SMS code & creates session
- ✅ `get-promoter.js` - Gets promoter data from Supabase  
- ✅ `stripe-finder.js` - Searches Stripe data (NEW!)
- ✅ `create-promoter.js` - Creates new promoter
- ✅ `purchase-ticket.js` - Handles ticket purchases
- ✅ `stripe-webhook.js` - Stripe webhook handler
- ✅ `validate-session.js` - Session validation
- ✅ `ai-flyer-chat.js` - AI flyer customization

### Static Assets
- ✅ `sf-logo.png`
- ✅ `sf-flyer.png`
- ✅ `sf-flyer-optimized.png`

## Verification Commands

### Check Function Logs
```bash
netlify functions:log get-promoter
netlify functions:log verify-sms-code
netlify functions:log stripe-finder
```

### Test API Endpoints
```bash
# Test get-promoter
curl https://YOUR-SITE.netlify.app/.netlify/functions/get-promoter/SFTEST001

# Test stripe-finder (requires POST)
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/stripe-finder \
  -H "Content-Type: application/json" \
  -d '{"searchTerm":"test","filter":"all"}'
```

### Check Database
```sql
-- Count promoters
SELECT COUNT(*) FROM promoters;

-- Check test promoter
SELECT * FROM promoters WHERE promo_code = 'SFTEST001';

-- Check approved promoters
SELECT promo_code, name, email, status FROM promoters WHERE status = 'approved';
```

## Troubleshooting

### "Promoter not found" Error
1. Check database has test promoter
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY
3. Check Netlify function logs
4. Ensure promoter status = 'approved'

### SMS Not Sending
1. Verify TWILIO credentials
2. Check phone format (+1XXXXXXXXXX)
3. Check Twilio console for errors
4. Verify TWILIO_VERIFY_SERVICE_SID

### Stripe Search Not Working
1. Verify STRIPE_SECRET_KEY is correct
2. Check for data in Stripe dashboard
3. Try different search terms
4. Check function logs for errors

### Dashboard Not Loading
1. Clear browser cache and cookies
2. Check browser console for errors
3. Verify session token in localStorage
4. Test API endpoint directly

## Security Checklist

- [ ] All sensitive keys in Netlify env vars (not in code)
- [ ] .env file in .gitignore
- [ ] CORS configured correctly
- [ ] Session tokens expire after 24 hours
- [ ] Only approved promoters can login
- [ ] RLS policies enabled on Supabase

## Performance Checklist

- [ ] Images optimized (sf-flyer-optimized.png)
- [ ] Functions return quickly (< 1s)
- [ ] Database queries indexed
- [ ] Stripe API calls cached where possible

## Monitoring

### What to Watch
1. **Netlify Dashboard**: Function invocations and errors
2. **Supabase Dashboard**: Database queries and auth
3. **Twilio Console**: SMS delivery status
4. **Stripe Dashboard**: Payments and search usage

### Key Metrics
- SMS delivery rate
- Login success rate
- Dashboard load time
- Search response time
- Payment conversion rate

## Success Criteria

✅ **Login Flow Works**
- User receives SMS code
- Code verification succeeds
- Dashboard loads with data

✅ **SMS Finder Works**
- Search returns Stripe data
- All filters work (customers, payments, subscriptions, invoices)
- Results display correctly

✅ **Payments Work**
- Tickets can be purchased
- Promoter commissions tracked
- Webhooks process successfully

## Post-Deployment

### Immediate Actions
1. Test with real phone number
2. Create production promoters
3. Monitor first few logins
4. Watch Netlify function logs

### Within 24 Hours
1. Verify SMS costs in Twilio
2. Check Stripe search API usage
3. Monitor database performance
4. Review error logs

### Within 1 Week
1. Add more promoters
2. Analyze conversion rates
3. Optimize slow queries
4. Improve error handling

---

**Ready to Deploy?** Run: `cd /Users/jpwesite/Desktop/promo/promoters-new && ./deploy.sh`

**Need Help?** Check `/FIXED_LOGIN_ISSUE.md` for troubleshooting.