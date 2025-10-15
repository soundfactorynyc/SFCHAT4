# 🚨 FIX: "Promoter not found" Error After SMS Login

## What's Happening

✅ **SMS Login Works** - You can send/receive verification codes  
❌ **Dashboard Fails** - "Error loading dashboard: Promoter not found"

## Why This Happens

After SMS verification succeeds, the dashboard tries to load promoter data from the **Supabase database**. 

**The problem**: There's no promoter record in the database matching your phone number!

## The Fix (Takes 2 minutes)

### Step 1: Get Your Phone Number

What phone number are you using for SMS login?  
Format must be: `+1XXXXXXXXXX` (E.164 format)

Example: `+19293629534`

### Step 2: Add Promoter to Database

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to SQL Editor** (left sidebar)
3. **Run this SQL** (replace phone number with yours):

```sql
-- Add YOUR promoter to the database
INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status,
  tickets_sold,
  commission_earned,
  created_at
) VALUES (
  'YOURCODE',                     -- Change to your promo code
  'Your Name',                    -- Change to your name
  'your@email.com',              -- Change to your email
  '+1XXXXXXXXXX',                -- ⚠️ CHANGE TO YOUR PHONE NUMBER!
  'approved',                     -- Must be 'approved' to login
  0,
  0,
  NOW()
)
ON CONFLICT (phone) 
DO UPDATE SET 
  status = 'approved',
  promo_code = 'YOURCODE';

-- Verify it was created
SELECT * FROM promoters WHERE phone = '+1XXXXXXXXXX';
```

### Step 3: Test Login Again

1. Go to promoter login page
2. Enter your phone number
3. Enter SMS code
4. **Dashboard should now load! ✅**

---

## Example with Real Data

If your phone is `+19293629534`:

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
ON CONFLICT (phone) 
DO UPDATE SET status = 'approved';
```

---

## Quick Verification

After adding the promoter, verify in Supabase:

```sql
-- Check if promoter exists
SELECT 
  promo_code,
  name,
  phone,
  status
FROM promoters 
WHERE status = 'approved';
```

You should see your promoter listed!

---

## Why This Works

The login flow is:
1. ✅ SMS code sent via Twilio
2. ✅ Code verified
3. ✅ `verify-sms-code.js` looks up promoter by phone in database
4. ❌ **If not found** → "Promoter not found" error
5. ✅ **If found** → Returns promo code, redirects to dashboard
6. ✅ Dashboard loads promoter data using promo code

**The fix**: Add the promoter to the database so step 3 can find them!

---

## Common Issues

### Phone Number Format
- ✅ Correct: `+19293629534`
- ❌ Wrong: `9293629534`
- ❌ Wrong: `(929) 362-9534`
- ❌ Wrong: `+1 929 362 9534`

### Status Must Be 'approved'
```sql
-- Make sure status is 'approved'
UPDATE promoters 
SET status = 'approved' 
WHERE phone = '+1XXXXXXXXXX';
```

### Check Supabase Connection
Make sure your `.env` has:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## Still Not Working?

Run the diagnostic script:
```bash
cd /Users/jpwesite/Desktop/promo/promoters-new
chmod +x diagnose.sh
./diagnose.sh
```

Or check Netlify function logs:
```bash
netlify functions:log verify-sms-code
netlify functions:log get-promoter
```

---

## That's It!

Once you add the promoter to the database, everything will work! 🎉

The code is all correct - it just needs a promoter record to find.