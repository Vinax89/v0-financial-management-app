-- Enable RLS
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_rules ENABLE ROW LEVEL SECURITY;

-- Policies: owner-only by user_id
CREATE POLICY bc_owner ON budget_categories USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY b_owner  ON budgets           USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY cr_owner ON category_rules    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bc_touch BEFORE UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_b_touch  BEFORE UPDATE ON budgets           FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_cr_touch BEFORE UPDATE ON category_rules    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_b_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_bc_user_name ON budget_categories(user_id, name);