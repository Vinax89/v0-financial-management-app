import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const AUTH_HEADER_DENYLIST = new Set(["authorization", "apikey", "x-supabase-api-key"])

type HeaderLike =
  | Iterable<[string, string]>
  | Record<string, string>
  | { forEach: (callback: (value: string, key: string) => void) => void }
  | undefined

export function stripAuthHeaders(headersInit: HeaderLike): Record<string, string> {
  if (!headersInit) {
    return {}
  }

  const sanitized: Record<string, string> = {}

  const appendIfAllowed = (key: string, value: string) => {
    const normalizedKey = key.toLowerCase()
    if (!AUTH_HEADER_DENYLIST.has(normalizedKey)) {
      sanitized[key] = value
    }
  }

  if (typeof (headersInit as { forEach?: unknown }).forEach === "function" && !Array.isArray(headersInit)) {
    ;(headersInit as { forEach: (callback: (value: string, key: string) => void) => void }).forEach(
      (value, key) => {
        appendIfAllowed(key, value)
      },
    )
    return sanitized
  }

  if (Symbol.iterator in Object(headersInit)) {
    for (const [key, value] of headersInit as Iterable<[string, string]>) {
      appendIfAllowed(key, value)
    }
    return sanitized
  }

  Object.entries(headersInit as Record<string, string>).forEach(([key, value]) => {
    appendIfAllowed(key, value)
  })

  return sanitized
}

export function getRequestHeaders() {
  return stripAuthHeaders(headers())
}

export { createServerClient } from "@supabase/ssr"

export function getSupabaseServerClient() {
  const cookieStore = cookies()
  const requestHeaders = getRequestHeaders()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: requestHeaders,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}

// Re-export the main function as createClient for compatibility
export const createClient = getSupabaseServerClient
