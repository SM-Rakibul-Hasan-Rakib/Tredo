import type { MetadataRoute } from 'next'

/** Makes the website installable as a phone app (Android/iPhone "Add to Home Screen") */
export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'
  return {
    id: '/',
    name: `${name} — Premium Sneakers`,
    short_name: name,
    description: 'Sneakers in Bangladesh — Cash on Delivery',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
