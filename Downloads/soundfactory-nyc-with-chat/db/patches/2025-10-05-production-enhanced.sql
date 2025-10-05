-- ============================================
-- SOUND FACTORY NYC - ENHANCED PRODUCTION SCHEMA
-- Apply AFTER base schema. Contains RLS, triggers, auditing, views.
-- ============================================

-- (Content provided by user – consolidated for version control)

-- 1. Automatic updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DO $$DECLARE r RECORD;BEGIN
  FOR r IN SELECT unnest(ARRAY['users','promoters','venue_tables','bookings','commissions','pending_commissions','access_pins','sms_verifications','stream_events','stripe_webhooks','admin_settings','sessions']) AS t LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;', r.t, r.t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', r.t, r.t);
  END LOOP;END $$;

-- 2. Data integrity constraints
ALTER TABLE commissions ADD CONSTRAINT commissions_amount_consistency CHECK (commission_amount = round(sale_amount * commission_rate, 2)) ON CONFLICT DO NOTHING; -- may error if exists
ALTER TABLE access_pins ADD CONSTRAINT access_pins_use_bounds CHECK (use_count <= max_uses) ON CONFLICT DO NOTHING;

-- 3. SMS verification management
CREATE INDEX IF NOT EXISTS idx_sms_verifications_active ON sms_verifications(phone_number, code_type) WHERE verified = FALSE AND expires_at > TIMEZONE('utc', NOW());
CREATE OR REPLACE FUNCTION prevent_excess_pending_codes() RETURNS trigger AS $$
DECLARE pending_count INT;BEGIN
  SELECT COUNT(*) INTO pending_count FROM sms_verifications
  WHERE phone_number = NEW.phone_number AND code_type = NEW.code_type AND verified = FALSE AND expires_at > TIMEZONE('utc', NOW());
  IF pending_count >= 5 THEN RAISE EXCEPTION 'Too many pending verification codes for this phone/code_type'; END IF;RETURN NEW;END;$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_sms_verifications_limit ON sms_verifications;
CREATE TRIGGER trg_sms_verifications_limit BEFORE INSERT ON sms_verifications FOR EACH ROW EXECUTE FUNCTION prevent_excess_pending_codes();

-- 4. Access PIN auto-management
CREATE OR REPLACE FUNCTION sync_access_pin_used() RETURNS trigger AS $$BEGIN
  IF NEW.use_count >= NEW.max_uses THEN NEW.used = TRUE; IF NEW.used_at IS NULL THEN NEW.used_at = TIMEZONE('utc', NOW()); END IF; END IF; RETURN NEW;END;$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_access_pins_used ON access_pins;
CREATE TRIGGER trg_access_pins_used BEFORE UPDATE ON access_pins FOR EACH ROW EXECUTE FUNCTION sync_access_pin_used();

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_promoter_code ON bookings(promoter_code) WHERE promoter_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_pins_active ON access_pins(pin_code) WHERE used = FALSE AND valid_until > TIMEZONE('utc', NOW());

