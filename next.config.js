/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration SWC (compilateur par défaut de Next.js, plus rapide que Babel)
  swcMinify: true,
  compiler: {
    // Voir https://nextjs.org/docs/advanced-features/compiler
    styledComponents: false, // Désactivé par défaut
    // Pas de configuration Babel, utilise uniquement SWC
  },
  // Configuration pour le mode hybride (Pages Router + App Router)
  experimental: {
    // Les Server Actions sont maintenant activés par défaut
    esmExternals: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    serverComponentsExternalPackages: ['axios'],
    missingSuspenseWithCSRError: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'reboul.fr'],
    },
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
  },
  // S'assurer que les API routes fonctionnent correctement
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com', 'images.unsplash.com', 'plus.unsplash.com', 'images.pexels.com'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    
    config.module.rules.push({
      test: /route\.js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });
    
    return config;
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*',
  //     },
  //   ]
  // },
  // Configuration pour les routes dynamiques
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
  output: 'standalone',
  typescript: {
    // Ignorer les erreurs TypeScript temporairement pour le build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignorer les erreurs ESLint temporairement pour le build
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

