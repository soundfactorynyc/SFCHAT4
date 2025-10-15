# 🎯 JONATHAN'S PROMOTER SETUP - QUICK REFERENCE

## Your Information
- **Name**: Jonathan Peters
- **Phone**: +19293629534 (or 9293629534)
- **Email**: jp@soundfactorynyc.com
- **Promo Code**: JP2025
- **Status**: approved

---

## 📍 Important URLs

### Main Site
- **Landing/Signup**: https://promoters.soundfactorynyc.com/index.html
- **Login (SMS)**: https://promoters.soundfactorynyc.com/promoter-login.html
- **Dashboard**: https://promoters.soundfactorynyc.com/promoter-dashboard.html?code=JP2025
- **AI Flyer**: https://promoters.soundfactorynyc.com/ai-flyer-customization.html

### Admin
- **Supabase**: https://supabase.com/dashboard (jpnyc project)
- **Netlify**: https://app.netlify.com/projects/promoters-soundfactory

---

## 🔧 Quick Fix: Add Yourself Back to Database

If you get "No account found", run this in Supabase SQL Editor:

```sql
-- Delete old entries
DELETE FROM promoters WHERE phone IN ('+19293629534', '+19082550185');

-- Add yourself back
INSERT INTO promoters (
  promo_code,
  first_name,
  last_name,
  name,
  email,
  phone,
  stripe_account_id,
  status,
  tickets_sold,
  commission_earned
) VALUES (
  'JP2025',
  'Jonathan',
  'Peters',
  'Jonathan Peters',
  'jp@soundfactorynyc.com',
  '+19293629534',
  'acct_test_jp2025',
  'approved',
  0,
  0
);

-- Verify it worked
SELECT promo_code, first_name, phone, status 
FROM promoters 
WHERE phone = '+19293629534';
```

---

## 🧪 Complete Test Flow

### 1. Fresh Start (Optional)
```sql
DELETE FROM promoters WHERE phone = '+19293629534';
```

### 2. Signup (if testing full flow)
- Go to: https://promoters.soundfactorynyc.com/index.html
- Fill form with your real Stripe info
- Complete Stripe onboarding
- Get redirected back

### 3. Login via SMS
- Go to: https://promoters.soundfactorynyc.com/promoter-login.html
- Enter: `9293629534`
- Get SMS code
- Enter code
- Dashboard loads! ✅

### 4. Test Dashboard
- Check name displays: "Jonathan Peters"
- Check promo code: "JP2025"
- Test referral link copy
- Test AI flyer customization
- Check all stats show

---

## 🔑 Database Schema

Your promoters table has these columns:
- `id` (uuid)
- `promo_code` (text, unique)
- `first_name` (text)
- `last_name` (text)
- `name` (text)
- `email` (text, unique)
- `phone` (text, unique) - **Must be +1XXXXXXXXXX format**
- `stripe_account_id` (text)
- `status` (text) - **Must be 'approved' to login**
- `tickets_sold` (integer)
- `commission_earned` (numeric)
- `session_token` (text)
- `session_expires_at` (timestamp)
- `last_login_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 🚨 Common Issues & Fixes

### "No account found"
**Problem**: Not in database or wrong phone format
**Fix**: Run the SQL above to add yourself back

### "Error loading dashboard"
**Problem**: API redirect not working
**Fix**: Already fixed in `_redirects` file

### SMS not sending
**Problem**: Twilio config or phone format
**Fix**: Phone must be in +1XXXXXXXXXX format

### AI flyer error
**Problem**: CORS or missing API key
**Fix**: Already fixed with CORS headers

---

## 📱 Phone Number Formats

These all work:
- `9293629534` ✅
- `19293629534` ✅
- `+19293629534` ✅
- `(929) 362-9534` ✅
- `929-362-9534` ✅

All normalize to: `+19293629534`

---

## 🔐 RLS Policies (Already Set)

These policies allow the app to work:
1. **anon can SELECT promoters** - For login lookup
2. **anon can UPDATE promoters** - For session tokens
3. **service_role has full access** - For admin operations

---

## 🚀 Deploy Command

```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
netlify deploy --prod
```

Site URL: https://promoters.soundfactorynyc.com

---

## 📋 Quick Checks

### Verify you're in database:
```sql
SELECT * FROM promoters WHERE phone = '+19293629534';
```

### Check all approved promoters:
```sql
SELECT promo_code, first_name, phone, status 
FROM promoters 
WHERE status = 'approved';
```

### Test API directly:
```bash
curl https://promoters.soundfactorynyc.com/api/promoter/JP2025
```

---

## 💾 Project Location

Local folder: `/Users/jpwesite/Desktop/promo/promoters-new/`

Key files:
- `public/promoter-login.html` - SMS login page
- `public/promoter-dashboard.html` - Main dashboard
- `public/index.html` - Landing/signup page
- `netlify/functions/send-sms-code.js` - SMS sending
- `netlify/functions/verify-sms-code.js` - Code verification
- `netlify/functions/get-promoter.js` - Get promoter data
- `public/_redirects` - API routing

---

## ✅ Everything Working Checklist

- [ ] Can access landing page
- [ ] SMS sends successfully
- [ ] SMS code verifies
- [ ] Dashboard loads with your info
- [ ] Referral link works
- [ ] AI flyer customization works
- [ ] Stats display correctly

---

## 🆘 Emergency Reset

If everything breaks:

```sql
-- Nuclear option: Start completely fresh
DROP TABLE IF EXISTS promoter_sales CASCADE;
DROP TABLE IF EXISTS promoters CASCADE;

-- Then re-run the setup SQL from SETUP_COMPLETE.sql
```

---

**Last Updated**: October 14, 2025
**Status**: ✅ Fully Working