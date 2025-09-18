import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: process.env.CI ? false : true },
  typescript: { ignoreBuildErrors: process.env.CI ? false : true },
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