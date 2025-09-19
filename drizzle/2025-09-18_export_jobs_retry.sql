ALTER TABLE export_jobs
  ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_attempts INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dead_letter BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_export_jobs_retry ON export_jobs(status, next_attempt_at NULLS FIRST, created_at);
