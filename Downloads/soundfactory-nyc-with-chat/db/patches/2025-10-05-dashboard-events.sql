-- ============================================
-- DASHBOARD EVENTS TABLE (Alternative to pg_notify for realtime)
-- ============================================
-- Creates a lightweight event stream table promoters can subscribe to
-- via Supabase Realtime (replication) without relying on pg_notify.

CREATE TABLE IF NOT EXISTS dashboard_events (
  id BIGSERIAL PRIMARY KEY,
  promoter_id UUID NOT NULL,
  source_table TEXT NOT NULL CHECK (source_table IN ('bookings','commissions')),
  operation TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for querying & pruning
CREATE INDEX IF NOT EXISTS idx_dashboard_events_promoter ON dashboard_events(promoter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_events_created ON dashboard_events(created_at);

-- RLS (optional). Enable and allow promoter to read their own events.
ALTER TABLE dashboard_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS dashboard_events_select_own ON dashboard_events
  FOR SELECT USING (auth.uid() = promoter_id);

-- Insert-only from trusted server key (service) or via trigger
CREATE POLICY IF NOT EXISTS dashboard_events_insert_server ON dashboard_events
  FOR INSERT WITH CHECK (true);

-- Trigger function to emit events on changes
CREATE OR REPLACE FUNCTION emit_dashboard_event() RETURNS trigger AS $$
DECLARE trg_promoter UUID;
BEGIN
  IF TG_TABLE_NAME = 'bookings' THEN
    trg_promoter := COALESCE(NEW.promoter_id, OLD.promoter_id);
  ELSIF TG_TABLE_NAME = 'commissions' THEN
    trg_promoter := COALESCE(NEW.promoter_id, OLD.promoter_id);
  END IF;

  IF trg_promoter IS NOT NULL THEN
    INSERT INTO dashboard_events(promoter_id, source_table, operation, payload)
    VALUES (
      trg_promoter,
      TG_TABLE_NAME,
      TG_OP,
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_dashboard_event ON bookings;
CREATE TRIGGER trg_bookings_dashboard_event
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION emit_dashboard_event();

DROP TRIGGER IF EXISTS trg_commissions_dashboard_event ON commissions;
CREATE TRIGGER trg_commissions_dashboard_event
  AFTER INSERT OR UPDATE OR DELETE ON commissions
  FOR EACH ROW EXECUTE FUNCTION emit_dashboard_event();

-- Optional retention: run manually / schedule separately
-- DELETE FROM dashboard_events WHERE created_at < TIMEZONE('utc', NOW()) - INTERVAL '30 days';

-- END dashboard events patch
