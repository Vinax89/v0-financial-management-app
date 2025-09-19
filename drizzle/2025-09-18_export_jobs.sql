CREATE TYPE export_job_status AS ENUM ('queued','processing','done','error');

CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,                 -- e.g. 'transactions'
  params JSONB NOT NULL,               -- same shape as presets
  status export_job_status NOT NULL DEFAULT 'queued',
  result_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY export_jobs_owner ON export_jobs
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_export_jobs_touch BEFORE UPDATE ON export_jobs FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_export_jobs_user_status ON export_jobs(user_id, status, created_at DESC);
