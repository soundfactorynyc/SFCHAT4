#!/bin/bash
# Netlify Build Script - Injects Environment Variables into JS
set -e  # Exit on any error

echo "🔧 Starting Netlify build process..."

# ============================================================================
# STEP 1: Prepare environment variables
# ============================================================================
echo "📦 Preparing environment variables..."

# Prefer NEXT_PUBLIC_* values if present (common convention)
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  export SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
fi
if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  export SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

# Also support CRA-style REACT_APP_* envs for compatibility
if [ -n "$REACT_APP_SUPABASE_URL" ]; then
  export SUPABASE_URL="$REACT_APP_SUPABASE_URL"
fi
if [ -n "$REACT_APP_SUPABASE_ANON_KEY" ]; then
  export SUPABASE_ANON_KEY="$REACT_APP_SUPABASE_ANON_KEY"
fi

# ============================================================================
# STEP 2: Create config directory if it doesn't exist
# ============================================================================
echo "📁 Ensuring config directory exists..."
mkdir -p config

# ============================================================================
# STEP 3: Inject environment variables into config files
# ============================================================================
echo "💉 Injecting environment variables into config files..."

# Function to safely replace placeholders
inject_env_vars() {
  local file=$1
  
  if [ ! -f "$file" ]; then
    echo "⚠️  Warning: $file not found, skipping..."
    return
  fi
  
  echo "   Processing: $file"
  
  # Create temporary file
  local temp_file="${file}.tmp"
  
  # Perform replacements
  sed "s|%%STRIPE_PUBLISHABLE_KEY%%|${STRIPE_PUBLISHABLE_KEY:-}|g" "$file" | \
  sed "s|%%STRIPE_PRICE_TICKET%%|${STRIPE_PRICE_TICKET:-}|g" | \
  sed "s|%%STRIPE_PRICE_VIP_TICKET%%|${STRIPE_PRICE_VIP_TICKET:-}|g" | \
  sed "s|%%STRIPE_PRICE_TABLE%%|${STRIPE_PRICE_TABLE:-}|g" | \
  sed "s|%%STRIPE_PRICE_DRINK%%|${STRIPE_PRICE_DRINK:-}|g" | \
  sed "s|%%STRIPE_PRICE_BOTTLE%%|${STRIPE_PRICE_BOTTLE:-}|g" | \
  sed "s|%%SUPABASE_URL%%|${SUPABASE_URL:-}|g" | \
  sed "s|%%SUPABASE_ANON_KEY%%|${SUPABASE_ANON_KEY:-}|g" | \
  sed "s|%%HOVER_TICKET_PAGE%%|${HOVER_TICKET_PAGE:-}|g" | \
  sed "s|%%HOVER_DRINK_10%%|${HOVER_DRINK_10:-}|g" | \
  sed "s|%%HOVER_TABLE_100%%|${HOVER_TABLE_100:-}|g" | \
  sed "s|%%STRIPE_TIP_LINK_1%%|${STRIPE_TIP_LINK_1:-}|g" | \
  sed "s|%%STRIPE_TIP_LINK_5%%|${STRIPE_TIP_LINK_5:-}|g" | \
  sed "s|%%STRIPE_TIP_LINK_10%%|${STRIPE_TIP_LINK_10:-}|g" | \
  sed "s|%%SF_PRESENCE_ENABLED%%|${SF_PRESENCE_ENABLED:-false}|g" > "$temp_file"
  
  # Replace original file with processed version
  mv "$temp_file" "$file"
  
  echo "   ✅ $file updated successfully"
}

# Process all config files
inject_env_vars "config/netlify-env-inject.js"
inject_env_vars "netlify-env-inject.js"

# ============================================================================
# STEP 4: Install dependencies for Netlify Functions
# ============================================================================
if [ -d "netlify/functions" ] && [ -f "netlify/functions/package.json" ]; then
  echo "📦 Installing Netlify Functions dependencies..."
  cd netlify/functions
  npm install --production
  cd ../..
  echo "✅ Function dependencies installed"
fi

# ============================================================================
# STEP 5: Verify critical files exist
# ============================================================================
echo "🔍 Verifying critical files..."

CRITICAL_FILES=(
  "index.html"
  "netlify.toml"
  "css/blueprint-theme.css"
  "css/components.css"
  "js/config.js"
  "js/main.js"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ ERROR: Critical file missing: $file"
    exit 1
  fi
  echo "   ✅ $file exists"
done

# ============================================================================
# STEP 6: Display environment summary (for debugging)
# ============================================================================
echo ""
echo "📊 Environment Summary:"
echo "   SUPABASE_URL: ${SUPABASE_URL:0:30}..." 
echo "   STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY:0:20}..."
echo "   SF_PRESENCE_ENABLED: ${SF_PRESENCE_ENABLED:-false}"
echo ""

# ============================================================================
# STEP 7: Build complete
# ============================================================================
echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment"
