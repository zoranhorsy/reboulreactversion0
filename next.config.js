/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'reboul-store-api-production.up.railway.app',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    domains: [],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    return config;
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return [
      {
        source: '/brands/:path*',
        destination: `${apiUrl}/brands/:path*`
      }
    ]
  }
}

module.exports = nextConfig

