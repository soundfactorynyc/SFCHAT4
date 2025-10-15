
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 RETURNING USER LOGIN                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    👤 USER                    🌐 FRONTEND              🔧 BACKEND              🔐 STRIPE           💾 DATABASE
      │                           │                        │                       │                    │
      │  Visit login page         │                        │                       │                    │
      ├──────────────────────────>│                        │                       │                    │
      │                           │                        │                       │                    │
      │  Enter email only         │                        │                       │                    │
      ├──────────────────────────>│                        │                       │                    │
      │                           │                        │                       │                    │
      │  Click "Continue"         │  POST /stripe-login-  │                       │                    │
      │                           │  with-email            │                       │                    │
      │                           ├───────────────────────>│                       │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Find promoter        │                    │
      │                           │                        │  by email             │                    │
      │                           │                        ├──────────────────────────────────────────>│
      │                           │                        │                       │                    │
      │                           │                        │<──────────────────────────────────────────┤
      │                           │                        │  Promoter found       │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Validate status      │                    │
      │                           │                        │  (must be approved)   │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Create AccountLink   │                    │
      │                           │                        │  type: account_update │                    │
      │                           │                        │  collect: currently_due                    │
      │                           │                        ├──────────────────────>│                    │
      │                           │                        │                       │                    │
      │                           │                        │<──────────────────────┤                    │
      │                           │  Return login URL      │  Verification URL     │                    │
      │                           │<───────────────────────┤                       │                    │
      │                           │                        │                       │                    │
      │  Redirect to Stripe       │                        │                       │                    │
      │<──────────────────────────┤                        │                       │                    │
      │                           │                        │                       │                    │
      ├────────────────────────────────────────────────────────────────────────────>│                    │
      │  Stripe login page        │                        │                       │                    │
      │  Verify identity          │                        │                       │                    │
      │                           │                        │                       │                    │
      │<────────────────────────────────────────────────────────────────────────────┤                    │
      │  Send SMS code            │                        │                       │                    │
      │                           │                        │                       │                    │
      │  Enter SMS code           │                        │                       │                    │
      ├────────────────────────────────────────────────────────────────────────────>│                    │
      │                           │                        │                       │                    │
      │<────────────────────────────────────────────────────────────────────────────┤                    │
      │  Redirect to callback     │                        │                       │                    │
      │  with promoter_id         │                        │                       │                    │
      │                           │                        │                       │                    │
      ├──────────────────────────>│                        │                       │                    │
      │  Load callback page       │                        │                       │                    │
      │                           │                        │                       │                    │
      │                           │  POST /stripe-login-  │                       │                    │
      │                           │  verify                │                       │                    │
      │                           ├───────────────────────>│                       │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Get promoter data    │                    │
      │                           │                        ├──────────────────────────────────────────>│
      │                           │                        │                       │                    │
      │                           │                        │<──────────────────────────────────────────┤
      │                           │                        │  Promoter found       │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Validate status      │                    │
      │                           │                        │  (must be approved)   │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Verify Stripe        │                    │
      │                           │                        │  account still active │                    │
      │                           │                        ├──────────────────────>│                    │
      │                           │                        │                       │                    │
      │                           │                        │<──────────────────────┤                    │
      │                           │                        │  Account active       │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Generate new session │                    │
      │                           │                        │  token (32 bytes)     │                    │
      │                           │                        │  Expiry: +24 hours    │                    │
      │                           │                        │                       │                    │
      │                           │                        │  Update database      │                    │
      │                           │                        ├──────────────────────────────────────────>│
      │                           │                        │  - session_token      │                    │
      │                           │                        │  - session_expires_at │                    │
      │                           │                        │  - last_login_at      │                    │
      │                           │                        │  - stripe status      │                    │
      │                           │                        │                       │                    │
      │                           │  Return session data   │                       │                    │
      │                           │<───────────────────────┤                       │                    │
      │                           │                        │                       │                    │
      │  Store in localStorage    │                        │                       │                    │
      │<──────────────────────────┤                        │                       │                    │
      │                           │                        │                       │                    │
      │  Redirect to dashboard    │                        │                       │                    │
      │<──────────────────────────┤                        │                       │                    │
      │                           │                        │                       │                    │
      │  🎉 LOGGED IN!            │                        │                       │                    │
      │                           │                        │                       │                    │
