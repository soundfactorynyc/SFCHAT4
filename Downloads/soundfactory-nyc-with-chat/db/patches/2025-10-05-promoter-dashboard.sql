-- ============================================
-- PROMOTER DASHBOARD VIEW & REALTIME NOTIFICATIONS
-- Apply after base + hardening schema.
-- Idempotent where practical.
-- ============================================

-- Drop and recreate view (CASCADE is safe if dependent views exist)
DROP VIEW IF EXISTS promoter_dashboard_view CASCADE;

CREATE VIEW promoter_dashboard_view AS
WITH booking_stats AS (
  SELECT promoter_id,
         COUNT(*) AS total_bookings,
         COUNT(CASE WHEN status='confirmed' THEN 1 END) AS confirmed_bookings,
         COUNT(CASE WHEN status='pending' THEN 1 END) AS pending_bookings,
         COUNT(CASE WHEN status='cancelled' THEN 1 END) AS cancelled_bookings,
         SUM(CASE WHEN status='confirmed' THEN amount ELSE 0 END) AS total_sales_amount,
         MAX(created_at) AS last_booking_date,
         MIN(created_at) AS first_booking_date
  FROM bookings
  WHERE promoter_id IS NOT NULL
  GROUP BY promoter_id
), commission_stats AS (
  SELECT promoter_id,
         COUNT(*) AS total_commissions,
         COUNT(CASE WHEN status='paid' THEN 1 END) AS paid_commissions,
         COUNT(CASE WHEN status='pending' THEN 1 END) AS pending_commissions,
         COUNT(CASE WHEN status='failed' THEN 1 END) AS failed_commissions,
         SUM(CASE WHEN status='paid' THEN commission_amount ELSE 0 END) AS total_earned,
         SUM(CASE WHEN status='pending' THEN commission_amount ELSE 0 END) AS pending_amount,
         MAX(CASE WHEN status='paid' THEN paid_at END) AS last_payout_date,
         MIN(CASE WHEN status='paid' THEN paid_at END) AS first_payout_date
  FROM commissions
  GROUP BY promoter_id
), pending_retry_stats AS (
  SELECT promoter_code,
         COUNT(*) AS retry_queue_count,
         SUM(commission_amount) AS retry_queue_amount,
         MAX(retry_count) AS max_retry_count,
         MIN(next_retry_at) AS next_retry_scheduled
  FROM pending_commissions
  WHERE status='pending'
  GROUP BY promoter_code
), time_metrics AS (
  SELECT b.promoter_id,
         COUNT(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS bookings_last_30_days,
         SUM(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '30 days' AND b.status='confirmed' THEN b.amount ELSE 0 END) AS sales_last_30_days,
         COUNT(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS bookings_last_7_days,
         SUM(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '7 days' AND b.status='confirmed' THEN b.amount ELSE 0 END) AS sales_last_7_days,
         COUNT(CASE WHEN DATE(b.created_at)=CURRENT_DATE THEN 1 END) AS bookings_today,
         SUM(CASE WHEN DATE(b.created_at)=CURRENT_DATE AND b.status='confirmed' THEN b.amount ELSE 0 END) AS sales_today
  FROM bookings b
  WHERE b.promoter_id IS NOT NULL
  GROUP BY b.promoter_id
), conversion_metrics AS (
  SELECT b.promoter_id,
         COUNT(DISTINCT b.user_id) AS unique_customers,
         CASE WHEN COUNT(*)>0 THEN ROUND(COUNT(CASE WHEN b.status='confirmed' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) ELSE 0 END AS conversion_rate,
         CASE WHEN COUNT(CASE WHEN b.status='confirmed' THEN 1 END)>0 THEN ROUND(AVG(CASE WHEN b.status='confirmed' THEN b.amount END),2) ELSE 0 END AS average_order_value
  FROM bookings b
  WHERE b.promoter_id IS NOT NULL
  GROUP BY b.promoter_id
)
SELECT p.id AS promoter_id,
       p.name AS promoter_name,
       p.email AS promoter_email,
       p.phone AS promoter_phone,
       p.code AS promoter_code,
       p.commission_rate,
       p.stripe_account_id,
       p.stripe_connected,
       p.status AS promoter_status,
       p.created_at AS promoter_since,
       COALESCE(bs.total_bookings,0) AS total_bookings,
       COALESCE(bs.confirmed_bookings,0) AS confirmed_bookings,
       COALESCE(bs.pending_bookings,0) AS pending_bookings,
       COALESCE(bs.cancelled_bookings,0) AS cancelled_bookings,
       COALESCE(bs.total_sales_amount,0) AS total_sales_amount,
       bs.last_booking_date,
       bs.first_booking_date,
       COALESCE(cs.total_commissions,0) AS total_commissions,
       COALESCE(cs.paid_commissions,0) AS paid_commissions,
       COALESCE(cs.pending_commissions,0) AS pending_commissions,
       COALESCE(cs.failed_commissions,0) AS failed_commissions,
       COALESCE(cs.total_earned,0) AS total_earned,
       COALESCE(cs.pending_amount,0) AS pending_amount,
       cs.last_payout_date,
       cs.first_payout_date,
       COALESCE(prs.retry_queue_count,0) AS retry_queue_count,
       COALESCE(prs.retry_queue_amount,0) AS retry_queue_amount,
       prs.max_retry_count,
       prs.next_retry_scheduled,
       COALESCE(tm.bookings_last_30_days,0) AS bookings_last_30_days,
       COALESCE(tm.sales_last_30_days,0) AS sales_last_30_days,
       COALESCE(tm.bookings_last_7_days,0) AS bookings_last_7_days,
       COALESCE(tm.sales_last_7_days,0) AS sales_last_7_days,
       COALESCE(tm.bookings_today,0) AS bookings_today,
       COALESCE(tm.sales_today,0) AS sales_today,
       COALESCE(cm.unique_customers,0) AS unique_customers,
       COALESCE(cm.conversion_rate,0) AS conversion_rate,
       COALESCE(cm.average_order_value,0) AS average_order_value,
       CASE WHEN bs.last_booking_date IS NOT NULL THEN DATE_PART('day', CURRENT_TIMESTAMP - bs.last_booking_date) ELSE NULL END AS days_since_last_booking,
       CASE WHEN cs.last_payout_date IS NOT NULL THEN DATE_PART('day', CURRENT_TIMESTAMP - cs.last_payout_date) ELSE NULL END AS days_since_last_payout,
       CASE WHEN COALESCE(bs.total_bookings,0)>0 THEN ROUND(COALESCE(cs.total_earned,0) / bs.total_bookings,2) ELSE 0 END AS average_commission_per_booking,
       CASE 
         WHEN p.stripe_connected = false THEN 'stripe_not_connected'
         WHEN COALESCE(cs.pending_amount,0) > 0 THEN 'has_pending_commission'
         WHEN COALESCE(prs.retry_queue_count,0) > 0 THEN 'has_retry_queue'
         WHEN bs.last_booking_date < CURRENT_DATE - INTERVAL '30 days' THEN 'inactive_30_days'
         WHEN bs.last_booking_date < CURRENT_DATE - INTERVAL '7 days' THEN 'inactive_7_days'
         ELSE 'active'
       END AS activity_status,
       CASE WHEN tm.sales_last_30_days > 0 THEN ROUND(tm.sales_last_30_days * p.commission_rate,2) ELSE 0 END AS projected_monthly_commission,
       CASE 
         WHEN COALESCE(cs.total_earned,0) >= 10000 THEN 'platinum'
         WHEN COALESCE(cs.total_earned,0) >= 5000 THEN 'gold'
         WHEN COALESCE(cs.total_earned,0) >= 1000 THEN 'silver'
         WHEN COALESCE(cs.total_earned,0) >= 100 THEN 'bronze'
         ELSE 'starter'
       END AS performance_tier,
       CURRENT_TIMESTAMP AS view_generated_at
FROM promoters p
LEFT JOIN booking_stats bs ON p.id = bs.promoter_id
LEFT JOIN commission_stats cs ON p.id = cs.promoter_id
LEFT JOIN pending_retry_stats prs ON p.code = prs.promoter_code
LEFT JOIN time_metrics tm ON p.id = tm.promoter_id
LEFT JOIN conversion_metrics cm ON p.id = cm.promoter_id
ORDER BY COALESCE(cs.total_earned,0) DESC, p.created_at DESC;

-- Indexes helpful for the view (idempotent)
CREATE INDEX IF NOT EXISTS idx_bookings_promoter_created ON bookings(promoter_id, created_at) WHERE promoter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_promoter_status ON commissions(promoter_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_commissions_code_status ON pending_commissions(promoter_code, status) WHERE status='pending';

-- Grant read to authenticated role (adjust as needed)
GRANT SELECT ON promoter_dashboard_view TO authenticated;

-- Helper function for filtered dashboard queries
CREATE OR REPLACE FUNCTION get_promoter_dashboard(
  p_promoter_id UUID DEFAULT NULL,
  p_promoter_code TEXT DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL
) RETURNS TABLE (
  promoter_id UUID,
  promoter_name TEXT,
  promoter_code TEXT,
  total_sales DECIMAL,
  total_earned DECIMAL,
  pending_amount DECIMAL,
  last_payout_date TIMESTAMP WITH TIME ZONE,
  bookings_count BIGINT,
  conversion_rate NUMERIC,
  activity_status TEXT,
  performance_tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pdv.promoter_id,
         pdv.promoter_name,
         pdv.promoter_code,
         pdv.total_sales_amount,
         pdv.total_earned,
         pdv.pending_amount,
         pdv.last_payout_date,
         pdv.total_bookings,
         pdv.conversion_rate,
         pdv.activity_status,
         pdv.performance_tier
  FROM promoter_dashboard_view pdv
  WHERE (p_promoter_id IS NULL OR pdv.promoter_id = p_promoter_id)
    AND (p_promoter_code IS NULL OR pdv.promoter_code = p_promoter_code)
    AND (p_date_from IS NULL OR pdv.first_booking_date >= p_date_from)
    AND (p_date_to IS NULL OR pdv.last_booking_date <= p_date_to);
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Real-time notification trigger function & triggers
CREATE OR REPLACE FUNCTION notify_promoter_dashboard_update() RETURNS trigger AS $$
DECLARE promoter_id_to_notify UUID;BEGIN
  IF TG_TABLE_NAME='bookings' THEN promoter_id_to_notify := COALESCE(NEW.promoter_id, OLD.promoter_id);
  ELSIF TG_TABLE_NAME='commissions' THEN promoter_id_to_notify := COALESCE(NEW.promoter_id, OLD.promoter_id);
  END IF;
  IF promoter_id_to_notify IS NOT NULL THEN
    PERFORM pg_notify('promoter_dashboard_update', json_build_object(
      'promoter_id', promoter_id_to_notify,
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', CURRENT_TIMESTAMP
    )::text);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_booking_changes ON bookings;
CREATE TRIGGER notify_booking_changes AFTER INSERT OR UPDATE OR DELETE ON bookings FOR EACH ROW EXECUTE FUNCTION notify_promoter_dashboard_update();

DROP TRIGGER IF EXISTS notify_commission_changes ON commissions;
CREATE TRIGGER notify_commission_changes AFTER INSERT OR UPDATE OR DELETE ON commissions FOR EACH ROW EXECUTE FUNCTION notify_promoter_dashboard_update();

-- END promoter dashboard components
