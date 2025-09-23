#!/bin/bash

# Open project in Finder
echo "📂 Opening SMS project in Finder..."
open /Users/jpwesite/Desktop/sms

# Open Netlify Dashboard
echo "🌐 Opening Netlify Dashboard..."
open "https://app.netlify.com"

# Open Twilio Console
echo "📱 Opening Twilio Console..."
open "https://console.twilio.com"

echo ""
echo "✅ All windows opened!"
echo ""
echo "Quick Deploy Steps:"
echo "1. In Terminal, run: cd /Users/jpwesite/Desktop/sms && ./deploy.sh"
echo "2. In Netlify Dashboard: Add environment variables"
echo "3. In Twilio Console: Configure (646) number"