```

---

## 🔐 SESSION MANAGEMENT

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    SESSION LIFECYCLE                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    📱 BROWSER                     💾 DATABASE                   ⏰ TIME
      │                               │                            │
      │  Session Created              │                            │
      ├──────────────────────────────>│                            │
      │  localStorage.setItem()       │  INSERT session_token      │
      │                               │  session_expires_at        │
      │                               │  (+24 hours)               │
      │                               │                            │
      │                               │                            ├──────────>
      │                               │                            │  Hour 1
      │  Using dashboard              │                            │  Hour 2
      │  Reading session from         │                            │  ...
      │  localStorage                 │                            │  Hour 23
      │                               │                            │
      │                               │                            ├──────────>
      │                               │                            │  Hour 24
      │  Session Expired!             │                            │  EXPIRED!
      │  Clear localStorage           │                            │
      ├──────────────────────────────>│                            │
      │  Redirect to login            │  session_expires_at        │
      │                               │  < NOW()                   │
      │                               │                            │
```

---

## 🛡️ ERROR HANDLING FLOW

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   ERROR SCENARIOS                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

LOGIN ATTEMPT
    │
    ├──> Email not found ──────────> "No account found. Please sign up."
    │
    ├──> Account pending ──────────> "Your account is pending approval."
    │
    ├──> Account rejected ─────────> "Your account is rejected. Contact support."
    │
    ├──> Account suspended ────────> "Your account is suspended. Contact support."
    │
    ├──> Stripe account missing ───> "Stripe account not found. Contact support."
    │
    ├──> Stripe API error ─────────> "Unable to verify account. Try again."
    │
    ├──> User cancels flow ────────> "Login cancelled. Please try again."
    │
    ├──> Session expired ──────────> "Session expired. Please try again."
    │
    └──> Success ──────────────────> Redirect to dashboard ✅

```

---

## 📊 DATA FLOW DIAGRAM

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 DATA TRANSFORMATIONS                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

USER INPUT                   BACKEND PROCESSING              DATABASE STORAGE
    │                               │                            │
    │  email@example.com           │                            │
    ├─────────────────────────────>│                            │
    │                               │  Normalize:               │
    │                               │  - toLowerCase()          │
    │                               │  - trim()                 │
    │                               │                            │
    │                               │  Query:                   │
    │                               │  WHERE email =            │
    │                               │  'email@example.com'      │
    │                               ├───────────────────────────>│
    │                               │                            │
    │                               │<───────────────────────────┤
    │                               │  promoter_record          │
    │                               │                            │
    │                               │  Generate:                │
    │                               │  token = randomBytes(32)  │
    │                               │  .toString('hex')         │
    │                               │  // 64 characters         │
    │                               │                            │
    │                               │  Calculate:               │
    │                               │  expires = new Date()     │
    │                               │  expires.setHours(+24)    │
    │                               │                            │
    │                               │  Update:                  │
    │                               │  SET session_token        │
    │                               │  SET session_expires_at   │
    │                               │  SET last_login_at        │
    │                               ├───────────────────────────>│
    │                               │                            │
    │                               │  Return:                  │
    │                               │  {                        │
    │<─────────────────────────────┤    token,                 │
    │  localStorage.setItem(        │    promoter,              │
    │    'promoter_session',        │    expiresAt              │
    │    JSON.stringify(data)       │  }                        │
    │  )                            │                            │
    │                               │                            │
```

---

## 🔄 STRIPE ACCOUNTLINK TYPES

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              STRIPE ACCOUNTLINK USAGE                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

