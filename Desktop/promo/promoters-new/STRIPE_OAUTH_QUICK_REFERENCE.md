# 🎯 QUICK REFERENCE - Stripe OAuth Auth System

## 📁 FILE LOCATIONS

### Backend Functions (netlify/functions/)
```
stripe-connect-signup.js      → Creates new Stripe account + DB record
stripe-login-with-email.js    → Finds user, creates login link
stripe-login-verify.js        → Verifies auth, creates session  
verify-stripe-setup.js        → Verifies signup, creates session
```

### Frontend Pages (public/)
```
index-stripe-oauth.html              → Signup form
promoter-login-stripe-v2.html        → Login form
stripe-oauth-callback.html           → Signup callback
stripe-oauth-callback-login.html     → Login callback
promoter-dashboard.html              → Protected dashboard
```

---

## 🔄 FLOW DIAGRAMS

### Signup: User → Stripe → Dashboard
```
Form → Backend → Stripe Onboarding → Callback → Verify → Session → Dashboard
```

### Login: Email → Stripe SMS → Dashboard  
```
Email → Backend → Stripe SMS Verify → Callback → Verify → Session → Dashboard
```

---

## 🔑 SESSION FORMAT
```javascript
localStorage.getItem('promoter_session') = {
  token: "64-char-hex",
  promoter: { id, promo_code, name, email, ... },
  expiresAt: "ISO-8601-timestamp"
}
```

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# Commit changes
git add .
git commit -m "Complete Stripe OAuth authentication system"
git push origin main

# Netlify auto-deploys from main branch
# Check deployment at: https://app.netlify.com
```

---

## ✅ TESTING CHECKLIST

- [ ] Signup with new email
- [ ] Complete Stripe onboarding
- [ ] Verify SMS code works
- [ ] Auto-redirect to dashboard
- [ ] Login with existing email
- [ ] SMS verification on login
- [ ] Session persists on refresh
- [ ] Session expires after 24h

---

## 🐛 COMMON ISSUES & FIXES

| Issue | Solution |
|-------|----------|
| Email not found | User needs to sign up first |
| Account pending | Admin approval required |
| SMS not received | Check phone format: +1xxxxxxxxxx |
| Session lost | Clear localStorage, re-login |

---

## 📊 DATABASE QUERIES

```sql
-- Find promoter by email
SELECT * FROM promoters WHERE email = 'user@example.com';

-- Check active sessions
SELECT * FROM promoters WHERE session_expires_at > NOW();

-- View login history
SELECT email, last_login_at FROM promoters ORDER BY last_login_at DESC;
```

---

**System Status:** ✅ PRODUCTION READY
**Last Updated:** October 15, 2025
