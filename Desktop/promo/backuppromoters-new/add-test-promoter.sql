-- Add Test Promoter
-- Run this after running supabase-promoter-schema.sql

INSERT INTO promoters (
  promo_code,
  name,
  email,
  phone,
  status,
  stripe_account_id
) VALUES (
  'SFTEST001',                          -- Your promo code
  'Test Promoter',                      -- Your name
  'test@soundfactorynyc.com',          -- Your email
  '+19293629534',                       -- Your phone number
  'approved',                           -- Already approved for testing
  'acct_test_stripe_id'                 -- Placeholder Stripe account
)
ON CONFLICT (phone) DO UPDATE SET
  status = 'approved';

-- Verify the promoter was created
SELECT 
  id,
  promo_code,
  name,
  phone,
  status,
  created_at
FROM promoters 
WHERE promo_code = 'SFTEST001';

-- Success message
SELECT '✅ Test promoter created! You can now test SMS login with your phone number.' as message;
