#!/bin/bash

echo "🚀 Sound Factory Promoters Deployment"
echo "======================================"
echo ""

# Install dependencies if needed
if [ ! -d "netlify/functions/node_modules" ]; then
  echo "📦 Installing function dependencies..."
  cd netlify/functions
  npm install
  cd ../..
fi

# Deploy to Netlify
echo ""
echo "🌐 Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your promoter system is live!"
