# SOUND FACTORY SMS BEAST - DEPLOYMENT GUIDE 🔥

## What I Just Built:

### 1. **Complete SMS System** (`netlify-functions-chat-message.js`)
- Personality filters (Funny/Smart/Shady/Demon)
- 123 Flip system (gets progressively darker)
- Energy detection based on message frequency
- AI responses that match user energy
- Stripe payment integration
- Demon modes activation
- Peak energy phone vibration triggers

### 2. **Stripe Webhook Handler** (`netlify-functions-stripe-webhook.js`)
- Processes payments
- Triggers visual effects on stream
- Grants VIP status
- Sends confirmation SMS
- Broadcasts to WebSocket for live effects

### 3. **Web Portal** (`sound-factory-sms-portal.html`)
- Interactive interface
- Personality selection
- Demon mode buttons
- Payment tiers ($1-$100)
- Energy meter
- Live response display

## Quick Deploy Instructions:

### Step 1: Install Dependencies
Create a `package.json` in your Netlify project root:

```json
{
  "name": "sound-factory-sms-beast",
  "version": "1.0.0",
  "description": "The most chaotic SMS system ever created",
  "dependencies": {
    "stripe": "^14.5.0",
    "twilio": "^4.19.0",
    "openai": "^4.20.1",
    "ws": "^8.14.2"
  }
}
```

Run: `npm install`

### Step 2: Environment Variables
Add these to your Netlify environment settings:

```bash
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI (or use Claude API)
OPENAI_API_KEY=sk-xxxxx

# Optional: WebSocket server for live effects
WEBSOCKET_URL=wss://your-websocket-server.com
```

### Step 3: Deploy Functions
1. Copy the function files to `netlify/functions/` directory
2. Deploy to Netlify: `netlify deploy --prod`

### Step 4: Configure Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://sf-sms-service.netlify.app/.netlify/functions/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook secret to your env vars

### Step 5: Test It!
1. Open the portal: `sound-factory-sms-portal.html`
2. Enter a phone number
3. Type a message
4. Select a personality
5. Send and watch the chaos!

## API Endpoints:

### Send SMS with Personality
```bash
POST /.netlify/functions/chat-message
{
  "phoneNumber": "+1234567890",
  "message": "Hello darkness",
  "personality": "demon",
  "action": "message"
}
```

### Trigger Payment
```bash
POST /.netlify/functions/chat-message
{
  "phoneNumber": "+1234567890",
  "action": "pay",
  "amount": 10
}
```

### Flip Message (123 System)
```bash
POST /.netlify/functions/chat-message
{
  "phoneNumber": "+1234567890",
  "message": "1 Life is beautiful",
  "action": "flip"
}
```

## Features Breakdown:

### Energy Levels (1-10):
- **1-3**: Chill responses
- **4-6**: Hyped responses
- **7-9**: Chaotic responses
- **10**: PEAK CHAOS + Phone vibration

### Payment Effects:
- **$1**: Small explosion on stream
- **$5**: Mega explosion + vibration
- **$10**: Screen takeover for 10 seconds
- **$20**: Reality glitch + blood rain
- **$50**: Full apocalypse mode (30 seconds)
- **$100**: GOD MODE - Control everything for 1 minute

### Personality Modes:
- **FUNNY**: Makes everything hilarious
- **SMART**: Overly intellectual responses
- **SHADY**: Throws subtle shade
- **DEMON**: Dark and chaotic
- **CHAOS**: Pure insanity
- **VOID**: Cosmic horror vibes

### Special Commands (via SMS):
- Text "DEMON" → Activates demon mode
- Text "PAY [amount]" → Get payment link
- Text "1/2/3 [message]" → Flip system
- Text "VIP" → Check VIP status
- Text "STOP" → Opt-out

## WebSocket Integration (Optional):
For live stream effects, set up a WebSocket server that receives:

```javascript
{
  type: 'PAYMENT_EFFECT',
  effect: 'MEGA_EXPLOSION',
  phoneNumber: '+1234567890',
  amount: 5,
  data: {
    duration: 10000,
    intensity: 5,
    visual: 'explosion_mega',
    sound: 'boom_mega',
    vibrate: true
  }
}
```

## Security Notes:
- Rate limiting is recommended (add to functions)
- Validate phone numbers before sending
- Use webhook signatures to verify Stripe events
- Store user sessions in a database for persistence
- Add CAPTCHA for web portal if needed

