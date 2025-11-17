#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     PUSHING GITHUB ACTIONS WORKFLOW TO DEPLOY WORKERS         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Add the GitHub Actions files
echo "📦 Adding GitHub Actions workflow files..."
git add .github/

echo ""
echo "📝 Creating commit..."
git commit -m "Add GitHub Actions for Cloudflare Workers deployment"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT TRIGGERED!                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "✨ Your Cloudflare Workers are being deployed!"
echo ""
echo "📊 Watch progress at:"
echo "   → https://github.com/soundfactorynyc/SFCHAT4/actions"
echo ""
echo "🎯 Workers being deployed:"
echo "   ✓ soundfactory-sponsorship-api"
echo "   ✓ soundfactory-memory-api"
echo "   ✓ us-nucleus"
echo ""
echo "════════════════════════════════════════════════════════════════"
