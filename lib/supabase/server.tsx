import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import type { CookieMethodsServer } from "@supabase/ssr"
import { cookies } from "next/headers"

function createSupabaseServerCookies(): CookieMethodsServer {
  const cookieStore = cookies()

  return {
    getAll() {
      return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set({ name, value, ...options })
      })
    },
  }
}

export function createServerClient() {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: createSupabaseServerCookies(),
    },
  )
}

// Re-export the main function as createClient for compatibility
export const createClient = createServerClient
