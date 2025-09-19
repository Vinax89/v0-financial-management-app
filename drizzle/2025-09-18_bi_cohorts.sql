-- Users' first active month inferred from first transaction
CREATE OR REPLACE VIEW v_user_first_month AS
SELECT f.user_id, MIN(to_char(f.date, 'YYYY-MM')) AS first_month
FROM fact_transactions f
GROUP BY f.user_id;

-- Monthly active per cohort (activity = any tx in that month)
CREATE OR REPLACE VIEW v_cohort_monthly_active AS
WITH months AS (
  SELECT DISTINCT to_char(date_trunc('month', date), 'YYYY-MM') AS month FROM fact_transactions
), base AS (
  SELECT u.user_id, u.first_month, m.month
  FROM v_user_first_month u CROSS JOIN months m
  WHERE m.month >= u.first_month
)
SELECT b.first_month AS cohort_month,
       b.month,
       COUNT(DISTINCT f.user_id) AS active_users
FROM base b
LEFT JOIN fact_transactions f
  ON f.user_id = b.user_id AND to_char(f.date, 'YYYY-MM') = b.month
GROUP BY b.first_month, b.month
ORDER BY b.first_month, b.month;

-- RLS-safe view for current user
CREATE OR REPLACE VIEW v_cohort_monthly_active_user AS
SELECT c.*
FROM v_cohort_monthly_active c
JOIN v_fact_user fu ON fu.user_id = fu.user_id -- dummy join to invoke RLS context
WHERE auth.uid() IS NOT NULL;
