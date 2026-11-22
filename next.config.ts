import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true, // fast: pages are prerendered + cached, updated on demand
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' },
    },
  },
  images: {
    // product photos come from Supabase Storage
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: { bodySizeLimit: '8mb' }, // for photo uploads
  },
}

export default nextConfig
