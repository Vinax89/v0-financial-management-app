import { ContentSecurityPolicy } from 'next/dist/server/web/spec-extension/content-security-policy'

// Strictest CSP with mitigations for Next.js, etc.
//
// THIS IS A BIG HAMMER. We may need to dial this down later.
//
// For example, if we want to allow images from a particular CDN,
// we would need to add that CDN to the `img-src` directive.
const csp: ContentSecurityPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Next.js requires 'unsafe-eval' in dev
  'style-src': ["'self'", "'unsafe-inline'"], // NextUI requires 'unsafe-inline'
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': [],
}

// In dev, Next.js needs a more permissive CSP.
// This is not ideal, but it's a trade-off for now.
if (process.env.NODE_ENV === 'development') {
  csp['script-src'] = ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
  csp['style-src'] = ["'self'", "'unsafe-inline'"]
}

// Browsers may still not support the full CSP spec, so we need to serialize it.
export const contentSecurityPolicy = Object.entries(csp)
  .map(([key, value]) => {
    if (value.length > 0) return `${key} ${value.join(' ')}`
    return key
  })
  .join('; ')

// We can't use nonce with Next.js App Router yet, so we have to use hashes.
// It's a bit of a pain, but it's the best we can do for now.
//
// We should re-evaluate this when Next.js supports nonces in App Router.
//
// const POLICY_NONCE = crypto.randomUUID()

// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
// for more information on these headers.
export const securityHeaders = {
  // Mitigate XSS attacks, etc.
  // This is a big hammer. We may need to dial this down later.
  'Content-Security-Policy': contentSecurityPolicy,

  // Don't leak referrer information.
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Prevent clickjacking.
  'X-Frame-Options': 'DENY',

  // Prevent content type sniffing.
  'X-Content-Type-Options': 'nosniff',

  // Only allow features in the current document.
  // This is a big hammer. We may need to dial this down later.
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Communicate to the browser that we prefer HTTPS.
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}
