#!/bin/bash

# Sound Factory Admin & Promotion Setup Script
# This script wires up all the admin and promotion tools

echo "🎭 Sound Factory Setup Script"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SMS_SITE="https://tourmaline-meerkat-3129f1.netlify.app"
WEBSITE="https://seance.soundfactorynyc.com"
ADMIN_KEY="Deepernyc1"

# Check if .env files exist
check_env_files() {
    echo "📋 Checking environment files..."
    
    for dir in "/Users/jpwesite/Desktop/sms" "/Users/jpwesite/astro-sf-seance" "/Users/jpwesite/sound-factory-seance"; do
        if [ -f "$dir/.env" ]; then
            echo -e "${GREEN}✓${NC} Found .env in $dir"
        else
            if [ -f "$dir/.env.example" ]; then
                echo -e "${YELLOW}⚠${NC} No .env found in $dir, but .env.example exists"
                echo "  Creating .env from example..."
                cp "$dir/.env.example" "$dir/.env"
            else
                echo -e "${RED}✗${NC} No .env in $dir"
            fi
        fi
    done
    echo ""
}

# Setup Supabase PAT
setup_supabase() {
    echo "🔑 Setting up Supabase Personal Access Token..."
    
    if [ -z "$SUPABASE_PAT" ]; then
        echo -e "${YELLOW}⚠${NC} SUPABASE_PAT not found in environment"
        echo ""
        echo "To set it up:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Click your profile → Account Settings → Access Tokens"
        echo "3. Generate a new token"
        echo "4. Run: export SUPABASE_PAT='your-token-here'"
        echo ""
    else
        echo -e "${GREEN}✓${NC} SUPABASE_PAT is configured"
    fi
    echo ""
}

# Test API endpoints
test_apis() {
    echo "🔌 Testing API endpoints..."
    
    # Test SMS API
    echo -n "Testing SMS API health... "
    if curl -s "$SMS_SITE/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
    
    # Test Website
    echo -n "Testing website... "
    if curl -s "$WEBSITE" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
    echo ""
}

# Setup admin users
setup_admins() {
    echo "👑 Setting up admin users..."
    
    admins=(
        "RonaldJAyala@outlook.com"
        "jonathanpeters1@mac.com"
        "morgangold@mac.com"
    )
    
    for email in "${admins[@]}"; do
        echo -n "  Adding $email... "
        response=$(curl -s -X POST "$SMS_SITE/api/members-upsert" \
            -H "Content-Type: application/json" \
            -H "x-admin-key: $ADMIN_KEY" \
            --data "{\"email\":\"$email\",\"role\":\"admin\"}")
        
        if echo "$response" | grep -q "ok"; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC}"
        fi
    done
    echo ""
}

# Install dependencies
install_dependencies() {
    echo "📦 Checking dependencies..."
    
    for dir in "/Users/jpwesite/Desktop/sms" "/Users/jpwesite/astro-sf-seance" "/Users/jpwesite/sound-factory-seance"; do
        if [ -f "$dir/package.json" ]; then
            echo "  Installing dependencies in $(basename $dir)..."
            cd "$dir" && npm install --silent
        fi
    done
    echo ""
}

# Create helper scripts
create_helpers() {
    echo "🛠️ Creating helper scripts..."
    
    # Create start-all script
    cat > /Users/jpwesite/Desktop/sms/start-all-services.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting all Sound Factory services..."

# Start SMS service
echo "Starting SMS service..."
cd /Users/jpwesite/Desktop/sms
npm run dev &

# Start Astro website
echo "Starting Astro website..."
cd /Users/jpwesite/astro-sf-seance
npm run dev &

echo "All services started!"
echo "SMS: http://localhost:8888"
echo "Website: http://localhost:4321"
EOF
    
    chmod +x /Users/jpwesite/Desktop/sms/start-all-services.sh
    echo -e "${GREEN}✓${NC} Created start-all-services.sh"
    
    # Create admin panel launcher
    cat > /Users/jpwesite/Desktop/sms/open-admin-panel.sh << 'EOF'
#!/bin/bash
open /Users/jpwesite/Desktop/sms/admin-panel.html
EOF
    
    chmod +x /Users/jpwesite/Desktop/sms/open-admin-panel.sh
    echo -e "${GREEN}✓${NC} Created open-admin-panel.sh"
    echo ""
}

# Main setup flow
main() {
    echo "Starting setup process..."
    echo ""
    
    check_env_files
    setup_supabase
    test_apis
    setup_admins
    install_dependencies
    create_helpers
    
    echo "✨ Setup complete!"
    echo ""
    echo "Quick start commands:"
    echo "  ./start-all-services.sh  - Start all services"
    echo "  ./open-admin-panel.sh    - Open admin panel"
    echo "  cd [project] && claude   - Start Claude Code in any project"
    echo ""
    echo "Admin Panel saved to: /Users/jpwesite/Desktop/sms/admin-panel.html"
}

# Run main
main
