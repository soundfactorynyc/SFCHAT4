# Cloudflare Workers GitHub Actions Setup

This repository uses GitHub Actions to automatically deploy your Cloudflare Workers when you push to the main branch.

## Setup Instructions

### 1. Get Your Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template or create a custom token with these permissions:
   - Account > Cloudflare Workers Scripts > Edit
   - Account > D1 > Edit
4. Copy the generated API token

### 2. Add Secret to GitHub

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Value: Paste your Cloudflare API token
6. Click **Add secret**

### 3. Configure Account ID (Optional but Recommended)

If you want to explicitly set your Cloudflare Account ID in the wrangler.toml files:

1. Find your Account ID at https://dash.cloudflare.com/ (right sidebar)
2. Add it to each wrangler.toml file:

```toml
account_id = "your-account-id-here"
```

## What Gets Deployed

The workflow deploys three workers:
- **sponsorship-api** - Sponsorship API Worker
- **membership-party-automation** - Membership Party Automation Worker
- **US** - US Nucleus Worker (with cron triggers)

## Triggering Deployments

### Automatic Deployment
Deployments happen automatically when you push changes to:
- `sponsorship-api/` directory
- `membership-party-automation/` directory
- `US/` directory
- The workflow file itself

### Manual Deployment
You can also trigger deployments manually:
1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy Cloudflare Workers**
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Viewing Deployment Status

1. Go to the **Actions** tab in your repository
2. Click on any workflow run to see detailed logs
3. Each worker deploys in parallel as a separate job

## Troubleshooting

### Error: "Authentication error"
- Check that your `CLOUDFLARE_API_TOKEN` secret is set correctly
- Verify the token has the right permissions
- The token might have expired - generate a new one

### Error: "Could not find wrangler.toml"
- Make sure each directory has a `wrangler.toml` file
- Check the `workingDirectory` path in the workflow file

### Deployment succeeds but worker not updating
- Check your wrangler.toml `name` field matches your worker name in Cloudflare
- Verify you're deploying to the correct Cloudflare account

## Local Development

You can still deploy manually from your local machine:

```bash
cd sponsorship-api
npx wrangler deploy

cd ../membership-party-automation
npx wrangler deploy

cd ../US
npx wrangler deploy
```

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Wrangler Action GitHub](https://github.com/cloudflare/wrangler-action)
