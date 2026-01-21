import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@crafted/api',
    '@crafted/ui',
    '@crafted/auth',
    '@crafted/payments',
    '@crafted/emails',
    '@crafted/services',
    '@crafted/validators',
  ],
  serverExternalPackages: ['@prisma/client', '@crafted/database'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;
