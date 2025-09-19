CREATE OR REPLACE VIEW v_tx_denorm AS
SELECT
  t.id,
  i.user_id,
  t.date,
  t.amount,
  ABS(t.amount) AS abs_amount,
  t.pending,
  t.account_id,
  t.transaction_id,
  t.name,
  t.merchant_name,
  t.category_id,
  bc.name AS category_name,
  to_char(t.date, 'YYYY-MM') AS month,
  GREATEST(t.amount, 0) AS expense_amount,
  GREATEST(-t.amount, 0) AS income_amount
FROM plaid_transactions t
JOIN plaid_items i ON i.id = t.plaid_item_id
LEFT JOIN budget_categories bc ON bc.id = t.category_id;

-- helpful index if abs filters are frequent
CREATE INDEX IF NOT EXISTS idx_pt_abs_amount ON plaid_transactions((ABS(amount)));