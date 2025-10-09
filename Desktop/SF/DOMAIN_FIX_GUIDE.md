# 🌐 Domain & Deployment Structure Fix

## Current Situation

You have two folders:
1. **`seance.soundfactorynyc.com`** - Main site
2. **`seance.soundfactorynyc.com:promoters`** - Promoters portal (note the colon!)

## The Problem

The folder name `seance.soundfactorynyc.com:promoters` with a colon (`:`) is causing confusion because:
- Colons are typically used in URLs to separate protocol (https:) or port numbers
- This suggests you wanted different domains OR different paths
- The folder name should match your intended deployment structure

## What You Told Me

You said:
> "One folder is supposed to open up séance.soundfactorynyc.com and the other one's supposed to open as séance.soundfactorynyc.com/promoters"

This means you want:
- **Main site**: https://séance.soundfactorynyc.com
- **Promoters**: https://séance.soundfactorynyc.com/promoters

---

## ✅ RECOMMENDED SOLUTION: Single Site Deployment

Deploy everything as ONE Netlify site with proper routing.

### Step 1: Restructure Folders

```bash
cd /Users/jpwesite/Desktop/SF

# Create a unified project structure
mkdir soundfactory-unified
cd soundfactory-unified

# Copy main site files to root
cp -r ../seance.soundfactorynyc.com/* .

# Create promoters subdirectory
mkdir promoters
cp -r ../seance.soundfactorynyc.com:promoters/public/* ./promoters/
```

### Step 2: Update netlify.toml

Add these redirects to handle the `/promoters` path:

```toml
# Add to your netlify.toml

# Promoters section redirects
[[redirects]]
  from = "/promoters"
  to = "/promoters/index.html"
  status = 200

[[redirects]]
  from = "/promoters/*"
  to = "/promoters/:splat"
  status = 200

# Keep your existing redirects below this
```

### Step 3: Deploy

```bash
cd /Users/jpwesite/Desktop/SF/soundfactory-unified
netlify deploy --prod
```

---

## Alternative: Two Separate Netlify Sites (Not Recommended)

If you really need separate deployments:

### Site 1: Main Site
- Deploy from: `seance.soundfactorynyc.com` folder
- Domain: `séance.soundfactorynyc.com`
- Netlify site name: `soundfactory-main`

### Site 2: Promoters Site  
- Deploy from: `seance.soundfactorynyc.com:promoters` folder
- Path: Configure as subdomain OR use path redirect
- Netlify site name: `soundfactory-promoters`

Then in the main site's netlify.toml, add:

```toml
[[redirects]]
  from = "/promoters/*"
  to = "https://soundfactory-promoters.netlify.app/:splat"
  status = 200
  force = true
```

---

## 🎯 QUICK FIX (Easiest)

### Option A: Unified Site (5 minutes)

1. **Rename the promoters folder:**
   ```bash
   cd /Users/jpwesite/Desktop/SF
   mv "seance.soundfactorynyc.com:promoters" "seance-promoters-temp"
   ```

2. **Move promoters content into main site:**
   ```bash
   cd seance.soundfactorynyc.com
   mkdir -p promoters
   cp -r ../seance-promoters-temp/public/* ./promoters/
   ```

3. **Update netlify.toml** (add promoters redirect)

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

5. **Test:**
   - Main site: https://séance.soundfactorynyc.com
   - Promoters: https://séance.soundfactorynyc.com/promoters

---

## What Each Approach Gives You

### Single Site (Recommended) ✅
- ✅ One deployment
- ✅ Shared authentication
- ✅ Easier to manage
- ✅ No CORS issues
- ✅ Shared environment variables
- ✅ Same domain = better SEO

### Two Sites ❌
- ❌ Two deployments to manage
- ❌ Separate environment variables
- ❌ Potential CORS issues
- ❌ More complex authentication
- ❌ Two sets of functions

---

## File Structure Comparison

### Before (Current - Confusing):
```
SF/
├── seance.soundfactorynyc.com/
│   ├── index.html
│   ├── js/
│   └── netlify/
└── seance.soundfactorynyc.com:promoters/  ← Problematic name
    └── public/
```

### After (Single Site - Clear):
```
SF/
└── seance.soundfactorynyc.com/
    ├── index.html
    ├── js/
    ├── netlify/
    └── promoters/              ← Added subdirectory
        ├── index.html
        ├── tables.html
        └── ...
```

---

## Implementation Steps (Detailed)

### 1. Backup Everything First
```bash
cd /Users/jpwesite/Desktop/SF
cp -r seance.soundfactorynyc.com seance.soundfactorynyc.com.backup
cp -r seance.soundfactorynyc.com:promoters seance-promoters.backup
```

### 2. Create Promoters Directory
```bash
cd seance.soundfactorynyc.com
mkdir -p promoters
```

### 3. Copy Promoters Files
```bash
cp -r ../seance.soundfactorynyc.com:promoters/public/* ./promoters/
```

### 4. Update Main netlify.toml

Add after the existing redirects, before the final /* catch-all:

```toml
# Promoters section
[[redirects]]
  from = "/promoters"
  to = "/promoters/index.html"
  status = 200

[[redirects]]
  from = "/promoters/tables"
  to = "/promoters/tables.html"
  status = 200

[[redirects]]
  from = "/promoters/*"
  to = "/promoters/:splat"
  status = 200
```

### 5. Test Locally
```bash
netlify dev
```

Then visit:
- http://localhost:8888 (main site)
- http://localhost:8888/promoters (promoters portal)

### 6. Deploy
```bash
netlify deploy --prod
```

---

## Verification Checklist

After deployment, check:

- [ ] Main site loads: https://séance.soundfactorynyc.com
- [ ] Promoters loads: https://séance.soundfactorynyc.com/promoters
- [ ] SMS modal appears on main site
- [ ] Promoters redirects to tables.html correctly
- [ ] All JavaScript and CSS load properly
- [ ] No 404 errors in browser console
- [ ] Functions work (check Network tab)

---

## Troubleshooting

### Promoters page shows 404
**Fix:** Check netlify.toml redirects are in the right order (before the /* catch-all)

### Assets not loading on /promoters
**Fix:** Update asset paths in promoters HTML to be absolute:
```html
<!-- Change from: -->
<script src="/api/something"></script>

<!-- To: -->
<script src="/promoters/api/something"></script>
<!-- OR use absolute URLs -->
```

### Functions don't work in promoters
**Fix:** Use the same functions from main site, they're shared!

---

## Recommended Next Steps

1. ✅ **Use single site approach** (easiest and best)
2. ✅ **Move promoters content into /promoters subdirectory**
3. ✅ **Update netlify.toml with proper redirects**
4. ✅ **Deploy and test both paths**
5. ✅ **Clean up old confusing folder structure**

---

## Final Folder Structure Should Be:

```
SF/
├── seance.soundfactorynyc.com/          ← Main project
│   ├── index.html                       ← Main site
│   ├── css/
│   ├── js/
│   │   ├── sms.js
│   │   ├── sms-auth.js
│   │   └── main.js
│   ├── netlify/
│   │   └── functions/
│   ├── promoters/                       ← Promoters portal
│   │   ├── index.html
│   │   ├── tables.html
│   │   └── ...
│   └── netlify.toml
├── FIX_INSTRUCTIONS.md                  ← This file
├── TESTING_GUIDE.md
└── DOMAIN_FIX_GUIDE.md                  ← You are here
```

Want me to help you execute these changes?
