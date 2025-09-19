CREATE TABLE IF NOT EXISTS filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL, -- e.g., 'transactions','budget','cashflow'
  name TEXT NOT NULL,
  params JSONB NOT NULL, -- querystring-ish e.g., {month:'2025-09', categoryIds:[...], amountMode:'absolute'}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope, name)
);

ALTER TABLE filter_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY filter_presets_owner ON filter_presets
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fp_user_scope ON filter_presets(user_id, scope);

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fp_touch BEFORE UPDATE ON filter_presets FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