SIGNUP (New User)
    │
    └──> AccountLink
         ├─ type: 'account_onboarding'
         ├─ Purpose: Complete account setup
         ├─ Includes: KYC, phone verification, banking
         └─ Result: Fully onboarded Stripe account

LOGIN (Returning User)  
    │
    └──> AccountLink
         ├─ type: 'account_update'
         ├─ collect: 'currently_due'
         ├─ Purpose: Verify identity via SMS
         ├─ Includes: Phone verification
         └─ Result: Authenticated user session
```

---

## 📱 MOBILE FLOW

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  MOBILE USER EXPERIENCE                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📱 PHONE              🌐 WEBSITE           📧 SMS             ✅ RESULT
   │                     │                    │                  │
   │  Open login page    │                    │                  │
   ├────────────────────>│                    │                  │
   │                     │                    │                  │
   │  Enter email        │                    │                  │
   ├────────────────────>│                    │                  │
   │                     │                    │                  │
   │  Tap "Continue"     │                    │                  │
   ├────────────────────>│                    │                  │
   │                     │                    │                  │
   │  Redirect to Stripe │                    │                  │
   │<────────────────────┤                    │                  │
   │                     │                    │                  │
   │  Loading...         │                    │                  │
   │                     │  Send SMS          │                  │
   │                     ├───────────────────>│                  │
   │                     │                    │                  │
   │<────────────────────────────────────────┤                  │
   │  📩 "Your code: 123456"                 │                  │
   │                     │                    │                  │
   │  Enter code         │                    │                  │
   ├────────────────────>│                    │                  │
   │                     │                    │                  │
   │  ✅ Verified!       │                    │                  │
   │<────────────────────┤                    │                  │
   │                     │                    │                  │
   │  Redirect back      │                    │                  │
   │<────────────────────┤                    │                  │
   │                     │                    │                  │
   │  Show success       │                    │                  │
   │  "Welcome Back!"    │                    │                  │
   │<────────────────────┤                    │                  │
   │                     │                    │                  │
   │  Auto-redirect to   │                    │                  │
   │  Dashboard          │                    │                  │
   ├────────────────────────────────────────────────────────────>│
   │                     │                    │  🎉 Logged In!   │
   │                     │                    │                  │
```

---

## 🎯 KEY DECISION POINTS

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 SYSTEM DECISION LOGIC                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

When user submits email:
  ├─ Email exists in database?
  │  ├─ YES → Continue to status check
  │  └─ NO  → Error: "No account found. Please sign up."
  │
  └─ If email exists:
     ├─ Status == 'approved'?
     │  ├─ YES → Generate login link
     │  └─ NO  → Error: "Account is {status}"
     │
     └─ If approved:
        ├─ Stripe account exists?
        │  ├─ YES → Create AccountLink
        │  └─ NO  → Error: "Stripe account not found"
        │
        └─ AccountLink created:
           └─ Redirect user to Stripe ✅

After Stripe verification:
  ├─ Promoter ID in URL?
  │  ├─ YES → Continue to session creation
  │  └─ NO  → Error: "Missing information"
  │
  └─ If promoter ID exists:
     ├─ Promoter still approved?
     │  ├─ YES → Generate session
     │  └─ NO  → Error: "Account status changed"
     │
     └─ If approved:
        ├─ Create session token
        ├─ Set 24-hour expiry
        ├─ Update database
        ├─ Return session data
        └─ Store in localStorage ✅
```

---

**Visual Flow Diagrams Complete!** 📊

These diagrams show:
- ✅ Complete signup flow with all steps
- ✅ Complete login flow with SMS verification
- ✅ Session lifecycle and expiration
- ✅ Error handling for all scenarios
- ✅ Data transformations and storage
- ✅ Mobile-friendly SMS flow
- ✅ Decision logic at each step

Use these diagrams for:
- Understanding the system architecture
- Debugging issues
- Training new developers
- Explaining to stakeholders
- Technical documentation
