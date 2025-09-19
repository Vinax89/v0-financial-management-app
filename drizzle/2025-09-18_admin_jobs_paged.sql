-- Reuse assert_admin() from prior patches
CREATE OR REPLACE FUNCTION admin_count_export_jobs()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM assert_admin();
  RETURN (
    SELECT count(*) FROM export_jobs WHERE dead_letter = TRUE OR status = 'error'
  );
END; $$;
GRANT EXECUTE ON FUNCTION admin_count_export_jobs() TO authenticated;

CREATE OR REPLACE FUNCTION admin_list_export_jobs_paged(p_limit INT, p_offset INT)
RETURNS SETOF export_jobs LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM assert_admin();
  RETURN QUERY
    SELECT * FROM export_jobs
    WHERE dead_letter = TRUE OR status = 'error'
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END; $$;
GRANT EXECUTE ON FUNCTION admin_list_export_jobs_paged(INT, INT) TO authenticated;