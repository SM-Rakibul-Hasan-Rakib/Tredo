import type { OrderSource, OrderStatus } from '@/lib/types'

/** Small product photo for order lists (👟 if no photo / product deleted) */
export function Thumb({ src, size = 40 }: { src?: string | null; size?: number }) {
  return (
    <span className="relative inline-grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-neutral-100 text-base" style={{ width: size, height: size }}>
      {/* plain img: works with any photo link (Supabase, Facebook, etc.) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : '👟'}
    </span>
  )
}
export const itemImg = (i: { product?: { images: string[] } | null }) => i.product?.images?.[0] ?? null

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-[22px] font-semibold">{title}</h1>{sub && <p className="mt-0.5 text-[13px] text-neutral-500">{sub}</p>}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
export function Kpi({ k, v, d }: { k: string; v: React.ReactNode; d?: React.ReactNode }) {
  return <div className="card"><p className="text-[12.5px] font-medium text-neutral-500">{k}</p><p className="mt-1.5 text-2xl font-bold tracking-tight">{v}</p>{d && <p className="mt-1 text-xs text-neutral-500">{d}</p>}</div>
}
const S: Record<OrderStatus, string> = { Pending: 'bg-amber-100 text-amber-800', Confirmed: 'bg-blue-100 text-blue-800', Shipped: 'bg-violet-100 text-violet-800', Delivered: 'bg-green-100 text-green-800', Returned: 'bg-red-100 text-red-800', Cancelled: 'bg-neutral-100 text-neutral-600' }
export const StatusBadge = ({ s }: { s: OrderStatus }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${S[s]}`}>{s}</span>
const C: Record<OrderSource, string> = { Messenger: 'bg-sky-100 text-sky-700', WhatsApp: 'bg-green-100 text-green-700', Website: 'bg-orange-100 text-orange-700', Reseller: 'bg-purple-100 text-purple-700', Other: 'bg-neutral-100 text-neutral-600' }
export const SourceBadge = ({ s }: { s: OrderSource }) => <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${C[s]}`}>{s}</span>
export const Row = ({ l, v, cls = '' }: { l: React.ReactNode; v: React.ReactNode; cls?: string }) => (
  <div className={`flex justify-between border-b border-dashed border-line py-2 text-sm last:border-0 ${cls}`}><span>{l}</span><span>{v}</span></div>
)
