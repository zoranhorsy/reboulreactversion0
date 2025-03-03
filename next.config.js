/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'reboul-store-api-production.up.railway.app',
        pathname: '/brands/**'
      }
    ],
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

