# Promoter System Workflow Status

## ✅ WORKING: Signup → Approval → Login Flow

### 1. Signup (promoter-signup.html) ✅
- User fills form: name, email, phone
- Can request AI flyer customization
- Data sent to `/api/create-promoter`
- Backend creates:
  - Stripe Connect account
  - Supabase record with `status: 'pending'`
  - Stores phone number for SMS login
  - Stores `flyer_request` if provided

### 2. Stripe Onboarding ✅
- User redirected to Stripe onboarding
- Must complete Stripe verification
- Returns to promoter-login.html

### 3. Admin Approval (REQUIRED BEFORE LOGIN) ✅
- Admin reviews new promoter in admin panel
- Admin changes `status` from 'pending' to 'approved'
- Only then can promoter log in

### 4. SMS Login (promoter-login.html) ✅
- User enters phone number
- SMS code sent via Twilio (send-sms-code.js)
- User enters 6-digit code
- Backend verifies code (verify-sms-code.js)
- ✅ Checks `status = 'approved'` - blocks if not approved
- Creates 24-hour session token
- Returns: sessionToken, promoCode, name, email

### 5. Dashboard Access (promoter-dashboard.html) ✅
- Shows total commission earned
- Shows tickets sold
- Shows table sales
- Commission breakdown:
  - Tickets: $10/ticket
  - Tables: 20% commission
- Link to personalized tickets/tables page

---

## ❌ NEEDS FIXING: Tickets & Tables Page

### Current Issues:
1. **Wrong ticket link** - Uses Ticketspice instead of Stripe
2. **No promo code tracking** - Links don't include promoter's promo code
3. **Not personalized** - Should show promoter's name
4. **Not based on SF HALLOWEEN TABLES 2025.html** - Should use that design

### What It Should Be:
```
Base: /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com/tables/SF HALLOWEEN TABLES 2025.html

Modifications needed:
1. Add promo code to URL query params
2. Replace Ticketspice links with Stripe Checkout links
3. Pass promo code to Stripe metadata for tracking
4. Show "Shared by [Promoter Name]" at top
5. Track all purchases back to promoter for commission
```

### Stripe Integration Needed:
- Ticket purchase function should call `/.netlify/functions/purchase-ticket`
- Include `promoCode` in request
- Backend creates Stripe checkout with metadata: `{ promoter_code: 'SF123ABC' }`
- Webhook processes payment and credits promoter

---

## 📋 Action Items

### HIGH PRIORITY:
1. [ ] Create new `team-tickets-tables.html` based on SF HALLOWEEN TABLES 2025 design
2. [ ] Wire up Stripe ticket purchases (not Ticketspice)
3. [ ] Add promo code tracking to all links
4. [ ] Update purchase flow to credit promoter commissions

### Files Involved:
- `/Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com/tables/SF HALLOWEEN TABLES 2025.html` (base design)
- `promoters-new/public/team-tickets-tables.html` (needs complete rewrite)
- `promoters-new/netlify/functions/purchase-ticket.js` (backend)
- `promoters-new/netlify/functions/stripe-webhook.js` (commission crediting)

---

## Database Schema Check

Promoters table needs:
```sql
- id (uuid)
- promo_code (text, unique)
- stripe_account_id (text)
- name (text)
- email (text)
- phone (text)
- status (text) -- 'pending' or 'approved'
- flyer_request (text) -- AI customization request
- tickets_sold (integer, default 0)
- commission_earned (numeric, default 0)
- session_token (text)
- session_expires_at (timestamp)
- last_login_at (timestamp)
```

✅ All fields already in place based on create-promoter.js and verify-sms-code.js
