-- Access grants
CREATE TABLE IF NOT EXISTS filter_preset_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id UUID NOT NULL REFERENCES filter_presets(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grantee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (preset_id, grantee_user_id)
);

ALTER TABLE filter_preset_access ENABLE ROW LEVEL SECURITY;

-- Owners and grantees may read; only owners may write
CREATE POLICY fpa_select ON filter_preset_access
  FOR SELECT USING (auth.uid() = owner_user_id OR auth.uid() = grantee_user_id);
CREATE POLICY fpa_write ON filter_preset_access
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- SECURITY DEFINER func: owner shares preset to a user by email
CREATE OR REPLACE FUNCTION share_preset_to_user(p_preset_id UUID, p_grantee_email TEXT, p_can_edit BOOLEAN DEFAULT false)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_owner UUID; v_grantee UUID; v_id UUID;
BEGIN
  -- Verify caller owns the preset
  SELECT user_id INTO v_owner FROM filter_presets WHERE id = p_preset_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'preset not found'; END IF;
  IF v_owner <> auth.uid() THEN RAISE EXCEPTION 'forbidden'; END IF;

  -- Resolve email to user id (requires definer privileges to read auth.users)
  SELECT id INTO v_grantee FROM auth.users WHERE lower(email) = lower(p_grantee_email) LIMIT 1;
  IF v_grantee IS NULL THEN RAISE EXCEPTION 'user not found'; END IF;

  INSERT INTO filter_preset_access (preset_id, owner_user_id, grantee_user_id, can_edit)
  VALUES (p_preset_id, v_owner, v_grantee, COALESCE(p_can_edit, false))
  ON CONFLICT (preset_id, grantee_user_id) DO UPDATE SET can_edit = EXCLUDED.can_edit
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION share_preset_to_user(UUID, TEXT, BOOLEAN) TO authenticated;

-- Union view: presets I own or that are shared with me
CREATE OR REPLACE VIEW v_presets_accessible AS
  SELECT p.id, p.user_id, p.scope, p.name, p.params, p.updated_at, 'owner'::text AS role
    FROM filter_presets p
    WHERE p.user_id = auth.uid()
  UNION ALL
  SELECT p.id, p.user_id, p.scope, p.name, p.params, p.updated_at, 'grantee'::text AS role
    FROM filter_presets p
    JOIN filter_preset_access a ON a.preset_id = p.id
   WHERE a.grantee_user_id = auth.uid();