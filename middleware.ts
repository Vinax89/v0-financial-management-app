import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { apiLimiter, authLimiter } from "@/lib/rate-limit"
import { securityHeaders } from "@/lib/security-utils"

export async function middleware(request: NextRequest) {
  const { pathname: path } = request.nextUrl
  const ip = request.ip ?? "127.0.0.1"

  // Rate limit API and auth routes
  const isAuth = path.startsWith("/api/auth") || path.startsWith("/api/plaid")
  const limiter = isAuth ? authLimiter : apiLimiter
  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  }

  // Maintain session
  const response = await updateSession(request)

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Block suspicious requests
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /hack/i, /exploit/i]

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    console.log(`[Security] Blocked suspicious request from ${ip}: ${userAgent}`)
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Validate request size
  const contentLength = request.headers.get("content-length")
  if (contentLength && Number.parseInt(contentLength) > 1024 * 1024) {
    // 1MB limit
    return new NextResponse("Request Too Large", { status: 413 })
  }

  return response
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
