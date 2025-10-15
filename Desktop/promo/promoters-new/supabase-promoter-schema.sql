-- Promoter System - Database Schema
-- Run this in your Supabase SQL Editor

-- Create promoters table
CREATE TABLE IF NOT EXISTS promoters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code text UNIQUE NOT NULL,
  stripe_account_id text UNIQUE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  status text DEFAULT 'pending',        -- 'pending' or 'approved'
  flyer_request text,                   -- AI customization request
  tickets_sold integer DEFAULT 0,
  commission_earned numeric DEFAULT 0,
  session_token text,
  session_expires_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create promoter_sales table
CREATE TABLE IF NOT EXISTS promoter_sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  promoter_id uuid REFERENCES promoters(id) ON DELETE CASCADE,
  payment_intent_id text NOT NULL,
  amount integer NOT NULL,              -- Cents
  commission integer NOT NULL,          -- Cents
  product_type text,                    -- 'ticket' or 'table'
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for service role, read own data for promoters)
CREATE POLICY "Service role full access promoters" ON promoters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Promoters read own data" ON promoters FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Service role full access sales" ON promoter_sales FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Promoters read own sales" ON promoter_sales FOR SELECT USING (
  promoter_id IN (SELECT id FROM promoters WHERE auth.uid()::text = id::text)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promoters_promo_code ON promoters(promo_code);
CREATE INDEX IF NOT EXISTS idx_promoters_phone ON promoters(phone);
CREATE INDEX IF NOT EXISTS idx_promoters_email ON promoters(email);
CREATE INDEX IF NOT EXISTS idx_promoters_status ON promoters(status);
CREATE INDEX IF NOT EXISTS idx_promoter_sales_promoter_id ON promoter_sales(promoter_id);
CREATE INDEX IF NOT EXISTS idx_promoter_sales_payment_intent ON promoter_sales(payment_intent_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_promoters_updated_at ON promoters;
CREATE TRIGGER update_promoters_updated_at
    BEFORE UPDATE ON promoters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Promoter system database schema created successfully! 🎉' as message;
