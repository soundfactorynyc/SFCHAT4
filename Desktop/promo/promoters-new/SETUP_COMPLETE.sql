-- ========================================
-- COMPLETE SETUP - Copy and Run This Entire File
-- ========================================

-- Step 1: Clean slate - drop old tables
DROP TABLE IF EXISTS promoter_sales CASCADE;
DROP TABLE IF EXISTS promoters CASCADE;

-- Step 2: Create promoters table
CREATE TABLE promoters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code text UNIQUE NOT NULL,
  stripe_account_id text UNIQUE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  flyer_request text,
  tickets_sold integer DEFAULT 0,
  commission_earned numeric DEFAULT 0,
  session_token text,
  session_expires_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 3: Create promoter_sales table
CREATE TABLE promoter_sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  promoter_id uuid REFERENCES promoters(id) ON DELETE CASCADE,
  payment_intent_id text NOT NULL,
  amount integer NOT NULL,
  commission integer NOT NULL,
  product_type text,
  created_at timestamp with time zone DEFAULT now()
);

-- Step 4: Enable security
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_sales ENABLE ROW LEVEL SECURITY;

-- Step 5: Security policies
CREATE POLICY "Service role full access promoters" 
  ON promoters FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access sales" 
  ON promoter_sales FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

-- Step 6: Create indexes
CREATE INDEX idx_promoters_promo_code ON promoters(promo_code);
CREATE INDEX idx_promoters_phone ON promoters(phone);
CREATE INDEX idx_promoters_email ON promoters(email);
CREATE INDEX idx_promoters_status ON promoters(status);

-- Step 7: Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promoters_updated_at
    BEFORE UPDATE ON promoters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add YOUR promoter (CHANGE PHONE NUMBER!)
INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status
) VALUES (
  'SFTEST001',
  'Test Promoter',
  'test@soundfactorynyc.com',
  '+19293629534',              -- ⚠️ CHANGE THIS TO YOUR PHONE!
  'approved'
);

-- Step 9: Verify everything worked
SELECT 'Setup complete! ✅' as status;

SELECT 
  promo_code,
  name,
  phone,
  email,
  status
FROM promoters;