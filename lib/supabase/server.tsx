import { getSupabaseServerClient } from "@supabase/ssr"

export { createServerClient } from "@supabase/ssr"

// Re-export the main function as createClient for compatibility
export const createClient = getSupabaseServerClient

// ... rest of code here ...
