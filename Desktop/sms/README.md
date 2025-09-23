# Sound Factory SMS Authentication

## 🚀 Quick Deploy with Finder

### Option 1: Deploy Script (Easiest)

1. **Open Terminal** (Spotlight search: "Terminal")

2. **Navigate to project**:
   ```bash
   cd /Users/jpwesite/Desktop/sms
   ```

3. **Make script executable and run**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Deploy via Finder

1. **Open Terminal**

2. **Navigate to your project**:
   ```bash
   cd /Users/jpwesite/Desktop/sms
   ```

3. **Install and deploy**:
   ```bash
   npm install
   netlify login
   netlify init
   netlify deploy --prod
   ```

### Option 3: Drag & Drop Deploy

1. **Build the site** (if needed):
   ```bash
   cd /Users/jpwesite/Desktop/sms
   npm install
   ```

2. **Open Netlify Drop**: https://app.netlify.com/drop

3. **In Finder**:
   - Navigate to `/Users/jpwesite/Desktop/sms`
   - Select all files EXCEPT `.env` and `node_modules`
   - Drag to Netlify Drop page

## ⚙️ Environment Variables (Required!)

After deploying, go to **Netlify Dashboard → Site settings → Environment variables** and add:

### SMS Authentication (Required)
- `TWILIO_ACCOUNT_SID` = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- `TWILIO_AUTH_TOKEN` = (from Twilio console)
- `TWILIO_VERIFY_SID` = VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- `ALLOWED_ORIGINS` = https://seance.soundfactorynyc.com http://localhost:8888
- `DEFAULT_COUNTRY` = US
- `JWT_SECRET` = (generate strong random string)
- `ADMIN_KEY` = (generate strong random string)

### Stripe (Add Later)
- `STRIPE_SECRET_KEY` = sk_live_... or sk_test_...
- `PRICE_INITIATE` = price_...
- `PRICE_CIRCLE` = price_...
- `PRICE_POSSESSED` = price_...
- `PRICE_TABLE` = price_...

## 📱 Configure Twilio for (646) Number

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging → Services**
3. Create/select a service
4. In **Sender Pool**: Add `+16464664925` (remove others)
5. Go to **Verify → Services → Your Service → Messaging Configuration**
6. Link to the Messaging Service from step 3

## 🧪 Test Your Deployment

```bash
# Test health
curl https://YOUR-SITE.netlify.app/api/health

# Test SMS
curl -X POST https://YOUR-SITE.netlify.app/api/send-code \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+16464664925"}'
```

Or open: `https://YOUR-SITE.netlify.app/widget/`

## 🎨 Embed on Main Site

Add to your Sound Factory landing page:

```html
<!-- Only if SMS API is on different domain -->
<script>window.SMS_API_BASE = 'https://YOUR-SMS-SITE.netlify.app';</script>
<script src="https://YOUR-SMS-SITE.netlify.app/public/sf-sms-login.js" defer></script>

<!-- The widget -->
<section id="join-the-list">
  <h3>Want to get on the list? Verify your phone.</h3>
  <input data-sf-phone placeholder="+15551234567" />
  <button data-sf-send>Send Code</button>
  <input data-sf-code placeholder="123456" />
  <button data-sf-verify>Verify</button>
  <pre data-sf-out></pre>
</section>
```

## 📋 Final Checklist

- [ ] Environment variables added in Netlify
- [ ] Twilio configured for (646) 466-4925
- [ ] Remove "Admin" button from main site nav
- [ ] Update "Tickets" link to new checkout
- [ ] Embed SMS widget on landing page
- [ ] Add admin users: 
  - RonaldJAyala@outlook.com
  - jonathanpeters1@mac.com
  - morgangold@mac.com

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing Twilio env vars" | Add to Netlify environment variables |
| CORS blocked | Add your domain to ALLOWED_ORIGINS |
| Wrong phone number | Fix Twilio Messaging Service sender pool |
| 404 errors | Check netlify.toml configuration |

---

**Need help?** The full deployment playbook is in `README_FOR_CLAUDE.md`
