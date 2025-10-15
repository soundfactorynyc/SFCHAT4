-- SOUND FACTORY PROMOTER SYSTEM DATABASE SCHEMA
-- Complete tracking system for all sales and commissions
-- Created: October 15, 2025
-- Author: Jonathan Peters Productions

-- ================================================================
-- MAIN PROMOTERS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS promoters (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_account_id TEXT UNIQUE,
  promo_code TEXT UNIQUE NOT NULL,
  
  -- Personal information
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  
  -- Status and permissions
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  admin_notes TEXT,
  
  -- Commission tracking
  commission_earned NUMERIC(10,2) DEFAULT 0.00,
  tickets_sold INTEGER DEFAULT 0,
  tables_sold INTEGER DEFAULT 0,
  total_sales_amount NUMERIC(10,2) DEFAULT 0.00,
  
  -- Session management
  session_token TEXT,
  session_expires_at TIMESTAMP,
  last_login_at TIMESTAMP,
  last_sale_at TIMESTAMP,
  
  -- AI Flyer customization
  flyer_request TEXT,
  custom_flyer_url TEXT,
  flyer_approved BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_promoters_phone ON promoters(phone);
CREATE INDEX idx_promoters_email ON promoters(email);
CREATE INDEX idx_promoters_promo_code ON promoters(promo_code);
CREATE INDEX idx_promoters_status ON promoters(status);
CREATE INDEX idx_promoters_stripe ON promoters(stripe_account_id);

-- ================================================================
-- DETAILED SALES TRACKING TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS promoter_sales (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id UUID REFERENCES promoters(id) ON DELETE CASCADE,
  promo_code TEXT NOT NULL,
  
  -- Transaction details
  payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  commission INTEGER NOT NULL, -- Commission in cents
  
  -- Product information
  product_type TEXT CHECK (product_type IN ('ticket', 'table', 'vip_ticket', 'bottle_service')),
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  
  -- Customer information
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  payment_method TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed')),
  refunded_at TIMESTAMP,
  refund_amount INTEGER,
  
  -- Additional metadata
  event_date DATE,
  event_name TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for reporting
CREATE INDEX idx_sales_promoter ON promoter_sales(promoter_id);
CREATE INDEX idx_sales_promo_code ON promoter_sales(promo_code);
CREATE INDEX idx_sales_status ON promoter_sales(status);
CREATE INDEX idx_sales_created ON promoter_sales(created_at DESC);
CREATE INDEX idx_sales_payment_intent ON promoter_sales(payment_intent_id);

-- ================================================================
-- COMMISSION PAYOUTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS commission_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id UUID REFERENCES promoters(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES promoter_sales(id) ON DELETE CASCADE,
  
  -- Payout details
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  
  -- Stripe transfer information
  stripe_transfer_id TEXT,
  stripe_account_id TEXT,
  stripe_payout_id TEXT,
  
  -- Error handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  paid_at TIMESTAMP
);

CREATE INDEX idx_payouts_promoter ON commission_payouts(promoter_id);
CREATE INDEX idx_payouts_status ON commission_payouts(status);
CREATE INDEX idx_payouts_sale ON commission_payouts(sale_id);

-- ================================================================
-- UNATTRIBUTED SALES TABLE (for unknown promo codes)
-- ================================================================
CREATE TABLE IF NOT EXISTS unattributed_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was attempted
  promo_code_used TEXT,
  amount INTEGER,
  product_type TEXT,
  
  -- Customer info for follow-up
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Resolution tracking
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT,
  resolved_at TIMESTAMP,
  assigned_to_promoter_id UUID REFERENCES promoters(id),
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_unattributed_code ON unattributed_sales(promo_code_used);
CREATE INDEX idx_unattributed_resolved ON unattributed_sales(resolved);

-- ================================================================
-- PROMO CODE ANALYTICS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS promo_code_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code TEXT NOT NULL,
  promoter_id UUID REFERENCES promoters(id),
  
  -- Click tracking
  clicks INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- Conversion metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2),
  
  -- Revenue metrics
  total_revenue NUMERIC(10,2) DEFAULT 0.00,
  total_commission NUMERIC(10,2) DEFAULT 0.00,
  
  -- Time-based metrics
  last_click_at TIMESTAMP,
  last_conversion_at TIMESTAMP,
  
  -- Performance scoring
  performance_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_code ON promo_code_analytics(promo_code);
CREATE INDEX idx_analytics_promoter ON promo_code_analytics(promoter_id);

-- ================================================================
-- AUDIT LOG TABLE (for compliance and tracking)
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What happened
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  
  -- Who did it
  user_id UUID,
  user_type TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ================================================================
-- VIEWS FOR REPORTING
-- ================================================================

-- Top performers view
CREATE OR REPLACE VIEW top_performers AS
SELECT 
  p.id,
  p.name,
  p.promo_code,
  p.commission_earned,
  p.tickets_sold,
  p.tables_sold,
  COUNT(DISTINCT ps.id) as total_sales,
  SUM(ps.amount) / 100.0 as total_revenue
FROM promoters p
LEFT JOIN promoter_sales ps ON p.id = ps.promoter_id
WHERE p.status = 'approved'
  AND ps.status = 'completed'
GROUP BY p.id
ORDER BY p.commission_earned DESC;

-- Daily sales summary
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as total_sales,
  COUNT(DISTINCT promoter_id) as active_promoters,
  SUM(amount) / 100.0 as total_revenue,
  SUM(commission) / 100.0 as total_commissions,
  AVG(amount) / 100.0 as avg_sale_amount
FROM promoter_sales
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Promoter performance view
CREATE OR REPLACE VIEW promoter_performance AS
SELECT 
  p.id,
  p.name,
  p.promo_code,
  p.status,
  p.commission_earned,
  COUNT(DISTINCT ps.id) as lifetime_sales,
  COUNT(DISTINCT DATE(ps.created_at)) as active_days,
  COALESCE(SUM(ps.amount) / 100.0, 0) as lifetime_revenue,
  COALESCE(AVG(ps.amount) / 100.0, 0) as avg_sale_value,
  MAX(ps.created_at) as last_sale,
  p.created_at as joined_date
FROM promoters p
LEFT JOIN promoter_sales ps ON p.id = ps.promoter_id AND ps.status = 'completed'
GROUP BY p.id;

-- ================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================================

-- Update promoter stats on new sale
CREATE OR REPLACE FUNCTION update_promoter_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE promoters 
    SET 
      commission_earned = commission_earned + (NEW.commission / 100.0),
      tickets_sold = CASE 
        WHEN NEW.product_type = 'ticket' THEN tickets_sold + 1 
        ELSE tickets_sold 
      END,
      tables_sold = CASE 
        WHEN NEW.product_type = 'table' THEN tables_sold + 1 
        ELSE tables_sold 
      END,
      total_sales_amount = total_sales_amount + (NEW.amount / 100.0),
      last_sale_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = NEW.promoter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promoter_stats
AFTER INSERT ON promoter_sales
FOR EACH ROW
EXECUTE FUNCTION update_promoter_stats();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promoters_timestamp
BEFORE UPDATE ON promoters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Insert test promoter (already exists in your system)
-- INSERT INTO promoters (
--   name, first_name, last_name, email, phone, 
--   promo_code, status, stripe_account_id
-- ) VALUES (
--   'Jonathan Peters', 'Jonathan', 'Peters', 
--   'jp@soundfactorynyc.com', '+19293629534',
--   'JP2025', 'approved', 'acct_test_123'
-- ) ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- USEFUL QUERIES FOR ADMIN
-- ================================================================

-- Get all sales for a specific promoter
-- SELECT * FROM promoter_sales 
-- WHERE promoter_id = (SELECT id FROM promoters WHERE promo_code = 'JP2025')
-- ORDER BY created_at DESC;

-- Get today's sales summary
-- SELECT 
--   COUNT(*) as sales_today,
--   SUM(amount) / 100.0 as revenue_today,
--   SUM(commission) / 100.0 as commissions_today
-- FROM promoter_sales
-- WHERE DATE(created_at) = CURRENT_DATE
--   AND status = 'completed';

-- Find unattributed sales
-- SELECT * FROM unattributed_sales
-- WHERE resolved = false
-- ORDER BY created_at DESC;

-- Top performers this month
-- SELECT 
--   p.name,
--   p.promo_code,
--   COUNT(ps.id) as sales_this_month,
--   SUM(ps.commission) / 100.0 as earned_this_month
-- FROM promoters p
-- JOIN promoter_sales ps ON p.id = ps.promoter_id
-- WHERE ps.created_at >= DATE_TRUNC('month', CURRENT_DATE)
--   AND ps.status = 'completed'
-- GROUP BY p.id
-- ORDER BY earned_this_month DESC
-- LIMIT 10;