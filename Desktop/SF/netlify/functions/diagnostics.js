const twilio = require('twilio');
# ================================================================
# STEP 13: Auto-run Local Test & Show Diagnostics (no matter what)
# ================================================================
echo -e "\n${CYAN}${GEAR} STEP 13: Launching local test & diagnostics${NC}"

# 13a) Ensure minimal Netlify config exists
if [ ! -f "netlify.toml" ]; then
  cat > netlify.toml << 'EOF'
[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
