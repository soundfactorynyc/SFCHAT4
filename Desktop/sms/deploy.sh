#!/bin/bash

echo "🚀 Sound Factory SMS Deployment Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found. Are you in the right directory?"
    echo "   Please cd to /Users/jpwesite/Desktop/sms"
    exit 1
fi

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if already logged in to Netlify
echo ""
echo "🔐 Checking Netlify login..."
if ! netlify status &> /dev/null; then
    echo "Please login to Netlify:"
    netlify login
fi

# Initialize or link site
echo ""
echo "🔗 Linking to Netlify site..."
if [ ! -d ".netlify" ] || [ ! -f ".netlify/state.json" ]; then
    echo "Choose option to create new site or link to existing:"
    netlify init
else
    echo "✅ Already linked to Netlify site"
fi

# Deploy
echo ""
echo "🚀 Deploying to production..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Netlify Dashboard → Site settings → Environment variables"
echo "2. Add these environment variables:"
echo "   - TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN"  
echo "   - TWILIO_VERIFY_SID"
echo "   - ALLOWED_ORIGINS (include your domain)"
echo "   - DEFAULT_COUNTRY=US"
echo "   - JWT_SECRET (generate random)"
echo "   - ADMIN_KEY (generate random)"
echo ""
echo "3. Test at: https://YOUR-SITE.netlify.app/widget/"
echo "4. Configure Twilio to use (646) 466-4925"
