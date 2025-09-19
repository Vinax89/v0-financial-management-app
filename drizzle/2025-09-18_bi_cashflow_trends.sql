-- Monthly net (income - expense) per user
CREATE OR REPLACE VIEW v_monthly_net_cashflow AS
SELECT
  user_id,
  to_char(date_trunc('month', date), 'YYYY-MM') AS month,
  SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) AS income_total,
  SUM(CASE WHEN amount > 0 THEN  amount ELSE 0 END) AS expense_total,
  SUM(-amount) AS net_cashflow -- negative amounts are income by Plaid's convention; flip sign
FROM fact_transactions
GROUP BY user_id, to_char(date_trunc('month', date), 'YYYY-MM');

-- Rolling 3-month net average
CREATE OR REPLACE VIEW v_monthly_net_cashflow_rolling AS
SELECT user_id,
       month,
       income_total,
       expense_total,
       net_cashflow,
       ROUND(AVG(net_cashflow) OVER (
         PARTITION BY user_id
         ORDER BY month
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       )::numeric, 2) AS net_cashflow_avg_3m
FROM v_monthly_net_cashflow;

-- Top categories by expense for each month (top 5)
CREATE OR REPLACE VIEW v_monthly_top_categories AS
SELECT user_id, month, category_id, category_name,
       SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS expense_total,
       ROW_NUMBER() OVER (PARTITION BY user_id, month ORDER BY SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) DESC) AS rn
FROM v_tx_denorm
GROUP BY user_id, month, category_id, category_name
HAVING SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) > 0
;

-- RLS-safe wrappers
CREATE OR REPLACE VIEW v_monthly_net_cashflow_user AS
SELECT n.* FROM v_monthly_net_cashflow n
JOIN v_fact_user fu ON fu.user_id = n.user_id
WHERE auth.uid() = n.user_id;

CREATE OR REPLACE VIEW v_monthly_net_cashflow_rolling_user AS
SELECT r.* FROM v_monthly_net_cashflow_rolling r
JOIN v_fact_user fu ON fu.user_id = r.user_id
WHERE auth.uid() = r.user_id;

CREATE OR REPLACE VIEW v_monthly_top_categories_user AS
SELECT t.* FROM v_monthly_top_categories t
JOIN v_fact_user fu ON fu.user_id = t.user_id
WHERE auth.uid() = t.user_id AND t.rn <= 5;
