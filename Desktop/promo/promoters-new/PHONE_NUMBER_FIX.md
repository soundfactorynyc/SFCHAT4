# 🚨 CRITICAL FIX: Phone Number Mismatch Issue

## THE PROBLEM

When users try to log in via SMS, they get "No account found" even though they signed up successfully. This is because:

**Phone Number Format Mismatch:**
- ❌ Signup saves: `+19082550185` (from Twilio/Stripe)
- ❌ Login searches: `(908) 255-0185` (user's input)
- ❌ Database query: `.eq('phone', phone)` - EXACT match required
- ❌ **Result: NO MATCH = "No account found"**

---

## THE SOLUTION

We need to **normalize phone numbers** to a consistent format in 3 places:

### 1. During Signup (create-promoter.js)
### 2. During SMS Send (send-sms-code.js)  
### 3. During SMS Verify (verify-sms-code.js)

---

## 🔧 FIX 1: Create Phone Normalization Utility

Create this new file:

**File:** `/netlify/functions/utils/phone-normalizer.js`

```javascript
// Normalize phone numbers to consistent format
// Removes all non-digits, handles +1 prefix
function normalizePhone(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading 1 if present (US country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    cleaned = cleaned.substring(1);
  }
  
  // Must be exactly 10 digits for US numbers
  if (cleaned.length !== 10) {
    throw new Error('Invalid phone number. Must be 10 digits.');
  }
  
  // Return with +1 prefix for Twilio compatibility
  return `+1${cleaned}`;
}

// Format for display (optional)
function formatPhoneDisplay(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

module.exports = { normalizePhone, formatPhoneDisplay };
```

---

## 🔧 FIX 2: Update send-sms-code.js

Add phone normalization:

```javascript
// At the top, after other requires:
const { normalizePhone } = require('./utils/phone-normalizer');

// In the handler, replace the phone lookup section (around line 22-40):
try {
  const { phone: rawPhone } = JSON.parse(event.body || '{}');

  if (!rawPhone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Phone number required' })
    };
  }

  // ✅ NORMALIZE PHONE NUMBER
  let phone;
  try {
    phone = normalizePhone(rawPhone);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }

  console.log('=== SMS CODE REQUEST ===');
  console.log('Raw phone input:', rawPhone);
  console.log('Normalized phone:', phone);
```

---

## 🔧 FIX 3: Update verify-sms-code.js

Same normalization:

```javascript
// At the top:
const { normalizePhone } = require('./utils/phone-normalizer');

// In the handler (around line 26-35):
try {
  const { phone: rawPhone, code } = JSON.parse(event.body || '{}');

  if (!rawPhone || !code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Phone number and code required' })
    };
  }

  // ✅ NORMALIZE PHONE NUMBER
  let phone;
  try {
    phone = normalizePhone(rawPhone);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }

  console.log('Verification attempt - Raw:', rawPhone, '| Normalized:', phone);
```

---

## 🔧 FIX 4: Update create-promoter.js

Normalize on signup too:

```javascript
// At the top:
const { normalizePhone } = require('./utils/phone-normalizer');

// In the handler (around line 20-28):
try {
  const { email, name, phone: rawPhone, flyerRequest } = JSON.parse(event.body || '{}');

  if (!email || !name || !rawPhone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name, email, and phone are required' })
    };
  }

  // ✅ NORMALIZE PHONE NUMBER
  let phone;
  try {
    phone = normalizePhone(rawPhone);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }

  console.log('Signup - Raw phone:', rawPhone, '| Normalized:', phone);
```

---

## 🔧 FIX 5: Clean Existing Database Records

Run this SQL in Supabase to normalize existing phone numbers:

```sql
-- Update all existing phone numbers to normalized format
UPDATE promoters 
SET phone = CASE
  -- If already has +1, keep it
  WHEN phone LIKE '+1%' THEN phone
  -- If starts with 1 and is 11 digits, add +
  WHEN phone ~ '^\d{11}$' AND phone LIKE '1%' THEN '+' || phone
  -- If 10 digits, add +1
  WHEN phone ~ '^\d{10}$' THEN '+1' || phone
  -- Otherwise try to extract 10 digits and add +1
  ELSE '+1' || regexp_replace(phone, '\D', '', 'g')
END
WHERE phone IS NOT NULL;

-- Verify the changes
SELECT phone, name, email FROM promoters ORDER BY created_at DESC LIMIT 10;
```

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Create Utils Directory
```bash
cd /Users/jpwesite/Desktop/promo/promoters-new/netlify/functions
mkdir -p utils
```

### Step 2: Create Phone Normalizer
```bash
# Copy the phone-normalizer.js code above into:
