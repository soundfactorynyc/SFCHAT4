#!/bin/bash

# WILD TEXT GENERATOR - QUICK START
# Party in 14 days - let's make magic happen

echo "🔥 WILD TEXT GENERATOR - QUICK START 🔥"
echo "========================================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt --quiet

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Some dependencies may have issues, but trying anyway..."
fi

echo ""
echo "🎨 Generating test images..."
echo ""

# Generate sample images
python3 wild_generator.py --text "NEXT LEVEL" --style particle
python3 wild_generator.py --text "GENIUS" --style holographic
python3 wild_generator.py --text "WILD" --style liquid

echo ""
echo "========================================"
echo "✅ SETUP COMPLETE!"
echo "========================================"
echo ""
echo "📁 Check the output/ folder for your visuals"
echo ""
echo "🚀 Next steps:"
echo "   python3 wild_generator.py --text 'YOUR TEXT' --style particle --batch 10"
echo ""
echo "🎉 LET'S GO! Party in 14 days!"
echo ""
