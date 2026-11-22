import { Suspense } from 'react'
import { SideNav } from '@/components/admin/nav'
import { SessionGuard } from '@/components/admin/session-guard'
import { IDLE_MS } from '@/lib/admin-session'

export const metadata = { title: 'Reseller' }

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] lg:flex">
      <SessionGuard idleMs={IDLE_MS} />
      <Suspense fallback={<aside className="bg-[#0f1115] lg:h-screen lg:w-60" />}><SideNav kind="reseller" /></Suspense>
      <main className="min-w-0 flex-1 p-3 pb-20 sm:p-4 lg:p-7"><div className="mx-auto w-full max-w-[1600px]"><Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />}>{children}</Suspense></div></main>
    </div>
  )
}
