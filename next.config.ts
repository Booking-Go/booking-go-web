import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // Warnings don't fail the production build
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Proxy API calls through Next.js — no CORS, no exposed backend URL
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
