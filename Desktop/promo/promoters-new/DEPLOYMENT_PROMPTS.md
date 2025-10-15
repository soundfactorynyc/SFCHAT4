# 🎯 QUICK DEPLOYMENT PROMPT (Copy & Paste)

---

## ONE-LINER PROMPT

```
I have a complete Stripe OAuth authentication system at /Users/jpwesite/Desktop/promo/promoters-new/ that needs deployment and testing. All code is complete (stripe-login-with-email.js, stripe-login-verify.js, stripe-oauth-callback-login.html are ready). Please: 1) Check all files exist, 2) Verify environment variables in .env, 3) Deploy to Netlify (git commit + push), 4) Test signup flow (index-stripe-oauth.html → Stripe onboarding → SMS verify → dashboard), 5) Test login flow (promoter-login-stripe-v2.html → enter email → Stripe SMS verify → dashboard), 6) Verify sessions work, 7) Check database updates. Documentation is in STRIPE_OAUTH_COMPLETE.md. Report any issues found.
```

---

## DETAILED PROMPT (For More Context)

```
Deploy and test my complete Stripe OAuth authentication system:

PROJECT: /Users/jpwesite/Desktop/promo/promoters-new/

COMPLETED FILES:
✅ netlify/functions/stripe-login-with-email.js (NEW - 119 lines)
✅ netlify/functions/stripe-login-verify.js (REWRITTEN - 138 lines)
✅ public/stripe-oauth-callback-login.html (UPDATED - 188 lines)
✅ All other files already complete

WHAT IT DOES:
- Signup: User enters info → Stripe onboarding + phone verify → auto-login
- Login: User enters email → Stripe SMS verify → auto-login
- No Twilio needed - all SMS via Stripe

TASKS:
1. Verify files: Check all backend functions and frontend pages exist
2. Check .env: Ensure STRIPE_SECRET_KEY, SUPABASE_URL, etc. are set
3. Deploy: git commit + push (Netlify auto-deploys)
4. Test signup: Go through full flow, verify SMS works
5. Test login: Enter email, complete SMS verification
6. Verify: Check localStorage session, database updates, dashboard access
7. Test errors: Try existing email, non-existent email, cancelled flows

ENVIRONMENT VARIABLES NEEDED:
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY  
- STRIPE_CONNECT_CLIENT_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

READ DOCS: STRIPE_OAUTH_COMPLETE.md has full documentation

Please start by verifying the project structure and let me know if ready to deploy.
```

---

## SUPER SHORT VERSION

```
Deploy & test Stripe OAuth auth system at /Users/jpwesite/Desktop/promo/promoters-new/. All code complete. Need to: verify files, check .env, deploy to Netlify, test signup/login flows with SMS verification, confirm sessions work. Docs in STRIPE_OAUTH_COMPLETE.md
```

---

## TROUBLESHOOTING PROMPT (If Issues Occur)

```
I deployed the Stripe OAuth system but encountering [DESCRIBE ISSUE]. 

Project: /Users/jpwesite/Desktop/promo/promoters-new/

Please help debug:
1. Check Netlify function logs for errors
2. Review browser console for JavaScript errors  
3. Verify environment variables are set correctly
4. Check Stripe dashboard for API errors
5. Review Supabase database logs
6. Test the specific flow that's failing

Documentation available in:
- STRIPE_OAUTH_COMPLETE.md (full system docs)
- STRIPE_OAUTH_QUICK_REFERENCE.md (quick reference)
- STRIPE_OAUTH_FLOW_DIAGRAMS.md (visual flows)
```

---

## COPY THIS INTO NEW CHAT 👇

Choose the version that fits your needs:
- **ONE-LINER:** For quick deployment with Claude handling everything
- **DETAILED:** For step-by-step deployment with more context
- **SUPER SHORT:** Minimal prompt with key info
- **TROUBLESHOOTING:** If you encounter issues during testing

---

**All prompts are ready to copy and paste into a new chat!** 📋✨