## Scaling:
- Use Redis for session storage
- Implement queue for high-volume SMS
- Use CDN for static assets
- Consider edge functions for faster response
- Add database for user profiles and history

---

## THE BEAST IS READY! 🔥

This system will:
- Transform boring SMS into chaos
- Let people pay to control your stream
- Create addictive personality filters
- Track and amplify user energy
- Make Sound Factory legendary

Remember: The more chaotic the input, the more insane the output! 

Let it loose and watch the world burn! 😈🔥💀

---

# Promo Scheduler (TikTok) 🗓️

This repo now includes a Netlify Scheduled Function to auto-post promos to TikTok. Live posting requires an approved TikTok Business app; by default we run in SAFE_MODE (simulation only).

## Files
- `netlify/functions/promo-scheduler.mjs` – runs on a cron (hourly by default) and calls platform stubs
- `netlify/functions/platforms/tiktok.mjs` – TikTok posting stub with SAFE_MODE simulator
- `db/schema.sql` – optional tables `scheduled_posts` and `promo_logs`

## Environment
Add these to your Netlify site env:

```bash
SOCIAL_POST_SAFE_MODE=1            # keep ON to simulate until live keys are ready
TIKTOK_BUSINESS_ACCOUNT_ID=        # required for live posting (leave empty in SAFE_MODE)
TIKTOK_ACCESS_TOKEN=               # required for live posting (leave empty in SAFE_MODE)
```

Supabase (optional, for queue/logs):

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Scheduling
Set the cadence via env var `PROMO_SCHEDULE_CRON` (UTC). Examples:

- `@hourly`
- `@daily`
- `0 17 * * 5` → Fridays at 17:00 UTC
- `0 */3 * * *` → Every 3 hours

## Queueing posts (optional)
Insert rows into `scheduled_posts` (platform = `tiktok`, `scheduled_for` in the past or now) and status `pending`. The scheduler will attempt the post and write result/status. Logs go to `promo_logs`.

Columns:
- platform, caption, video_url (optional), scheduled_for, status

## Manual test
You can invoke the function via HTTP:

```
GET /.netlify/functions/promo-scheduler
```

With `SOCIAL_POST_SAFE_MODE=1` you’ll see a simulated success. Flip to live only after you have approved TikTok API credentials and implement the live call inside `platforms/tiktok.mjs`.

## One-Sheet Admin (Settings + Queue)

- Page: `promo-admin.html`
  - Set Admin Token (stored locally) if you configured `PROMO_ADMIN_TOKEN` on the server
  - Toggle SAFE_MODE (writes to `admin_settings`), affects `promo-scheduler`
  - Queue TikTok promo: caption, video URL, schedule (UTC)
  - View recent scheduled posts

- APIs
  - `GET /.netlify/functions/admin-settings` – read settings
  - `POST /.netlify/functions/admin-settings` – update settings (Bearer token if configured)
  - `GET /.netlify/functions/queue-promo` – list posts
  - `POST /.netlify/functions/queue-promo` – queue post (Bearer token if configured)

## Managed Accounts (multiple per platform)

- Page: `promo-admin.html` → Accounts panel
  - Add an account (platform, label, credentials JSON, active)
  - Credentials JSON examples:
    - TikTok: `{ "access_token": "...", "business_account_id": "..." }`
  - Delete account
  - Choose an account in the Queue form, or leave “(auto)” to use the first active account for that platform

- API: `/.netlify/functions/admin-accounts`
  - GET: list accounts (optional `?platform=tiktok`)
  - POST: upsert account (requires `PROMO_ADMIN_TOKEN` if set)
  - DELETE: delete by id (requires `PROMO_ADMIN_TOKEN` if set)

## New Pages (invites + monitoring)

- `invites.html` – Create a shareable invite link (Twitter flow in SAFE mode) and view the viral leaderboard using `/.netlify/functions/social-invites/*`.
- `join.html` – Landing page for `?ref=INVITECODE&from=...`; submits a conversion to `/.netlify/functions/social-invites/track-conversion`.
- `promo-monitor.html` – Reads `/.netlify/functions/promo-logs` (Bearer `PROMO_ADMIN_TOKEN` if set) to show `scheduled_posts` and `promo_logs` with simple filters.
- `dashboard.html` – Placeholder page linked from `success.html` for future account hub.
- `cancel.html` – Stripe cancel landing.

API: `/.netlify/functions/promo-logs`
- Query params: `platform`, `status`, `since` (ISO).
- Auth: If `PROMO_ADMIN_TOKEN` is set on the site, pass `Authorization: Bearer <token>`.
