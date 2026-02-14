import type { NextConfig } from 'next';

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
};

export default nextConfig;
