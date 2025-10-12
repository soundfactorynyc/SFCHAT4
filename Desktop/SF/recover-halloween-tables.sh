#!/bin/bash
# 🔒 Halloween Tables Recovery Script
# Use this if halloween-tables.html is accidentally deleted

set -e

echo "🔒 Halloween Tables Recovery Script"
echo "===================================="
echo ""

if [ -f "halloween-tables.html" ]; then
    echo "⚠️  WARNING: halloween-tables.html already exists!"
    echo "Do you want to restore from backup anyway? (yes/no)"
    read -r response
    if [ "$response" != "yes" ]; then
        echo "❌ Recovery cancelled."
        exit 0
    fi
fi

echo "📂 Restoring halloween-tables.html from backup..."
cp .backups/halloween/halloween-tables.html.backup halloween-tables.html

echo "✅ File restored successfully!"
echo ""
echo "🚀 Do you want to deploy to production now? (yes/no)"
read -r deploy_response

if [ "$deploy_response" = "yes" ]; then
    echo "📦 Deploying to production..."
    netlify deploy --prod
    echo ""
    echo "✅ DEPLOYED! Check your URLs:"
    echo "   1. https://seance.soundfactorynyc.com/halloween-tables.html"
    echo "   2. https://seance.soundfactorynyc.com/halloween"
    echo "   3. https://seance.soundfactorynyc.com/tables-halloween"
else
    echo "⏸️  Not deploying. Run 'netlify deploy --prod' when ready."
fi

echo ""
echo "✅ Recovery complete!"
