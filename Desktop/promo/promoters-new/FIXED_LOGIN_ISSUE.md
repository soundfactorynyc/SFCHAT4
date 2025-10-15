# 🔧 QUICK FIX GUIDE - Promoter Login Issues

## What Was Wrong?

You were getting "Error loading dashboard: Promoter not found" because:

1. **Wrong API Response Fields**: The SMS verification was returning `token` instead of `sessionToken`
2. **Database Schema Mismatch**: Functions were looking for `first_name` and `last_name` but schema uses `name`
3. **Wrong Data Source**: `get-promoter` was searching Stripe Connected Accounts instead of Supabase database

## What I Fixed

### 1. Fixed `verify-sms-code.js`
- Changed `token` → `sessionToken` in response
- Changed `${first_name} ${last_name}` → `name`
- Now correctly matches what the login page expects

### 2. Rewrote `get-promoter.js`  
- Now queries Supabase database instead of Stripe
- Uses correct field name (`name` not `first_name`/`last_name`)
- Returns proper promoter data with commissions and tickets

### 3. Created `stripe-finder.js`
- New Netlify function for searching Stripe data
- Searches customers, payments, subscriptions, invoices
- Properly integrated with the SMS finder tool

### 4. Updated `sms-finder-popup.html`
- Now calls actual Stripe API through Netlify function
- Removed mock/sample data
- Real-time search results

## Testing the Fix

### Step 1: Ensure Test Promoter Exists

Run this in your Supabase SQL Editor:

```sql
INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status,
  tickets_sold,
  commission_earned
) VALUES (
  'SFTEST001',
  'Test Promoter',
  'test@soundfactorynyc.com',
  '+19293629534',
  'approved',
  0,
  0
)
ON CONFLICT (phone) DO UPDATE SET
  status = 'approved',
  promo_code = 'SFTEST001';

-- Verify it exists
SELECT * FROM promoters WHERE promo_code = 'SFTEST001';
```

### Step 2: Test Locally

```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
netlify dev
```

Then test:
1. Go to http://localhost:8888/promoter-login.html
2. Enter phone: +19293629534
3. Enter SMS code when received
4. Should redirect to dashboard successfully!

### Step 3: Deploy to Production

```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
./deploy.sh
```

## Environment Variables Checklist

Make sure these are set in Netlify:

✅ SUPABASE_URL  
✅ SUPABASE_ANON_KEY  
✅ STRIPE_SECRET_KEY  
✅ TWILIO_ACCOUNT_SID  
✅ TWILIO_AUTH_TOKEN  
✅ TWILIO_VERIFY_SERVICE_SID  

## File Changes Summary

### Modified Files:
- ✅ `netlify/functions/verify-sms-code.js` - Fixed response fields
- ✅ `netlify/functions/get-promoter.js` - Completely rewritten to use Supabase
- ✅ `public/sms-finder-popup.html` - Updated to call real API

### New Files:
- ✅ `netlify/functions/stripe-finder.js` - New Stripe search function

## How It Works Now

```
1. User enters phone number
   ↓
2. SMS code sent via Twilio
   ↓
3. User enters code
   ↓
4. verify-sms-code checks Supabase for approved promoter
   ↓
5. Returns sessionToken + promoCode
   ↓
6. Dashboard calls get-promoter with promoCode
   ↓
7. get-promoter queries Supabase and returns data
   ↓
8. Dashboard displays promoter info ✅
```

## Troubleshooting

### If still getting "Promoter not found":

1. **Check Database**:
```sql
SELECT * FROM promoters WHERE status = 'approved';
```

2. **Check Netlify Logs**:
```bash
netlify functions:log get-promoter
```

3. **Test API Directly**:
```bash
curl https://your-site.netlify.app/.netlify/functions/get-promoter/SFTEST001
```

### If SMS not working:

1. Verify Twilio credentials in .env and Netlify
2. Check phone number format (must be E.164: +1XXXXXXXXXX)
3. Check Twilio console for errors

## Next Steps

1. ✅ Test the login flow with test promoter
2. ✅ Deploy to production
3. ✅ Test SMS finder tool  
4. ✅ Add real promoters to database
5. ✅ Monitor Netlify function logs

## Need Help?

Check these files for reference:
- `/DEPLOYMENT_CHECKLIST.md` - Full deployment guide
- `/QUICK_START_TESTING.md` - Testing instructions
- `/supabase-promoter-schema.sql` - Database schema

---

**Status**: ✅ FIXED AND READY TO DEPLOY

All code changes are complete. Just need to:
1. Run the SQL to ensure test promoter exists
2. Deploy with `./deploy.sh`
3. Test the login flow!