# 🔧 SMS Modal Not Showing - Debug & Fix

## Problem
The SMS modal exists in the code but isn't appearing as a popup.

## Most Likely Cause
**You have a session stored in localStorage that's blocking the modal from showing!**

The code checks for an existing session first:
```javascript
const session = localStorage.getItem('sf_user_session');
if (session) {
    console.log('✅ User authenticated:', userData.phone);
    return; // ← This stops the modal from showing!
}
```

## 🧪 Test Page Created

I've created a test page to diagnose the issue:

**File:** `/sms-test.html`

### How to Use Test Page:

1. **Deploy first:**
   ```bash
   cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com
   netlify deploy --prod
   ```

2. **Visit test page:**
   ```
   https://seance.soundfactorynyc.com/sms-test.html
   ```

3. **The test page will show:**
   - ✅ Whether a session exists (blocking modal)
   - ✅ Whether modal is active
   - ✅ CSS status
   - ✅ Library status

4. **Click "Clear Session & Show Modal"** to test

---

## Quick Fixes

### Fix 1: Clear Session in Browser Console

1. Open your site: https://seance.soundfactorynyc.com
2. Press **F12** to open console
3. Run this:
   ```javascript
   localStorage.removeItem('sf_user_session');
   location.reload();
   ```
4. Modal should appear!

### Fix 2: Use Incognito/Private Window

Open the site in an incognito/private window - no session will exist, so modal will show.

### Fix 3: Test with the Test Page

After deploying, visit `/sms-test.html` to see exactly what's preventing the modal from showing.

---

## Deploy Command

```bash
cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com
netlify deploy --prod
```

This will deploy:
- ✅ SMS modal CSS
- ✅ SMS modal JavaScript
- ✅ Test page (sms-test.html)
- ✅ Promoters directory
- ✅ Logo API

---

## After Deployment

### Step 1: Visit Main Site
```
https://seance.soundfactorynyc.com
```

**If modal doesn't show:** There's probably a session. Clear it:
```javascript
localStorage.clear();
location.reload();
```

### Step 2: Visit Test Page
```
https://seance.soundfactorynyc.com/sms-test.html
```

This will tell you EXACTLY what's wrong:
- Is there a session?
- Is the modal element present?
- Is the CSS loaded?
- Is the modal active?

### Step 3: Force Show Modal
On the test page, click **"Clear Session & Show Modal"**

---

## Expected Behavior

**Without Session:**
- ✅ Modal appears automatically on page load
- ✅ Shows phone input form
- ✅ User can enter phone and get SMS code

**With Session:**
- ❌ Modal doesn't appear (user already logged in)
- ✅ User can use site normally

---

## Debug Commands

Run these in browser console (F12):

```javascript
// Check if session exists
console.log('Session:', localStorage.getItem('sf_user_session'));

// Check if modal element exists
console.log('Modal:', document.getElementById('sms-modal'));

// Check if active class is present
const modal = document.getElementById('sms-modal');
console.log('Has Active:', modal?.classList.contains('active'));

// Force show modal
if (modal) {
    localStorage.clear();
    modal.classList.add('active');
}

// Check if SFSMS library loaded
console.log('SFSMS:', window.SFSMS);

// Check if init function exists
console.log('initSMSAuth:', window.initSMSAuth);
```

---

## Common Issues

### Issue 1: "I cleared session but modal still doesn't show"
**Solution:** Deploy first! The CSS file isn't on the live site yet.

### Issue 2: "Modal shows but form doesn't work"
**Solution:** Check environment variables in Netlify:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_VERIFY_SERVICE_SID

### Issue 3: "Nothing happens when I click Send Code"
**Solution:** Check browser console for errors. Likely missing SFSMS library or functions not deployed.

---

## Files You Need to Deploy

All these exist locally and need to be deployed:

1. ✅ `/css/sms-modal.css` - Modal styles
2. ✅ `/index.html` - Updated with CSS link
3. ✅ `/js/sms-auth.js` - Authentication logic  
4. ✅ `/js/sms.js` - SMS library
5. ✅ `/sms-test.html` - Test page (NEW!)
6. ✅ `/promoters/` - Promoters directory
7. ✅ `netlify.toml` - Updated with redirects

---

## Deploy Now! 🚀

```bash
cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com
netlify deploy --prod
```

Then test:
1. Main site (clear session first)
2. Test page at /sms-test.html

The test page will tell you EXACTLY what's wrong! 🎯
