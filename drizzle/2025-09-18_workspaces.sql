-- Roles
CREATE TYPE workspace_role AS ENUM ('owner','admin','member');

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Members
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Active workspace per user (optional convenience)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS active_workspace_id UUID;
ALTER TABLE user_profiles
  ADD CONSTRAINT fk_active_ws FOREIGN KEY (active_workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policies: owners can read/write their workspace, members can read; admins can rename
CREATE POLICY ws_owner_rw ON workspaces
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY ws_member_read ON workspaces
  FOR SELECT USING (
    owner_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM workspace_members m WHERE m.workspace_id = workspaces.id AND m.user_id = auth.uid())
  );

CREATE POLICY wsm_self ON workspace_members
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_user_id = auth.uid()));

-- SECURITY DEFINER: invite by email
CREATE OR REPLACE FUNCTION workspace_invite_by_email(p_workspace UUID, p_email TEXT, p_role workspace_role DEFAULT 'member')
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_owner UUID; v_user UUID; v_role workspace_role; v_is_owner BOOLEAN;
BEGIN
  SELECT owner_user_id INTO v_owner FROM workspaces WHERE id = p_workspace;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'workspace not found'; END IF;
  IF v_owner <> auth.uid() THEN
    -- allow admins to invite
    PERFORM 1 FROM workspace_members WHERE workspace_id = p_workspace AND user_id = auth.uid() AND role IN ('owner','admin');
    IF NOT FOUND THEN RAISE EXCEPTION 'forbidden'; END IF;
  END IF;

  SELECT id INTO v_user FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF v_user IS NULL THEN RAISE EXCEPTION 'user not found'; END IF;

  v_role := COALESCE(p_role, 'member');
  INSERT INTO workspace_members(workspace_id, user_id, role)
    VALUES (p_workspace, v_user, v_role)
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;
END; $$;
GRANT EXECUTE ON FUNCTION workspace_invite_by_email(UUID, TEXT, workspace_role) TO authenticated;

-- View: my workspaces with role
CREATE OR REPLACE VIEW v_my_workspaces AS
  SELECT w.id, w.name, w.owner_user_id, 'owner'::workspace_role AS role
  FROM workspaces w WHERE w.owner_user_id = auth.uid()
  UNION ALL
  SELECT w.id, w.name, w.owner_user_id, m.role
  FROM workspaces w JOIN workspace_members m ON m.workspace_id = w.id
  WHERE m.user_id = auth.uid();