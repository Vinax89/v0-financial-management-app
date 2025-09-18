-- Live view (always current)
CREATE OR REPLACE VIEW v_monthly_category_totals AS
SELECT
  user_id,
  month,
  category_id,
  COALESCE(MAX(category_name), 'Uncategorized') AS category_name,
  COUNT(*) AS tx_count,
  SUM(expense_amount) AS expense_total,
  SUM(income_amount) AS income_total
FROM v_tx_denorm
GROUP BY user_id, month, category_id;

-- Optional materialized cache for fast dashboards
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_category_totals AS
SELECT * FROM v_monthly_category_totals
WITH NO DATA;

-- Unique index required for CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS uq_mv_mct
ON mv_monthly_category_totals (user_id, month, category_id);

-- Refresh helper (full view)
CREATE OR REPLACE FUNCTION refresh_mv_monthly_category_totals()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_category_totals;
END$$;