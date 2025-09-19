CREATE TABLE IF NOT EXISTS filter_preset_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id UUID NOT NULL REFERENCES filter_presets(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  params JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE filter_preset_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY fps_owner ON filter_preset_shares USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- SECURITY DEFINER function to redeem a token into the caller's presets
CREATE OR REPLACE FUNCTION redeem_preset_share(p_token UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_row filter_preset_shares%ROWTYPE; v_uid UUID; v_new_id UUID;
BEGIN
  -- Require auth
  SELECT auth.uid() INTO v_uid; IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  -- Fetch share without RLS (definer runs with elevated privileges)
  SELECT * INTO v_row FROM filter_preset_shares WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid token'; END IF;
  IF v_row.expires_at IS NOT NULL AND v_row.expires_at < now() THEN RAISE EXCEPTION 'expired token'; END IF;
  IF v_row.used_count >= v_row.max_uses THEN RAISE EXCEPTION 'token exhausted'; END IF;

  INSERT INTO filter_presets (user_id, scope, name, params)
  VALUES (v_uid, 'transactions', v_row.name, v_row.params)
  RETURNING id INTO v_new_id;

  UPDATE filter_preset_shares SET used_count = used_count + 1 WHERE id = v_row.id;
  RETURN v_new_id;
END;
$$;
GRANT EXECUTE ON FUNCTION redeem_preset_share(UUID) TO anon, authenticated;
