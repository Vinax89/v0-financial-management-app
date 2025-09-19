import "server-only"
import { getSupabaseServerClient } from "./supabase/server.js"

export async function getPerfStats() {
  const supabase = getSupabaseServerClient()

  try {
    // Get basic performance stats
    const { data, error } = await supabase.rpc("get_perf_stats")

    if (error) {
      console.error("Error fetching performance stats:", error)
      return { cached: 0, hints: 0 }
    }

    return data || { cached: 0, hints: 0 }
  } catch (error) {
    console.error("Failed to get performance stats:", error)
    return { cached: 0, hints: 0 }
  }
}

export async function getDbHints() {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase.rpc("get_db_hints")

    if (error) {
      console.error("Error fetching database hints:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Failed to get database hints:", error)
    return []
  }
}
