import { Suspense } from 'react'
import { SideNav } from '@/components/admin/nav'
import { SessionGuard } from '@/components/admin/session-guard'
import { IDLE_MS } from '@/lib/admin-session'

export const metadata = { title: 'Admin', manifest: '/admin.webmanifest', appleWebApp: { capable: true, title: 'TREDO Admin' } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] lg:flex">
      <SessionGuard idleMs={IDLE_MS} />
      <Suspense fallback={<aside className="bg-[#0f1115] lg:h-screen lg:w-60" />}><SideNav kind="admin" /></Suspense>
      <main className="min-w-0 flex-1 p-3 pb-20 sm:p-4 lg:p-7"><div className="mx-auto w-full max-w-[1600px]">
        <Suspense fallback={<div className="grid gap-3"><div className="h-8 w-52 animate-pulse rounded bg-neutral-200" /><div className="h-64 animate-pulse rounded-2xl bg-neutral-200" /></div>}>{children}</Suspense>
      </div></main>
    </div>
  )
}
