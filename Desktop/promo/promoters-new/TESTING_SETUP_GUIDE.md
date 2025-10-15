# SETUP GUIDE - Testing Promoter SMS System

## Step 1: Set Up Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `axhsljfsrfkrpdtbgdpv`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase-promoter-schema.sql`
6. Click **Run** to create the tables

## Step 2: Add Test Promoter (Your Account)

1. Stay in SQL Editor
2. Create a new query
3. Copy and paste the contents of `add-test-promoter.sql`
4. Click **Run**
5. You should see a success message with your promoter details

## Step 3: Verify Environment Variables

Check that `.env` has these values (already configured):
```
SUPABASE_URL="https://axhsljfsrfkrpdtbgdpv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
TWILIO_ACCOUNT_SID="AC0b07f1131359606c90cb23e3d0eaca75"
TWILIO_AUTH_TOKEN="85a38b02f4af3354c7aa667ac8fde26a"
TWILIO_PHONE_NUMBER="+16464664925"
TWILIO_VERIFY_SERVICE_SID="VE69c66df20193cc116f7fa9d20e80dc9"
```

## Step 4: Test Locally with Netlify CLI

1. Install Netlify CLI (if not already):
   ```bash
   npm install -g netlify-cli
   ```

2. Navigate to promoters-new folder:
   ```bash
   cd /Users/jpwesite/Desktop/SF/promoters-new
   ```

3. Install dependencies:
   ```bash
   npm install @supabase/supabase-js twilio stripe
   ```

4. Start Netlify Dev server:
   ```bash
   netlify dev
   ```

5. Open browser to: http://localhost:8888/public/test-sms-login.html

## Step 5: Test SMS Login

1. Enter your phone: `+19293629534` or `9293629534`
2. Click "Send Code"
3. Check your phone for SMS code
4. Enter the 6-digit code
5. Click "Verify Code"
6. You should be logged in and see your dashboard!

## Step 6: Test Promo Link

Once logged in, your unique referral link will be:
```
http://localhost:8888/public/team-tickets-tables.html?promo=SFTEST001&name=Test+Promoter
```

This link tracks all purchases back to your account!

## Troubleshooting

### SMS not sending?
- Check Twilio console for errors: https://console.twilio.com
- Verify TWILIO_VERIFY_SERVICE_SID is correct (no extra quotes/spaces)
- Check phone number format: must start with +1

### Database errors?
- Run the schema SQL again
- Check Supabase logs in dashboard
- Verify RLS policies are created

### Function errors?
- Check `netlify dev` terminal output
- Look for missing environment variables
- Test functions individually at `/.netlify/functions/send-sms-code`

## Your Test Account Details

- **Phone**: +19293629534
- **Promo Code**: SFTEST001
- **Status**: approved
- **Commission**: $10/ticket, 20% tables

## Next Steps After Testing

1. ✅ Test SMS login flow
2. ✅ Test ticket purchase with promo code
3. ✅ Verify commission tracking
4. ✅ Test dashboard displays correctly
5. 🚀 Deploy to production (Netlify)
6. 🎉 Share signup link with real team members!