-- 6. Enhanced RLS enablement
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS sessions_select_own ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS sessions_insert_own ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS sessions_delete_own ON sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS bookings_select_user ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS bookings_insert_user ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS bookings_select_promoter ON bookings FOR SELECT USING (promoter_id IN (SELECT id FROM promoters WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS commissions_read_own ON commissions;
CREATE POLICY commissions_read_own ON commissions FOR SELECT USING (promoter_id IN (SELECT id FROM promoters WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS access_pins_select_user ON access_pins FOR SELECT USING (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS sms_verifications_insert ON sms_verifications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY IF NOT EXISTS sms_verifications_select_none ON sms_verifications FOR SELECT USING (FALSE);
CREATE POLICY IF NOT EXISTS stream_events_public_select ON stream_events FOR SELECT USING (TRUE);

-- 7. Helper functions
CREATE OR REPLACE FUNCTION upsert_user_by_phone(p_phone TEXT) RETURNS users AS $$DECLARE u users;BEGIN
  SELECT * INTO u FROM users WHERE phone_number = p_phone; IF NOT FOUND THEN
    INSERT INTO users(phone_number, role, created_at) VALUES (p_phone, 'customer', TIMEZONE('utc', NOW())) RETURNING * INTO u; END IF; RETURN u;END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Audit logging
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  action TEXT CHECK (action IN ('INSERT','UPDATE','DELETE')) NOT NULL,
  row_pk UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  actor UUID,
  old_data JSONB,
  new_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $$BEGIN
  IF TG_OP='DELETE' THEN INSERT INTO audit_log(table_name, action, row_pk, actor, old_data) VALUES (TG_TABLE_NAME, TG_OP, OLD.id, auth.uid(), to_jsonb(OLD)); RETURN OLD; ELSIF TG_OP='UPDATE' THEN INSERT INTO audit_log(table_name, action, row_pk, actor, old_data, new_data) VALUES (TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW)); RETURN NEW; ELSE INSERT INTO audit_log(table_name, action, row_pk, actor, new_data) VALUES (TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(), to_jsonb(NEW)); RETURN NEW; END IF;END;$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS audit_bookings ON bookings;CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings FOR EACH ROW EXECUTE FUNCTION audit_trigger();
DROP TRIGGER IF EXISTS audit_commissions ON commissions;CREATE TRIGGER audit_commissions AFTER INSERT OR UPDATE OR DELETE ON commissions FOR EACH ROW EXECUTE FUNCTION audit_trigger();
DROP TRIGGER IF EXISTS audit_promoters ON promoters;CREATE TRIGGER audit_promoters AFTER INSERT OR UPDATE OR DELETE ON promoters FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- 9. Monitoring views
CREATE OR REPLACE VIEW v_promoter_performance AS
SELECT p.id, p.name, p.code, p.commission_rate, p.stripe_connected,
       COUNT(DISTINCT b.id) AS total_bookings,
       COUNT(DISTINCT CASE WHEN b.status='confirmed' THEN b.id END) AS confirmed_bookings,
       COALESCE(SUM(CASE WHEN b.status='confirmed' THEN b.amount END),0) AS total_sales,
       COALESCE(SUM(c.commission_amount),0) AS total_earned,
       MAX(b.created_at) AS last_referral
FROM promoters p
LEFT JOIN bookings b ON b.promoter_id = p.id
LEFT JOIN commissions c ON c.promoter_id = p.id AND c.status='paid'
GROUP BY p.id;

CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT DATE(created_at) AS booking_date,
       COUNT(*) AS total_bookings,
       COUNT(CASE WHEN status='confirmed' THEN 1 END) AS confirmed_bookings,
       SUM(CASE WHEN status='confirmed' THEN amount END) AS revenue,
       COUNT(DISTINCT promoter_id) AS active_promoters
FROM bookings
GROUP BY DATE(created_at)
ORDER BY booking_date DESC;

-- 10. Scheduled maintenance
CREATE OR REPLACE FUNCTION cleanup_expired_data() RETURNS void AS $$BEGIN
  DELETE FROM sessions WHERE expires_at < TIMEZONE('utc', NOW());
  DELETE FROM sms_verifications WHERE verified=FALSE AND expires_at < TIMEZONE('utc', NOW()) - INTERVAL '1 day';
  DELETE FROM access_pins WHERE valid_until < TIMEZONE('utc', NOW()) - INTERVAL '30 days';
  DELETE FROM stripe_webhooks WHERE created_at < TIMEZONE('utc', NOW()) - INTERVAL '90 days' AND processed = TRUE;END;$$ LANGUAGE plpgsql;

-- 11. Validation queries (commented for manual use)
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname='public';
-- SELECT COUNT(*) FROM commissions WHERE commission_amount <> round(sale_amount * commission_rate, 2);
-- SELECT * FROM bookings WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
-- SELECT * FROM pending_commissions WHERE status='pending' AND created_at < TIMEZONE('utc', NOW()) - INTERVAL '7 days';
-- SELECT * FROM access_pins WHERE used=FALSE AND valid_until < TIMEZONE('utc', NOW());

-- END ENHANCED PRODUCTION SCHEMA
