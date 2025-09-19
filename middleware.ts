import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { apiLimiter, authLimiter } from "@/lib/rate-limit"
import { securityHeaders } from "@/lib/security-utils"
import { randomUUID } from 'node:crypto'

export async function middleware(request: NextRequest) {
  const { pathname: path } = request.nextUrl
  const ip = request.ip ?? "127.0.0.1"
  const rid = request.headers.get('x-request-id') || randomUUID()

  // Rate limit API and auth routes
  const isAuth = path.startsWith("/api/auth") || path.startsWith("/api/plaid")
  const limiter = isAuth ? authLimiter : apiLimiter
  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    const res = new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
    res.headers.set('x-request-id', rid)
    return res
  }

  // Maintain session
  const response = await updateSession(request)
  response.headers.set('x-request-id', rid)

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Block suspicious requests
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /hack/i, /exploit/i]

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    console.log(`[Security] Blocked suspicious request from ${ip}: ${userAgent}`)
    const res = new NextResponse("Forbidden", { status: 403 })
    res.headers.set('x-request-id', rid)
    return res
  }

  // Validate request size
  const contentLength = request.headers.get("content-length")
  const isUpload = path.startsWith('/api/receipts/upload')
  if (!isUpload && contentLength && Number.parseInt(contentLength) > 1024 * 1024) {
    const res = new NextResponse("Request Too Large", { status: 413 })
    res.headers.set('x-request-id', rid)
    return res
  }

  return response
}

export const config = {
  matcher: [
    // Protect only app & api, but skip public/static assets and Next internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public/).*)',
  ],
}
