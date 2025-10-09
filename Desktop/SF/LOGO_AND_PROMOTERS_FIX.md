# 🔧 Logo API & Promoters Path - FIXES

## Issue 1: Logo API Not Working ❌

**Problem:** The logo is not loading from `https://seance.soundfactorynyc.com/api/logo?size=256`

**Root Causes:**
1. The logo function exists (`logo.mjs`) ✅
2. The logo asset exists (`logo-icon.svg`) ✅
3. BUT the function might not be deployed or the redirect might be missing

---

## Issue 2: Promoters Path Not Set Up ❌

**Problem:** You want promoters accessible at `/promoters` path

**Current State:** Promoters content is in a separate folder with colon in name

---

## 🚀 COMPLETE FIX

### Step 1: Verify Logo API Redirect in netlify.toml

Check if this redirect exists in your `netlify.toml`:

```toml
[[redirects]]
  from = "/api/logo"
  to = "/.netlify/functions/logo"
  status = 200
  force = true
```

### Step 2: Set Up Promoters Directory Structure

```bash
cd /Users/jpwesite/Desktop/SF/seance.soundfactorynyc.com

# Create promoters directory if it doesn't exist
mkdir -p promoters

# Copy content from the promoters folder
cp -r ../seance.soundfactorynyc.com:promoters/public/* ./promoters/
```

### Step 3: Update netlify.toml with Promoters Redirects

Add these redirects to handle `/promoters` path (I'll do this for you):

---

## 📝 Files Being Updated

1. ✅ `netlify.toml` - Add promoters redirects
2. ✅ Create `/promoters` directory structure
3. ✅ Verify logo API redirect exists

Let me do this now...
