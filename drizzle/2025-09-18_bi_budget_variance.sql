CREATE OR REPLACE VIEW v_budget_variance AS
SELECT
  b.user_id,
  b.month,
  b.category_id,
  COALESCE(bc.name, 'Uncategorized') AS category_name,
  b.amount AS budget_amount,
  COALESCE(m.expense_total, 0) AS actual_expense,
  (COALESCE(m.expense_total, 0) - b.amount) AS variance
FROM budgets b
LEFT JOIN v_monthly_category_totals m
  ON m.user_id = b.user_id AND m.month = b.month AND m.category_id = b.category_id
LEFT JOIN budget_categories bc ON bc.id = b.category_id;

CREATE OR REPLACE VIEW v_budget_variance_user AS
SELECT v.* FROM v_budget_variance v
JOIN v_fact_user fu ON fu.user_id = v.user_id
WHERE auth.uid() = v.user_id;
