-- Live join (no cache)
CREATE OR REPLACE VIEW v_monthly_budget_vs_actual_live AS
SELECT
  b.user_id,
  b.month,
  b.category_id,
  bc.name AS category_name,
  b.amount AS budget_amount,
  COALESCE(v.expense_total, 0) AS actual_expense,
  COALESCE(v.income_total, 0) AS actual_income
FROM budgets b
LEFT JOIN v_monthly_category_totals v
  ON v.user_id = b.user_id AND v.month = b.month AND v.category_id = b.category_id
LEFT JOIN budget_categories bc ON bc.id = b.category_id;

-- Cached version over the materialized view
CREATE OR REPLACE VIEW v_monthly_budget_vs_actual AS
SELECT
  b.user_id,
  b.month,
  b.category_id,
  bc.name AS category_name,
  b.amount AS budget_amount,
  COALESCE(m.expense_total, 0) AS actual_expense,
  COALESCE(m.income_total, 0) AS actual_income
FROM budgets b
LEFT JOIN mv_monthly_category_totals m
  ON m.user_id = b.user_id AND m.month = b.month AND m.category_id = b.category_id
LEFT JOIN budget_categories bc ON bc.id = b.category_id;