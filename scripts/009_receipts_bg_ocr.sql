-- Add operational columns to receipts
ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS thumb_path TEXT,
  ADD COLUMN IF NOT EXISTS ocr_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ocr_error TEXT,
  ADD COLUMN IF NOT EXISTS ocr_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ocr_finished_at TIMESTAMPTZ;

-- Background OCR jobs table
CREATE TYPE receipt_job_status AS ENUM ('queued','processing','done','error');

CREATE TABLE IF NOT EXISTS receipt_ocr_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status receipt_job_status NOT NULL DEFAULT 'queued',
  attempts INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

ALTER TABLE receipt_ocr_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY roj_owner ON receipt_ocr_jobs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- This function already exists from 007, but including it here is fine
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_receipt_jobs_touch BEFORE UPDATE ON receipt_ocr_jobs FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_roj_status_next ON receipt_ocr_jobs(status, next_attempt_at NULLS FIRST, created_at);
