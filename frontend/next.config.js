/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // react-leaflet v4 ships ESM; Next 13 needs it (and its core) transpiled.
  transpilePackages: ['react-leaflet', '@react-leaflet/core'],
  compiler: {
    emotion: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  images: {
    domains: ['localhost', 'd8j0ntlcm91z4.cloudfront.net'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig
