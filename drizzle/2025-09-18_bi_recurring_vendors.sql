-- Parameter-free utility view over last 180 days
CREATE OR REPLACE VIEW v_recurring_vendors_180d AS
SELECT
  f.user_id,
  COALESCE(NULLIF(trim(lower(f.merchant_name)), ''), trim(lower(f.name))) AS vendor_key,
  MIN(f.date) AS first_seen,
  MAX(f.date) AS last_seen,
  COUNT(*) AS tx_count,
  SUM(CASE WHEN f.amount > 0 THEN f.amount ELSE 0 END) AS total_spend,
  AVG(CASE WHEN f.amount > 0 THEN f.amount ELSE NULL END) AS avg_spend
FROM fact_transactions f
WHERE f.date >= (current_date - INTERVAL '180 days')
GROUP BY f.user_id, vendor_key
HAVING COUNT(*) >= 3          -- tweak threshold here
ORDER BY user_id, tx_count DESC;

CREATE OR REPLACE VIEW v_recurring_vendors_user AS
SELECT rv.*
FROM v_recurring_vendors_180d rv
JOIN v_fact_user fu ON fu.user_id = rv.user_id
WHERE auth.uid() = rv.user_id;
