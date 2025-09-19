ALTER TABLE filter_presets ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE export_jobs   ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- RLS: a preset/job is readable if user owns it OR is member of its workspace
CREATE POLICY fp_ws_read ON filter_presets
  FOR SELECT USING (
    user_id = auth.uid()
    OR (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members m WHERE m.workspace_id = filter_presets.workspace_id AND m.user_id = auth.uid()))
  );
CREATE POLICY fp_ws_write ON filter_presets
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      workspace_id IS NULL OR EXISTS (
        SELECT 1 FROM workspace_members m WHERE m.workspace_id = filter_presets.workspace_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
      )
    )
  );
CREATE POLICY fp_ws_update ON filter_presets
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ej_ws_read ON export_jobs
  FOR SELECT USING (
    user_id = auth.uid()
    OR (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members m WHERE m.workspace_id = export_jobs.workspace_id AND m.user_id = auth.uid()))
  );