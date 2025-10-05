# Sound Factory NYC - Modularized Structure

## Overview
This is the modularized version of the Sound Factory NYC web application. The original monolithic `index.html` file (4,692 lines, 206KB) has been broken down into maintainable, organized modules.

## File Reduction
- **Original**: index.html = 4,692 lines (206KB)
- **New**: index.html = 281 lines (14.2KB)
- **Reduction**: 94% smaller

## Project Structure

```
soundfactory-nyc/
├── index.html                 # Main entry point (281 lines)
├── css/
│   ├── blueprint-theme.css    # Blueprint background aesthetic (81 lines)
│   └── components.css         # UI component styles (957 lines)
├── js/
│   ├── config.js              # Environment configuration
│   ├── supabase-client.js     # Supabase initialization
│   ├── sms-auth.js            # SMS authentication flow
│   ├── sms.js                 # SMS API wrapper
│   ├── stripe-integration.js  # Stripe payments & tables
│   ├── live-stream.js         # Backend-controlled live stream
│   ├── pins.js                # Robust pin system (33KB)
│   ├── chat.js                # Chat functionality
│   └── main.js                # App initialization & orchestration
├── config/
│   └── netlify-env-inject.js  # Environment variable placeholders
├── netlify/
│   └── functions/
│       ├── send-sms.js        # Twilio SMS sending
│       ├── verify-sms.js      # SMS code verification
│       ├── create-table-checkout.js  # Table reservation checkout
│       ├── stripe-webhook.js  # Stripe webhook handler
│       ├── health.js          # Health check endpoint
│       └── package.json       # Function dependencies
├── netlify.toml               # Netlify configuration
├── build.sh                   # Build script (injects env vars)
└── README.md                  # This file
```

## Key Features Preserved

### 1. Blueprint Background Aesthetic
The signature blueprint background and visual identity has been preserved exactly as it was in the original. All styles are in `css/blueprint-theme.css`.

### 2. SMS Authentication
- Two-step verification using Twilio
- Session management with localStorage
- Admin phone numbers: +19082550185, +19143848734, +19293629534, +19084134836
- Emergency PIN: 911911

### 3. Stripe Integration
- Ticket purchases
- Table reservations ($1,200-$2,400)
- Bottle service
- Gift options (drinks, tickets, table invites)

### 4. Backend-Controlled Live Stream
- Uses HLS.js for streaming
- Only displays when admin sets stream to live
- Real-time control via Supabase channels

### 5. Interactive Pin System
- Robust error handling
- Rate limiting
- Image optimization
- Offline queue support
- Multiple pin types (memories, reactions, tips, etc.)

### 6. Chat Functionality
- Group chat
- Bottom chat bar with visual effects
- Real-time messaging

## Environment Variables

The following environment variables are required and injected during build:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_TABLE=price_...
SF_PRESENCE_ENABLED=true

# Twilio (for Netlify functions)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_SERVICE_SID=VA...

# Stripe Secret (for webhooks)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Build & Deployment

### Local Testing
```bash
# The app is static HTML/JS, just open index.html
# Or use a local server:
python -m http.server 8000
# Visit http://localhost:8000
```

### Deploy to Netlify

1. **Set Environment Variables** in Netlify dashboard under Site Settings → Environment Variables

2. **Deploy**:
   ```bash
   # Netlify will automatically run build.sh
   git push origin main
   ```

3. **The build process**:
   - Injects environment variables into `config/netlify-env-inject.js`
   - Installs Netlify function dependencies
   - Verifies critical files exist
   - Ready for deployment

### Deployment Target
- **Production**: seance.soundfactorynyc.com
- **Stripe Tickets**: tickets.soundfactorynyc.net

## Module Dependencies

Load order is critical. The HTML loads scripts in this order:

1. External libraries (HLS.js, Stripe, Supabase)
2. `config/netlify-env-inject.js` (environment variables)
3. `js/config.js` (configuration)
4. `js/sms.js` (SMS API wrapper)
5. `js/supabase-client.js` (Supabase client)
6. `js/sms-auth.js` (authentication)
7. `js/stripe-integration.js` (payments)
8. `js/live-stream.js` (streaming)
9. `js/pins.js` (pin system)
10. `js/chat.js` (chat)
11. `js/main.js` (initialization)

## API Endpoints

Netlify Functions are available at:
- `/.netlify/functions/send-sms` (also `/api/send-verification`)
- `/.netlify/functions/verify-sms` (also `/api/verify-code`)
- `/.netlify/functions/create-table-checkout`
- `/.netlify/functions/stripe-webhook`
- `/.netlify/functions/health`

## Security Features

- XSS protection with input sanitization
- CSRF token validation
- Rate limiting on pin actions
- Session timeout management
- Content Security Policy headers
- HTTPS enforcement

## Future Sessions

This modularization session focused on breaking up the large index.html file. Future sessions will handle:
- Admin panel integration
- Promoter system with configurable commission rates
- Table reservation system integration
- Full Stripe Connect for promoter payouts
- Enhanced live stream controls

## Notes

- The original index.html is preserved in attachments
- All functionality has been maintained
- Blueprint aesthetic is unchanged
- File sizes now well under Netlify limits
- Session management uses localStorage
- Admin features require phone verification

## Troubleshooting

**Environment variables not working?**
- Check that Netlify environment variables are set
- Verify build.sh ran successfully
- Check browser console for CONFIG object

**SMS not working?**
- Verify Twilio credentials in Netlify
- Check function logs in Netlify dashboard
- Ensure phone numbers are E.164 format

**Stripe checkout failing?**
- Verify STRIPE_PUBLISHABLE_KEY is set
- Check Stripe dashboard for errors
- Ensure price IDs are correct

**Live stream not showing?**
- Stream only shows when backend sets isLive=true
- Check Supabase real-time is enabled
- Verify stream URL is valid

## Support

For issues or questions, contact the development team.

Built with ❤️ for Sound Factory NYC 🎵
