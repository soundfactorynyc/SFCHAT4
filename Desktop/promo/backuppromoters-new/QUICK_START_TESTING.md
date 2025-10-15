# 🚀 COMPLETE SETUP & TESTING CHECKLIST

## ✅ What I've Set Up For You

### 1. Database Schema Ready
- ✅ Created `supabase-promoter-schema.sql` - Run this in Supabase SQL Editor
- ✅ Created `add-test-promoter.sql` - Adds your phone (+19293629534) as approved promoter

### 2. Test Files Created
- ✅ `public/test-sms-login.html` - Simple SMS login test page
- ✅ Your phone pre-filled: +19293629534
- ✅ Promo code: SFTEST001

### 3. Environment Variables
- ✅ All Twilio credentials in `.env`
- ✅ All Supabase credentials in `.env`
- ✅ All Stripe credentials in `.env`

### 4. Dependencies
- ✅ npm packages installed

---

## 📋 STEP-BY-STEP TESTING INSTRUCTIONS

### STEP 1: Set Up Supabase (5 minutes)

1. Open Supabase: https://supabase.com/dashboard/project/axhsljfsrfkrpdtbgdpv

2. Click **SQL Editor** → **New Query**

3. Copy entire contents of: `supabase-promoter-schema.sql`

4. Click **Run** ▶️

5. You should see: "Promoter system database schema created successfully! 🎉"

6. Create **another new query**

7. Copy entire contents of: `add-test-promoter.sql`

8. Click **Run** ▶️

9. You should see your test promoter details with phone: +19293629534

---

### STEP 2: Start Netlify Dev (2 minutes)

Open Terminal and run:

```bash
cd /Users/jpwesite/Desktop/SF/promoters-new
netlify dev
```

**If you don't have Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify link  # Link to your Netlify site
netlify dev
```

The server will start at: **http://localhost:8888**

---

### STEP 3: Test SMS Login (1 minute)

1. Open browser: http://localhost:8888/public/test-sms-login.html

2. Phone number is pre-filled: **+19293629534**

3. Click **"Send Verification Code"**

4. Check your phone (929-362-9534) for SMS code

5. Enter the 6-digit code

6. Click **"Verify Code"**

7. ✅ **You're logged in!** Should see:
   - Promo Code: SFTEST001
   - Tickets Sold: 0
   - Commission: $0.00
   - Your referral link

---

### STEP 4: Test Promo Link Tracking

1. Copy your referral link from the dashboard

2. Open it in new tab (will look like):
   ```
   http://localhost:8888/public/team-tickets-tables.html?promo=SFTEST001&name=Test+Promoter
   ```

3. You should see:
   - ✅ Promotional page loads
   - ✅ Your name appears at top (if we added that feature)
   - ✅ All ticket/table prices shown
   - ✅ Promo code in URL

---

### STEP 5: Test Ticket Purchase (Optional - requires Stripe test mode)

1. Click "Buy Ticket" on your promo link page

2. Enter test card: `4242 4242 4242 4242`

3. Complete purchase

4. Check if commission is tracked in dashboard

---

## 🔧 TROUBLESHOOTING

### SMS Not Sending?

**Check Twilio Verify Service:**
```bash
# In .env, remove extra quotes/spaces from:
TWILIO_VERIFY_SERVICE_SID="VE69c66df20193cc116f7fa9d20e80dc9"
```

**Test Twilio directly:**
- Go to: https://console.twilio.com/us1/develop/verify/services
- Find your Verify service
- Test with your phone number

### Database Errors?

**Check in Supabase:**
1. Go to SQL Editor
2. Run: `SELECT * FROM promoters;`
3. You should see your test promoter
4. Check phone format: `+19293629534` (with +)

### Netlify Function Errors?

**Check the terminal output when running `netlify dev`**

Common issues:
- Missing environment variables
- Wrong Supabase URL/key
- Twilio credentials incorrect

**Test function directly:**
```bash
curl -X POST http://localhost:8888/.netlify/functions/send-sms-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"+19293629534"}'
```

---

## 📱 EXPECTED SMS MESSAGE

You should receive:
```
Your Sound Factory verification code is: 123456
```

(The actual code will be different each time)

---

## ✅ SUCCESS CRITERIA

- [ ] Supabase tables created
- [ ] Test promoter added with your phone
- [ ] `netlify dev` running without errors
- [ ] SMS code received on your phone
- [ ] Successfully logged in to test page
- [ ] Dashboard shows promo code SFTEST001
- [ ] Referral link generated correctly
- [ ] Can access team-tickets-tables page with promo code

---

## 🎯 NEXT STEPS AFTER TESTING

Once everything works locally:

1. **Deploy to Production:**
   ```bash
   git add .
   git commit -m "Complete promoter system with SMS auth"
   git push
   netlify deploy --prod
   ```

2. **Share Signup Link:**
   ```
   https://your-site.netlify.app/public/promoter-signup.html
   ```

3. **Admin Approval Flow:**
   - New signups will be "pending"
   - You manually approve via Supabase dashboard
   - Change `status` from 'pending' to 'approved'
   - They can then login via SMS

---

## 📞 YOUR TEST ACCOUNT

- **Phone**: +19293629534
- **Promo Code**: SFTEST001
- **Status**: approved (ready to test immediately)
- **Email**: test@soundfactorynyc.com

---

Need help? Check the terminal output from `netlify dev` for detailed error messages!
