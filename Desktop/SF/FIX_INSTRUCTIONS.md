# 🔧 Sound Factory NYC - Fix Instructions

## Issues Identified

### 1. SMS Modal Not Showing on Page Load
**Problem**: The SMS authentication modal should appear when users first visit the site, but it's not displaying.

**Root Causes**:
- Environment variables may not be set in Netlify
- SMS initialization might be failing silently
- Script load order could be incorrect

### 2. Domain/Path Configuration
**Problem**: You have two folders that need different deployment configurations:
- `seance.soundfactorynyc.com` → Main site (séance.soundfactorynyc.com)
- `seance.soundfactorynyc.com:promoters` → Promoters portal (séance.soundfactorynyc.com/promoters)

---

## 🔧 FIXES

### Fix 1: Ensure SMS Modal Shows on Load

#### Step 1: Check Environment Variables in Netlify
Go to each Netlify site dashboard and verify these variables are set:

**For Main Site (seance.soundfactorynyc.com)**:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
SUPABASE_URL=https://axhsljfsrfkrpdtbgdpv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI... (already in netlify.toml)
SUPABASE_SERVICE_KEY=your_service_role_key
```

#### Step 2: Test SMS Modal Locally
The code checks for an existing session in localStorage. To test the modal:

Open browser console (F12) and run:
```javascript
localStorage.removeItem('sf_user_session');
location.reload();
```

This will clear any existing session and force the SMS modal to appear.

#### Step 3: Add Better Error Handling

Update `/js/sms-auth.js` to show errors more clearly. I'll create the fixed version for you.

---

### Fix 2: Correct Domain Routing Setup

#### Current Setup Issues:
1. Folder name `seance.soundfactorynyc.com:promoters` has a colon which is invalid
2. These should be separate Netlify sites OR one site with proper routing

#### Recommended Solution: Two Separate Netlify Sites

**Option A: Deploy as Separate Sites (RECOMMENDED)**
- Main site: `séance.soundfactorynyc.com` (from folder `seance.soundfactorynyc.com`)
- Promoters: `séance.soundfactorynyc.com/promoters` (from folder `seance.soundfactorynyc.com:promoters`)

**Option B: Combine into One Site**
- Move promoters content into main site under `/promoters/` path

---

## 🚀 QUICK FIX STEPS

### For SMS Modal Issue:

1. **Check if SMS functions are deployed:**
   - Visit: `https://séance.soundfactorynyc.com/.netlify/functions/health`
   - Should return: `{"status":"healthy",...}`

2. **If functions aren't working:**
   ```bash
   cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com
   netlify deploy --prod
   ```

3. **Test SMS modal visibility:**
   - Open site in incognito/private window
   - Modal should appear immediately
   - If not, check browser console for errors (F12)

### For Domain/Path Issue:

**If you want promoters at `/promoters` path:**
1. Rename the folder to remove the colon:
   ```bash
   cd /Users/jpwesite/Desktop/SF
   mv "seance.soundfactorynyc.com:promoters" "promoters-portal"
   ```

2. Deploy promoters site separately OR integrate into main site

---

## 🔍 Debugging Checklist

- [ ] Environment variables set in Netlify dashboard
- [ ] Netlify functions deployed successfully
- [ ] Browser console shows no errors
- [ ] localStorage is empty (no existing session)
- [ ] Both sites deployed to correct domains
- [ ] DNS/domain settings configured in Netlify

---

## 📝 Files That Need Attention

### Main Site Files:
- `/js/sms-auth.js` - SMS authentication logic
- `/js/main.js` - Calls initSMSAuth()
- `/index.html` - Contains SMS modal HTML
- `netlify.toml` - Deployment configuration

### Promoters Site Files:
- `/public/index.html` - Redirects to tables.html
- `netlify.toml` - Should configure proper routing

---

## 🆘 If Still Not Working

Run these debugging commands in browser console:

```javascript
// Check if SMS library loaded
console.log('SFSMS:', window.SFSMS);

// Check if initSMSAuth exists
console.log('initSMSAuth:', window.initSMSAuth);

// Check for existing session
console.log('Session:', localStorage.getItem('sf_user_session'));

// Manually trigger SMS modal
if (window.initSMSAuth) {
    localStorage.removeItem('sf_user_session');
    window.initSMSAuth();
}
```

---

## 📞 Next Steps

1. Clear localStorage and test if modal appears
2. Check Netlify function logs for errors
3. Verify all environment variables are set
4. Decide on single vs. multiple site deployment strategy
5. Update domain/path routing accordingly

Let me know which part needs more detailed fixing!
