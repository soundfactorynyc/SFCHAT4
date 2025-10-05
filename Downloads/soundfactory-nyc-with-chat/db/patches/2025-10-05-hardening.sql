-- ============================================
-- SOUND FACTORY NYC - SCHEMA HARDENING PATCH (2025-10-05)
-- This file is ADDITIVE: safe to run after base schema.
-- Apply in Supabase SQL editor or via migration pipeline.
-- Review comments before executing in production.
-- ============================================

-- 1. Generic updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach updated_at triggers to tables that have updated_at column
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables
    WHERE schemaname='public' AND tablename IN (
      'users','promoters','venue_tables','bookings','commissions',
      'pending_commissions','access_pins','sms_verifications','stream_events',
      'stripe_webhooks','admin_settings','sessions'
    )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;', r.tablename, r.tablename);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', r.tablename, r.tablename);
  END LOOP;
END; $$;

-- 3. Commission consistency constraint (checks math)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='commissions' AND constraint_name='commissions_amount_consistency'
  ) THEN
    ALTER TABLE commissions
      ADD CONSTRAINT commissions_amount_consistency
      CHECK (commission_amount = round(sale_amount * commission_rate, 2));
  END IF;
END $$;

-- 4. Limit too many pending sms verification codes per phone/type (trigger)
CREATE OR REPLACE FUNCTION prevent_excess_pending_codes()
RETURNS trigger AS $$
DECLARE pending_count INT; max_allowed INT := 5;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM sms_verifications
  WHERE phone_number = NEW.phone_number
    AND code_type = NEW.code_type
    AND verified = FALSE
    AND expires_at > TIMEZONE('utc', NOW());
  IF pending_count >= max_allowed THEN
    RAISE EXCEPTION 'Too many pending verification codes (max %)', max_allowed;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sms_verifications_limit ON sms_verifications;
CREATE TRIGGER trg_sms_verifications_limit
  BEFORE INSERT ON sms_verifications
  FOR EACH ROW EXECUTE FUNCTION prevent_excess_pending_codes();

-- 5. Access pins integrity constraints and trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='access_pins' AND constraint_name='access_pins_use_bounds'
  ) THEN
    ALTER TABLE access_pins
      ADD CONSTRAINT access_pins_use_bounds CHECK (use_count <= max_uses);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION sync_access_pin_used()
RETURNS trigger AS $$
BEGIN
  IF NEW.use_count >= NEW.max_uses THEN
    NEW.used = TRUE;
    IF NEW.used_at IS NULL THEN
      NEW.used_at = TIMEZONE('utc', NOW());
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_access_pins_used ON access_pins;
CREATE TRIGGER trg_access_pins_used
  BEFORE UPDATE ON access_pins
  FOR EACH ROW EXECUTE FUNCTION sync_access_pin_used();

-- 6. Supplemental indexes (conditionally created)
CREATE INDEX IF NOT EXISTS idx_bookings_promoter_code ON bookings(promoter_code) WHERE promoter_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_pins_active ON access_pins(pin_code) WHERE used = FALSE AND valid_until > TIMEZONE('utc', NOW());
CREATE INDEX IF NOT EXISTS idx_sms_verifications_active ON sms_verifications(phone_number, code_type) WHERE verified = FALSE AND expires_at > TIMEZONE('utc', NOW());

-- 7. Optional RLS enabling for tables previously unprotected (uncomment if you decide to secure these)
-- ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stream_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pending_commissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- 8. Example additional RLS policies (ONLY IF you enabled RLS in step 7)
-- CREATE POLICY sms_insert_any ON sms_verifications FOR INSERT WITH CHECK (TRUE);
-- CREATE POLICY stream_events_public_select ON stream_events FOR SELECT USING (TRUE);

-- 9. Commission stats auditing (optional) - create a lightweight audit table
-- CREATE TABLE IF NOT EXISTS commission_audit (
--   id BIGSERIAL PRIMARY KEY,
--   commission_id UUID,
--   action TEXT NOT NULL,
--   snapshot JSONB,
--   actor UUID,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
-- );

-- 10. Upsert user helper by phone (SECURITY DEFINER; grant carefully)
CREATE OR REPLACE FUNCTION upsert_user_by_phone(p_phone TEXT)
RETURNS users AS $$
DECLARE u users;
BEGIN
  SELECT * INTO u FROM users WHERE phone_number = p_phone;
  IF NOT FOUND THEN
    INSERT INTO users(phone_number, role) VALUES (p_phone, 'customer') RETURNING * INTO u;
  END IF;
  RETURN u;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. (Optional) schedule clean_expired_sessions via Supabase scheduler / external cron.
-- SELECT clean_expired_sessions();  -- Manual test

-- 12. Validation queries (run manually after migration):
-- SELECT COUNT(*) FROM commissions WHERE commission_amount <> round(sale_amount * commission_rate, 2);
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname='public';
-- SELECT * FROM bookings WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);

-- ============================================
-- END PATCH
-- ============================================
