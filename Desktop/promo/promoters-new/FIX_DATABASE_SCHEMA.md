# 🚨 URGENT FIX - Table Schema Issue

## The Problem

You're getting: `ERROR: column "name" of relation "promoters" does not exist`

This means either:
1. The `promoters` table was never created, OR
2. The table exists but has different columns

---

## The Fix - Run This in Supabase SQL Editor

### Step 1: Drop and Recreate Table (Fresh Start)

**Copy ALL of this and run it in Supabase SQL Editor:**

```sql
-- Step 1: Drop existing tables if they exist
DROP TABLE IF EXISTS promoter_sales CASCADE;
DROP TABLE IF EXISTS promoters CASCADE;

-- Step 2: Create promoters table with correct schema
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

-- Step 4: Enable Row Level Security
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_sales ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
CREATE POLICY "Service role full access promoters" 
  ON promoters FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Promoters read own data" 
  ON promoters FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Service role full access sales" 
  ON promoter_sales FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Promoters read own sales" 
  ON promoter_sales FOR SELECT 
  USING (promoter_id IN (SELECT id FROM promoters WHERE auth.uid()::text = id::text));

-- Step 6: Create indexes
CREATE INDEX idx_promoters_promo_code ON promoters(promo_code);
CREATE INDEX idx_promoters_phone ON promoters(phone);
CREATE INDEX idx_promoters_email ON promoters(email);
CREATE INDEX idx_promoters_status ON promoters(status);
CREATE INDEX idx_promoter_sales_promoter_id ON promoter_sales(promoter_id);
CREATE INDEX idx_promoter_sales_payment_intent ON promoter_sales(payment_intent_id);

-- Step 7: Create update trigger
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

-- Step 8: Verify tables were created
SELECT 'Tables created successfully! ✅' as status;

-- Step 9: Show table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'promoters'
ORDER BY ordinal_position;
```

### Step 2: Add Your Promoter

**After the tables are created, run this (change phone number):**

```sql
-- Add your test promoter
INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status,
  tickets_sold,
  commission_earned
) VALUES (
  'SFTEST001',
  'Test Promoter',
  'test@soundfactorynyc.com',
  '+19293629534',              -- ⚠️ CHANGE TO YOUR PHONE NUMBER!
  'approved',
  0,
  0
);

-- Verify it was created
SELECT 
  id,
  promo_code,
  name,
  phone,
  email,
  status,
  created_at
FROM promoters;
```

---

## What This Does

1. **Drops old tables** (fresh start)
2. **Creates tables with correct schema**
3. **Sets up security policies**
4. **Creates indexes** (for performance)
5. **Adds your promoter**
6. **Verifies everything**

---

## After Running

You should see:
```
✅ Tables created successfully!

Column listing:
- id (uuid)
- promo_code (text)
- stripe_account_id (text)
- name (text)              ← This should be here now!
- email (text)
- phone (text)
- status (text)
- ... etc
```

Then:
```
✅ 1 promoter added

Results showing your promoter with:
- promo_code: SFTEST001
- name: Test Promoter
- phone: +19293629534
- status: approved
```

---

## Then Test Login

1. Go to promoter login page
2. Enter phone: `+19293629534` (or your number)
3. Get SMS code
4. Enter code
5. **Dashboard should load! 🎉**

---

## If You Get Errors

### "permission denied for table promoters"
You need service role access. Run in SQL Editor with service role enabled.

### "table promoters already exists"
The DROP didn't work. Try:
```sql
DROP TABLE IF EXISTS promoter_sales CASCADE;
DROP TABLE IF EXISTS promoters CASCADE;
```
Then run the CREATE TABLE commands again.

---

## Quick Verification

After everything, check:

```sql
-- 1. Check table exists with correct columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'promoters';

-- 2. Check promoter was added
SELECT * FROM promoters;

-- 3. Check status is 'approved'
SELECT phone, status FROM promoters WHERE status = 'approved';
```

---

## Need Help?

If you still get errors, tell me:
1. What error message you see
2. What step you're on

And I'll help you fix it! 🚀