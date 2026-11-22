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
  async headers() {
    const base = [
      { key: 'X-Frame-Options', value: 'DENY' }, // no clickjacking (site can't be put inside another site)
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    ]
    const priv = [...base, { key: 'Cache-Control', value: 'no-store, private' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    return [
      { source: '/:path*', headers: base },
      { source: '/admin/:path*', headers: priv },
      { source: '/reseller/:path*', headers: priv },
      { source: '/login', headers: priv },
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: '8mb' }, // for photo uploads
  },
}

export default nextConfig
