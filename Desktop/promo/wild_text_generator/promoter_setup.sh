#!/bin/bash
# PROMOTER QUICK START
# Run this to set everything up

echo "🎉 PARTY FLYER SYSTEM - SETUP"
echo "================================"

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Create directories
mkdir -p flyers templates party_configs

# Test generation
echo ""
echo "🧪 Testing system with sample flyer..."
python3 flyer_generator.py \
  --party "NEXT LEVEL" \
  --headline "NEXT LEVEL" \
  --date "FRI DEC 20 • 10PM" \
  --venue "CLUB ZERO" \
  --style particle \
  --seed 42 \
  --lineup "DJ SHADOW" "MC FLOW" "VISUAL ARTIST X" \
  --info "TICKETS: LINK.COM/NEXT" "21+ • $20 PRESALE"

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "📖 QUICK COMMANDS:"
echo ""
echo "Generate a flyer:"
echo '  python3 flyer_generator.py --party "YOUR PARTY" --headline "TEXT" --date "DATE" --venue "VENUE"'
echo ""
echo "Generate 5 variations to pick from:"
echo '  python3 flyer_generator.py --party "YOUR PARTY" --headline "TEXT" --date "DATE" --venue "VENUE" --batch 5'
echo ""
echo "Use a specific style:"
echo '  --style particle    (energy/tech vibe)'
echo '  --style holographic (cyber/future vibe)'
echo '  --style liquid      (premium/luxury vibe)'
echo ""
echo "Lock in a look you love:"
echo '  --seed 12345  (use the seed number from your favorite)'
echo ""
echo "🔥 CHECK flyers/ FOLDER FOR OUTPUT"
