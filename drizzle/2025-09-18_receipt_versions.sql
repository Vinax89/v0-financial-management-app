CREATE TABLE IF NOT EXISTS receipt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  actor_user_id UUID,
  action TEXT NOT NULL DEFAULT 'update',
  before JSONB NOT NULL,
  after  JSONB NOT NULL,
  changed_keys TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE receipt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rv_owner ON receipt_versions USING (
  EXISTS (SELECT 1 FROM receipts r WHERE r.id = receipt_versions.receipt_id AND r.user_id = auth.uid())
);

-- Trigger function: capture changes on UPDATE to selected columns
CREATE OR REPLACE FUNCTION log_receipt_version() RETURNS TRIGGER AS $$
DECLARE
  v_actor UUID;
  b JSONB;
  a JSONB;
BEGIN
  v_actor := auth.uid();
  -- only track key fields; add more if needed
  b := jsonb_build_object(
    'merchant_name', OLD.merchant_name,
    'total_amount', OLD.total_amount,
    'transaction_date', OLD.transaction_date,
    'raw_text', OLD.raw_text,
    'confidence_score', OLD.confidence_score
  );
  a := jsonb_build_object(
    'merchant_name', NEW.merchant_name,
    'total_amount', NEW.total_amount,
    'transaction_date', NEW.transaction_date,
    'raw_text', NEW.raw_text,
    'confidence_score', NEW.confidence_score
  );

  INSERT INTO receipt_versions (receipt_id, actor_user_id, before, after, changed_keys)
  SELECT NEW.id, v_actor, b, a,
    ARRAY(
      SELECT key FROM (
        SELECT key, (b->>key) AS ob, (a->>key) AS na
        FROM (VALUES ('merchant_name'),('total_amount'),('transaction_date'),('raw_text'),('confidence_score')) AS keys(key)
      ) t
      WHERE t.ob IS DISTINCT FROM t.na
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_receipts_version ON receipts;
CREATE TRIGGER trg_receipts_version
AFTER UPDATE ON receipts
FOR EACH ROW
WHEN (OLD IS DISTINCT FROM NEW)
EXECUTE FUNCTION log_receipt_version();
