import { Suspense } from 'react'
import { SideNav } from '@/components/admin/nav'

export const metadata = { title: 'Admin', manifest: '/admin.webmanifest', appleWebApp: { capable: true, title: 'TREDO Admin' } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] md:flex">
      <Suspense fallback={<aside className="bg-[#0f1115] md:h-screen md:w-60" />}><SideNav kind="admin" /></Suspense>
      <main className="min-w-0 flex-1 p-3 pb-16 sm:p-4 md:p-7">
        <Suspense fallback={<div className="grid gap-3"><div className="h-8 w-52 animate-pulse rounded bg-neutral-200" /><div className="h-64 animate-pulse rounded-2xl bg-neutral-200" /></div>}>{children}</Suspense>
      </main>
    </div>
  )
}
