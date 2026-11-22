import type { Metadata, Viewport } from 'next'
import { Outfit, Hind_Siliguri } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })
const bangla = Hind_Siliguri({ subsets: ['bengali'], weight: ['400', '500', '600'], variable: '--font-bangla', display: 'swap' })

export const metadata: Metadata = {
  title: { default: `${process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'} — Premium Sneakers in Bangladesh`, template: `%s | ${process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'}` },
  appleWebApp: { capable: true, title: process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO', statusBarStyle: 'default' },
  description: 'Nike Air Force 1, Jordan, Adidas, New Balance & running shoes. Cash on delivery all over Bangladesh.',
}
export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bangla.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
