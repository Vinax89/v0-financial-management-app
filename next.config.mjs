// next.config.mjs
const isCI = process.env.CI === 'true'
export default {
  eslint: { ignoreDuringBuilds: !isCI ? true : false },
  typescript: { ignoreBuildErrors: !isCI ? true : false },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[/\\]node_modules[/\\]/,
            name: 'vendors',
            chunks: 'all',
          },
          ui: {
            test: /[/\\]node_modules[/\\]@radix-ui[/\\]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 10,
          },
          charts: {
            test: /[/\\]node_modules[/\\]recharts[/\\]/,
            name: 'charts',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }

    // Optimize imports for faster compilation
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-icons': '@radix-ui/react-icons/dist/index.js',
    }

    return config
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
}
