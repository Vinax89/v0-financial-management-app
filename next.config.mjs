/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: process.env.CI ? false : true },
  typescript: { ignoreBuildErrors: process.env.CI ? false : true },
}
export default nextConfig
