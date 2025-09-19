// Ensure this file can never be imported by a Client Component
import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function getSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(all) {
        try {
          all.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}

export const createClient = getSupabaseServerClient
