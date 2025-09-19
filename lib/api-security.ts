import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface AuthenticatedUser {
  id: string
  email?: string
}

export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthenticatedUser | null
  error: NextResponse | null
}> {
  try {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        user: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      }
    }

    return {
      user: { id: user.id, email: user.email },
      error: null,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      user: null,
      error: NextResponse.json({ error: "Authentication failed" }, { status: 500 }),
    }
  }
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

  if (file.size > maxSize) {
    return { valid: false, error: "File too large. Maximum size is 10MB." }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed." }
  }

  return { valid: true }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= 0 && amount <= 999999.99
}
