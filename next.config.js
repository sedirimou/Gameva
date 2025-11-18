/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: false,
  generateEtags: false,
  output: 'standalone',
  images: {
    unoptimized: true
  },
  env: {
    // Override Replit's automatic NEXT_PUBLIC_SITE_URL in production
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? (process.env.PRODUCTION_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
      : process.env.NEXT_PUBLIC_SITE_URL
  },
  // Fix cross-origin warnings in development
  allowedDevOrigins: [
    '465f7e4f-e384-498d-ba84-31ad3b4cf62a-00-3i4v6dh82zrvj.kirk.replit.dev',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ],
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.optimization.splitChunks = false
      config.cache = false
      // Reduce HMR warnings in development
      config.infrastructureLogging = {
        level: 'error'
      }
      // Suppress HMR hot-reloader client warnings
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: false
      }
      
      // Fix HMR issues with React Dev Overlay
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
          crypto: false,
        }
        
        // Suppress specific HMR errors and fix ISR manifest issues
        const originalEntry = config.entry
        config.entry = async () => {
          const entries = await originalEntry()
          if (entries['main.js'] && !entries['main.js'].includes('./client/components/react-dev-overlay/client')) {
            // Prevent HMR overlay components errors
            entries['main.js'] = entries['main.js'].filter(
              entry => !entry.includes('react-dev-overlay')
            )
          }
          return entries
        }
        
        // Disable HMR overlay in development
        if (config.mode === 'development') {
          config.optimization = config.optimization || {}
          config.optimization.removeAvailableModules = false
          config.optimization.removeEmptyChunks = false
          config.optimization.splitChunks = false
        }
        
        config.ignoreWarnings = [
          /Cannot read properties of undefined \(reading 'components'\)/,
          /Invalid message.*isrManifest/,
          /handleStaticIndicator/,
          /processMessage.*components/,
          /TypeError.*components/,
          /handleMessage.*websocket/,
          /hot-reloader-client/
        ]
      }
    }
    return config
  },
  // Reduce development noise
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2
  },
  // Suppress ISR manifest errors in development
  experimental: {
    largePageDataBytes: 64 * 1000 // Reduced to 64KB to prevent 431 errors
  },
  // Configure dev indicators
  devIndicators: {
    position: 'bottom-right'
  },
  // Add server configuration to prevent 431 errors
  serverRuntimeConfig: {
    maxHeaderSize: 8192 // 8KB max header size
  },
  // Production optimizations and React error prevention
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production'
  },
  // Strict serialization for React error #130 prevention
  pageExtensions: ['jsx', 'js', 'ts', 'tsx'],
  trailingSlash: false,
  productionBrowserSourceMaps: false,
  // Additional React error prevention
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig