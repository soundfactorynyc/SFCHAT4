# Quick Setup Guide for GitHub Actions Deployment

## Step-by-Step Setup (5 minutes)

### Step 1: Get Your Cloudflare API Token
```bash
# Open this URL in your browser:
open https://dash.cloudflare.com/profile/api-tokens
```

1. Click **"Create Token"**
2. Use **"Edit Cloudflare Workers"** template
3. Or create custom token with:
   - **Permissions**:
     - Account → Cloudflare Workers Scripts → Edit
     - Account → D1 → Edit
   - **Account Resources**: Include → Your account
4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token** (you won't see it again!)

### Step 2: Add Token to GitHub

```bash
# Open your repository settings:
# Replace YOUR_USERNAME and YOUR_REPO with your details
open https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

1. Click **"New repository secret"**
2. Name: `CLOUDFLARE_API_TOKEN`
3. Value: Paste the token from Step 1
4. Click **"Add secret"**

### Step 3: Get Your Account ID (Optional)

```bash
# Open Cloudflare dashboard:
open https://dash.cloudflare.com/
```

1. Copy your **Account ID** from the right sidebar
2. Add to each `wrangler.toml` file:

**sponsorship-api/wrangler.toml**
```toml
account_id = "your-account-id-here"
name = "soundfactory-sponsorship-api"
# ... rest of file
```

**membership-party-automation/wrangler.toml**
```toml
account_id = "your-account-id-here"
name = "soundfactory-memory-api"
# ... rest of file
```

**US/wrangler.toml**
```toml
account_id = "your-account-id-here"
name = "us-nucleus"
# ... rest of file
```

### Step 4: Push to GitHub

```bash
# Add the GitHub Actions workflow
git add .github/

# Commit the changes
git commit -m "Add GitHub Actions for Cloudflare Workers deployment"

# Push to main branch (triggers deployment)
git push origin main
```

### Step 5: Verify Deployment

```bash
# Open GitHub Actions page:
# Replace YOUR_USERNAME and YOUR_REPO
open https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

You should see the "Deploy Cloudflare Workers" workflow running!

## Testing Manual Deployment

Once setup is complete, you can trigger deployments manually:

1. Go to **Actions** tab
2. Click **"Deploy Cloudflare Workers"**
3. Click **"Run workflow"**
4. Select branch → **"Run workflow"**

## What Happens Next?

Every time you push changes to:
- `sponsorship-api/` → Deploys Sponsorship API
- `membership-party-automation/` → Deploys Membership Automation
- `US/` → Deploys US Nucleus

All three deploy in parallel!

## Troubleshooting

### "No workflows found"
- Make sure `.github/workflows/deploy-workers.yml` exists
- Push the workflow file to GitHub

### "Authentication failed"
- Regenerate your Cloudflare API token
- Update the GitHub secret
- Make sure token has correct permissions

### "Worker not found"
- Check `wrangler.toml` name matches your Cloudflare worker
- Or remove the name and let Wrangler create it

## Need Help?

Check the detailed README:
```bash
cat .github/workflows/README.md
```

Or visit:
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Action](https://github.com/cloudflare/wrangler-action)
