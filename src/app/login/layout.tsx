import type { Metadata } from 'next'

// Installing the app from the login page gives the ADMIN app (opens the dashboard), not the shop app
export const metadata: Metadata = {
  title: 'Login',
  manifest: '/admin.webmanifest',
  icons: { apple: '/admin-icon-192.png' },
  appleWebApp: { capable: true, title: 'TREDO Admin', statusBarStyle: 'black' },
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
