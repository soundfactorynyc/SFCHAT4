# 🚀 DEPLOYMENT & TESTING PROMPT FOR NEW CHAT

Copy this entire prompt into a new chat to deploy and test the system:

---

I have a complete Stripe OAuth authentication system for a promoter platform that needs to be deployed and tested. The implementation is 100% complete with all files ready.

## Project Location
`/Users/jpwesite/Desktop/promo/promoters-new/`

## What's Complete
✅ All backend functions written and ready
✅ All frontend pages complete
✅ Session management implemented
✅ Error handling comprehensive
✅ Documentation complete

## Files to Deploy

### Backend Functions (netlify/functions/)
1. `stripe-connect-signup.js` - Creates new accounts
2. `stripe-login-with-email.js` - Email-based login
3. `stripe-login-verify.js` - Session creation
4. `verify-stripe-setup.js` - Signup verification

### Frontend Pages (public/)
1. `index-stripe-oauth.html` - Signup page
2. `promoter-login-stripe-v2.html` - Login page
3. `stripe-oauth-callback.html` - Signup callback
4. `stripe-oauth-callback-login.html` - Login callback

## Environment Variables Required
```
STRIPE_SECRET_KEY=sk_live_51PY93aKgJ6MFAw17...
STRIPE_PUBLISHABLE_KEY=pk_live_51PY93aKgJ6MFAw17...
STRIPE_CONNECT_CLIENT_ID=ca_T0TIKorMxFGv9ahDB0ZYuzdRtjfzi7F6
SUPABASE_URL=https://axhsljfsrfkrpdtbgdpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

## Tasks Needed

### 1. Pre-Deployment Verification
- [ ] Check all files exist and are complete
- [ ] Verify environment variables in .env file
- [ ] Review netlify.toml configuration
- [ ] Check Supabase database schema

### 2. Deployment
- [ ] Commit all files to git
- [ ] Push to GitHub/repository
- [ ] Verify Netlify auto-deployment triggers
- [ ] Check build logs for errors
- [ ] Confirm environment variables in Netlify dashboard

### 3. Testing - Signup Flow
- [ ] Visit signup page on deployed URL
- [ ] Fill in: First Name, Last Name, Email, Phone (+1xxxxxxxxxx format)
- [ ] Click "Connect with Stripe"
- [ ] Complete Stripe onboarding
- [ ] Verify phone via SMS
- [ ] Confirm auto-redirect to dashboard
- [ ] Check localStorage has session data
- [ ] Verify database record created

### 4. Testing - Login Flow
- [ ] Visit login page
- [ ] Enter email from signup
- [ ] Click "Continue with Stripe"
- [ ] Verify phone via SMS from Stripe
- [ ] Confirm auto-redirect to dashboard
- [ ] Check localStorage updated with new session
- [ ] Verify database session_token updated
- [ ] Confirm last_login_at timestamp updated

### 5. Testing - Error Cases
- [ ] Try signup with existing email (should error)
- [ ] Try login with non-existent email (should error)
- [ ] Test with suspended account status (should error)
- [ ] Cancel Stripe flow (should return with error)
- [ ] Test session expiration after 24 hours

### 6. Verification
- [ ] Check Netlify function logs for any errors
- [ ] Verify Stripe dashboard shows new Connect accounts
- [ ] Check Supabase database for correct data
- [ ] Test on mobile device
- [ ] Verify SMS delivery works

## Expected Results

### After Signup:
- New record in `promoters` table
- Stripe Connect account created
- Session stored in localStorage
- User logged into dashboard
- Phone verified via Stripe SMS

### After Login:
- Session_token updated in database
- last_login_at timestamp updated
- New session in localStorage
- User logged into dashboard
- Phone re-verified via Stripe SMS

## Troubleshooting

If issues occur, check:
1. Browser console for JavaScript errors
2. Netlify function logs in dashboard
3. Stripe dashboard for API errors
4. Supabase logs for database errors
5. Environment variables are correct

## Documentation Available

Read these files for reference:
- `STRIPE_OAUTH_COMPLETE.md` - Complete system documentation
- `IMPLEMENTATION_COMPLETE.md` - Implementation details
- `STRIPE_OAUTH_QUICK_REFERENCE.md` - Quick reference guide
- `STRIPE_OAUTH_FLOW_DIAGRAMS.md` - Visual flow diagrams

## What I Need You To Do

1. **First**: Verify all files are present and environment variables are configured
2. **Then**: Deploy to Netlify (commit + push if not auto-deployed)
3. **Finally**: Run through the complete testing checklist above
4. **Report**: Any errors or issues that occur during testing

Please start by checking the project structure and confirming all files are ready for deployment.

---

**System Status:** Ready for deployment ✅
**No code changes needed:** All implementation complete ✅
**Just needs:** Deployment + Testing ✅