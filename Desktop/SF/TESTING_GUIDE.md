# 🧪 SMS Modal Testing & Debugging Guide

## Quick Test Commands

Open your browser's Developer Console (F12) and run these commands:

### 1. Check if everything is loaded
```javascript
// Should show the SMS object if loaded
console.log('SFSMS Library:', window.SFSMS);

// Should show the init function
console.log('Init Function:', window.initSMSAuth);

// Check for existing session
console.log('Current Session:', localStorage.getItem('sf_user_session'));
```

### 2. Force the SMS modal to appear
```javascript
// Clear any existing session and show modal
localStorage.removeItem('sf_user_session');
if (window.initSMSAuth) {
    window.initSMSAuth();
} else {
    console.error('initSMSAuth not found!');
}
```

### 3. Use the test function (if using improved version)
```javascript
// This is available if using sms-auth-IMPROVED.js
window.testSMSModal();
```

---

## Common Issues & Solutions

### Issue 1: Modal doesn't appear
**Check:**
1. Is there an existing session? Run: `localStorage.getItem('sf_user_session')`
2. Are scripts loaded? Check Network tab in DevTools
3. Is the modal element present? Run: `document.getElementById('sms-modal')`

**Fix:**
```javascript
localStorage.clear();
location.reload();
```

### Issue 2: "SFSMS is not defined" error
**Cause:** The sms.js script didn't load before sms-auth.js

**Fix:** Check script load order in index.html:
```html
<!-- This order matters! -->
<script src="/js/sms.js"></script>          <!-- Load FIRST -->
<script src="/js/sms-auth.js"></script>     <!-- Load SECOND -->
```

### Issue 3: Functions return 404
**Cause:** Netlify functions aren't deployed

**Fix:**
```bash
cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com
netlify deploy --prod
```

### Issue 4: "Failed to send SMS" error
**Cause:** Missing Twilio environment variables

**Check function status:**
```javascript
fetch('/.netlify/functions/health')
  .then(r => r.json())
  .then(d => console.log('Health Check:', d));
```

**Fix:** Add these to Netlify dashboard (Site Settings → Environment Variables):
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN  
- TWILIO_VERIFY_SERVICE_SID

---

## Step-by-Step Testing Procedure

### Test 1: Verify Scripts Load
1. Open site
2. Open DevTools (F12) → Console tab
3. Look for these messages:
   ```
   📄 sms.js loaded
   🔐 Initializing SMS Auth...
   📱 Showing SMS modal...
   ```

### Test 2: Test Phone Input
1. Enter a phone number (e.g., your real number or +15555551234)
2. Click "Send Code"
3. Check console for messages
4. Should see: `✅ Verification sent`

### Test 3: Test Code Verification
1. Enter the 6-digit code from your SMS
2. Click "Verify Code"
3. Should see: `✅ Welcome to Sound Factory NYC!`
4. Modal should disappear after 1.5 seconds

### Test 4: Verify Session Persistence
1. Refresh the page
2. Modal should NOT appear (session exists)
3. Check: `localStorage.getItem('sf_user_session')`
4. Should return a JSON string with phone and timestamp

---

## Using the Improved Version

To use the enhanced `sms-auth-IMPROVED.js` file:

1. **Backup the original:**
   ```bash
   cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com/js
   cp sms-auth.js sms-auth-ORIGINAL.js
   ```

2. **Replace with improved version:**
   ```bash
   cp sms-auth-IMPROVED.js sms-auth.js
   ```

3. **Deploy:**
   ```bash
   cd ..
   netlify deploy --prod
   ```

### Benefits of Improved Version:
- ✅ Better error messages in console
- ✅ Validates all required elements exist
- ✅ Auto-formats phone numbers
- ✅ Shows demo codes in console (if applicable)
- ✅ Includes `testSMSModal()` helper function
- ✅ Better logging at each step

---

## Network Testing

### Check if functions are accessible:

```javascript
// Test health endpoint
fetch('/.netlify/functions/health')
  .then(r => r.json())
  .then(d => console.log('✅ Functions working:', d))
  .catch(e => console.error('❌ Functions error:', e));

// Test SMS sending (will actually send!)
fetch('/.netlify/functions/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '+15555551234' })
})
  .then(r => r.json())
  .then(d => console.log('SMS Response:', d))
  .catch(e => console.error('SMS Error:', e));
```

---

## Expected Console Output (Success)

When everything works correctly, you should see:

```
📄 sms-auth.js loaded. Call testSMSModal() to manually trigger the modal.
✅ SFSMS configured
🔐 Initializing SMS Auth...
📱 Showing SMS modal...
✅ SMS Auth initialized successfully

[User enters phone and clicks Send]
📱 Sending verification to: +15555551234
✅ Verification sent: {success: true, ...}

[User enters code and clicks Verify]
🔐 Verifying code...
✅ Verification successful: {success: true, ...}
✅ SMS Auth complete, modal closed
```

---

## Troubleshooting Decision Tree

```
Modal not showing?
├─ Is there a session? → Yes → Clear it with localStorage.clear()
├─ Is SFSMS undefined? → Yes → Check script load order
└─ Check browser console → Errors? → Fix those first

SMS won't send?
├─ 404 error? → Functions not deployed
├─ 500 error? → Check function logs in Netlify
└─ "Failed to send" → Check Twilio credentials

Can't verify code?
├─ Wrong code? → Get new code
├─ Expired? → Request new code
└─ Error in console? → Check function logs
```

---

## Environment Variable Checklist

Make sure these are set in Netlify:

- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_VERIFY_SERVICE_SID
- [ ] SUPABASE_URL (already in netlify.toml)
- [ ] SUPABASE_ANON_KEY (already in netlify.toml)
- [ ] SUPABASE_SERVICE_KEY

---

## Quick Fixes

### Force modal to show right now:
```javascript
localStorage.clear();
document.getElementById('sms-modal').classList.add('active');
```

### Skip SMS and create fake session:
```javascript
localStorage.setItem('sf_user_session', JSON.stringify({
  phone: '+15555551234',
  verified: true,
  timestamp: Date.now()
}));
location.reload();
```

### Reset everything:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## Need More Help?

1. Check the FIX_INSTRUCTIONS.md file
2. Review Netlify function logs
3. Check Netlify deploy logs
4. Verify domain DNS settings

## Test URLs to Check

- Main site health: `https://séance.soundfactorynyc.com/.netlify/functions/health`
- Check if deployed: `https://séance.soundfactorynyc.com/js/sms.js`
- Check modal CSS: `https://séance.soundfactorynyc.com/css/components.css`
