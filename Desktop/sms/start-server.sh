#!/bin/bash

# Simple startup script for SMS project
echo "Starting SMS server..."

# Clear any existing netlify processes
pkill -f "netlify" 2>/dev/null

# Remove cache
rm -rf .netlify/functions-serve 2>/dev/null

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server with verbose output
echo "Running netlify dev..."
npx netlify dev --port 8888 --dir=. --functions=netlify/functions --live=false --debug

# If that fails, try a simpler approach
if [ $? -ne 0 ]; then
    echo "Netlify dev failed, trying direct node execution..."
    node -e "console.log('Node version:', process.version)"
    npx netlify --version
fi
