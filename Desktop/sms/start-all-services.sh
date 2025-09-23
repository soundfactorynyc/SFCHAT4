#!/bin/bash
echo "🚀 Starting all Sound Factory services..."

# Start SMS service
echo "Starting SMS service..."
cd /Users/jpwesite/Desktop/sms
npm run dev &
SMS_PID=$!

# Start Astro website  
echo "Starting Astro website..."
cd /Users/jpwesite/astro-sf-seance
npm run dev &
ASTRO_PID=$!

# Start Sound Factory Seance (if it has a dev server)
echo "Starting Sound Factory Seance..."
cd /Users/jpwesite/sound-factory-seance
if [ -f "package.json" ]; then
    npm run dev &
    SF_PID=$!
fi

echo ""
echo "✨ All services started!"
echo ""
echo "📱 SMS Service: http://localhost:8888"
echo "🌐 Astro Website: http://localhost:4321"
echo "🎭 Admin Panel: file:///Users/jpwesite/Desktop/sms/admin-panel.html"
echo ""
echo "Process IDs:"
echo "  SMS: $SMS_PID"
echo "  Astro: $ASTRO_PID"
if [ ! -z "$SF_PID" ]; then
    echo "  Sound Factory: $SF_PID"
fi
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $SMS_PID $ASTRO_PID $SF_PID 2>/dev/null; echo 'Services stopped.'; exit" INT
wait
