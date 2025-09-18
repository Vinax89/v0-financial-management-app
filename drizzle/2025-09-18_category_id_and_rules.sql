-- 1) Add category_id to plaid_transactions for first-party classification
ALTER TABLE plaid_transactions
  ADD COLUMN IF NOT EXISTS category_id UUID NULL;

-- Reference (optional) to budget_categories; comment out if you avoid FK across schemas
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_plaid_tx_category') THEN
    ALTER TABLE plaid_transactions
      ADD CONSTRAINT fk_plaid_tx_category FOREIGN KEY (category_id)
      REFERENCES budget_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2) Helpful indices
CREATE INDEX IF NOT EXISTS idx_pt_category_id ON plaid_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_pt_name_lwr ON plaid_transactions((lower(name)));
CREATE INDEX IF NOT EXISTS idx_pt_merchant_lwr ON plaid_transactions((lower(merchant_name)));

-- 3) Fast path ILIKE match via lowercase (no pg_trgm required)
CREATE OR REPLACE FUNCTION apply_category_rules(p_limit int DEFAULT 1000)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE v_count INTEGER := 0; BEGIN
  WITH candidates AS (
    SELECT t.id, r.category_id
    FROM plaid_transactions t
    JOIN plaid_items i ON i.id = t.plaid_item_id
    JOIN category_rules r ON r.user_id = i.user_id AND r.active
    WHERE t.category_id IS NULL
      AND (
        (t.name IS NOT NULL AND lower(t.name) LIKE '%' || lower(r.pattern) || '%') OR
        (t.merchant_name IS NOT NULL AND lower(t.merchant_name) LIKE '%' || lower(r.pattern) || '%')
      )
    LIMIT p_limit
  ), updated AS (
    UPDATE plaid_transactions t
    SET category_id = c.category_id, updated_at = now()
    FROM candidates c WHERE t.id = c.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM updated;
  RETURN COALESCE(v_count, 0);
END $$;