-- scripts/006_create_plaid_integration_schema.sql (replace file)
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL, -- encrypt at rest
  institution_id TEXT,
  institution_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  available_products TEXT[],
  billed_products TEXT[],
  consent_expiration_time TIMESTAMPTZ,
  update_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plaid_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_item_id UUID NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  official_name TEXT,
  type TEXT NOT NULL,
  subtype TEXT,
  mask TEXT,
  verification_status TEXT,
  available_balance NUMERIC(12,2),
  current_balance NUMERIC(12,2),
  limit_amount NUMERIC(12,2),
  iso_currency_code CHAR(3) DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plaid_item_id, account_id)
);

CREATE TABLE IF NOT EXISTS plaid_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_item_id UUID NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  pending BOOLEAN DEFAULT false,
  amount NUMERIC(12,2) NOT NULL,
  iso_currency_code CHAR(3) DEFAULT 'USD',
  date DATE NOT NULL,
  authorized_date DATE,
  name TEXT,
  merchant_name TEXT,
  category TEXT[],
  personal_finance_category_primary TEXT,
  personal_finance_category_detailed TEXT,
  payment_channel TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY plaid_items_owner ON plaid_items USING (auth.uid() = user_id);
CREATE POLICY plaid_accounts_items ON plaid_accounts USING (
  EXISTS (SELECT 1 FROM plaid_items i WHERE i.id = plaid_item_id AND i.user_id = auth.uid())
);
CREATE POLICY plaid_tx_items ON plaid_transactions USING (
  EXISTS (SELECT 1 FROM plaid_items i WHERE i.id = plaid_item_id AND i.user_id = auth.uid())
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_pi_touch BEFORE UPDATE ON plaid_items FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_pa_touch BEFORE UPDATE ON plaid_accounts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_pt_touch BEFORE UPDATE ON plaid_transactions FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_pt_item_date ON plaid_transactions(plaid_item_id, date DESC);
