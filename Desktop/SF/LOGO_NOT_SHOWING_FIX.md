# 🔍 Logo Not Showing - Troubleshooting

## Problem
Logo HTML is in the file but not showing on live site after deployment.

## Quick Fixes

### Fix 1: Clear Browser Cache (Try This First!)
**Press:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

This does a "hard refresh" and clears the cache.

### Fix 2: Test in Incognito/Private Window
Open your site in a private/incognito window - this ensures no caching.

### Fix 3: Clear localStorage and Cache
1. Open browser console (F12)
2. Run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

---

## Test if Logo API is Working

Visit this URL directly in your browser:
```
https://seance.soundfactorynyc.com/api/logo?size=120&format=png
```

**Expected:** You should see your SF logo image  
**If 404:** Logo API function isn't deployed

---

## If Logo API Returns 404

The logo function needs Sharp package. Make sure it's installed:

```bash
cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com/netlify/functions
npm install sharp
cd ../..
netlify deploy --prod
```

---

## Alternative: Use Direct Logo Path

If the API doesn't work, use a direct path to your logo file:

Change this line in `index.html`:
```html
<!-- Change from: -->
<img src="/api/logo?size=120&format=png" alt="Sound Factory">

<!-- To: -->
<img src="/assets/logo-icon.svg" alt="Sound Factory" style="width: 120px; height: 120px;">
```

---

## Deploy Again with Cache Busting

```bash
cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com
netlify deploy --prod
```

Then visit with `?v=2` to bypass cache:
```
https://seance.soundfactorynyc.com?v=2
```

---

## Check Deployment Logs

In Netlify dashboard:
1. Go to **Deploys**
2. Click on latest deploy
3. Check if `/api/logo` redirect is working
4. Check if `assets/logo-icon.svg` was uploaded

---

## Quick Test Commands

Open browser console and run:

```javascript
// Test if logo loads
fetch('/api/logo?size=120')
  .then(r => console.log('Logo API:', r.status === 200 ? '✅ Working' : '❌ Error ' + r.status))
  .catch(e => console.log('❌ Logo API failed:', e));

// Test if asset exists
fetch('/assets/logo-icon.svg')
  .then(r => console.log('Logo asset:', r.status === 200 ? '✅ Exists' : '❌ Missing'))
  .catch(e => console.log('❌ Asset failed:', e));

// Check if modal has logo element
console.log('Logo element:', document.querySelector('.sms-logo') ? '✅ Found' : '❌ Missing');
```

---

## Most Likely Solution

**It's just browser cache!** Try:
1. Hard refresh: `Ctrl+Shift+R`
2. Or incognito window
3. Clear localStorage and reload

The logo IS in your HTML, so it should work after clearing cache! 🎯
