import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: process.env.CI ? false : true },
  typescript: { ignoreBuildErrors: process.env.CI ? false : true },
  images: {
    // NEVER wildcard here. Enumerate.
    domains: [
      'cdn.plaid.com',
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co').hostname,
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.plaid.com' },
    ],
    // prevent SVG content injection through image optimizer
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  disableLogger: true,
  // Fixed path simplifies CDN/proxy rules
  tunnelRoute: "/monitoring",
  // Tie releases to commit for de‑obfuscation
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
})