import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { securityHeaders, rateLimiter } from "@/lib/security-utils"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const authResponse = await updateSession(request)

  // Apply security headers to the auth response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    authResponse.headers.set(key, value)
  })

  // Rate limiting
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  if (!rateLimiter.isAllowed(clientIP)) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  // Block suspicious requests
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /hack/i, /exploit/i]

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    console.log(`[Security] Blocked suspicious request from ${clientIP}: ${userAgent}`)
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Validate request size
  const contentLength = request.headers.get("content-length")
  if (contentLength && Number.parseInt(contentLength) > 1024 * 1024) {
    // 1MB limit
    return new NextResponse("Request Too Large", { status: 413 })
  }

  return authResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
