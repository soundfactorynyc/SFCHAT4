# Sound Factory Promoters System

## 🎉 Clean Promoter Folder - October 11, 2025

This is the consolidated, up-to-date promoter system with all latest features.

### ✨ What's Included

#### Frontend Pages (`/public`)
- **promoter-signup.html** - Updated signup page with AI flyer customization
- **promoter-login.html** - Promoter authentication
- **promoter-dashboard.html** - Promoter control panel
- **team-tickets-tables.html** - Shareable ticket/table sales page
- **admin-approvals.html** - Admin panel for approving promoters
- **admin-flyer-approvals.html** - Admin panel for approving custom flyers
- **index.html** - Landing page

#### Backend Functions (`/netlify/functions`)
- **create-promoter.js** - Create new promoter with Stripe Connect (updated with flyer_request support)
- **get-promoter.js** - Retrieve promoter data
- **purchase-ticket.js** - Handle ticket purchases with affiliate tracking
- **stripe-webhook.js** - Process Stripe events
- **ai-flyer-chat.js** - AI-powered flyer customization assistant (Claude API)
- **send-sms-code.js** - Send SMS verification codes
- **verify-sms-code.js** - Verify SMS codes
- **validate-session.js** - Session validation

#### Assets
- **sf-logo.png** - Sound Factory logo (148KB)
- **sf-flyer-optimized.png** - Optimized Halloween flyer (4.4MB, down from 21MB)

#### Configuration
- **netlify.toml** - Netlify deployment configuration with API redirects
- **.env** - Environment variables (Stripe, Supabase, Anthropic AI)
- **package.json** - Root and function dependencies

### 🚀 Features

1. **AI Flyer Customization**
   - Promoters can request custom flyers during signup
   - AI assistant helps collect customization details
   - Stored in `flyer_request` field in database
   - Admin can review and approve custom flyers

2. **Stripe Connect Integration**
   - Automatic Stripe Connect account creation
   - Direct payouts to promoters
   - Secure onboarding flow

3. **Affiliate Tracking**
   - Unique promo codes per promoter
   - Track ticket and table sales
   - Commission tracking

4. **Admin Approval Workflow**
   - New promoters start with "pending" status
   - Admin must approve before promoter can access dashboard
   - Admin can review flyer customization requests

### 📦 Deployment

```bash
cd /Users/jpwesite/Desktop/SF/promoters-new
netlify deploy --prod
```

### 🔧 Environment Variables Required

See `.env` file for all required variables:
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- ANTHROPIC_API_KEY (for AI flyer assistant)
- ADMIN_USERNAME
- ADMIN_PASSWORD
- JWT_SECRET

### 📝 Database Schema

The `promoters` table needs:
- `flyer_request` TEXT field for AI customization requests
- `status` TEXT field (pending/approved/suspended)
- Standard fields: name, email, phone, stripe_account_id, promo_code

### 🎨 Recent Updates (Oct 11, 2025)

- ✅ Optimized flyer image from 21MB to 4.4MB
- ✅ Added AI customization feature to signup
- ✅ Updated messaging to emphasize design quality
- ✅ Removed preview navigation bar
- ✅ Added `customizeFlyerWithAI()` function
- ✅ Updated backend to save flyer_request
- ✅ Fixed logo path (removed leading slash)
- ✅ All images loading correctly

---

**Note:** This replaces the old promoter folders. All files are current and tested.
