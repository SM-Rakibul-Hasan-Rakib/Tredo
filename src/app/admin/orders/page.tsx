import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { listOrders, listResellers } from '@/lib/admin-data'
import { counts, orderMoney } from '@/lib/profit'
import { orderNo, shortDate, tk } from '@/lib/format'
import { SOURCES, STATUSES } from '@/lib/types'
import { PageHead, SourceBadge } from '@/components/admin/ui'
import { StatusSelect } from '@/components/admin/status-select'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteOrder } from '@/app/actions/admin'
import { Pencil } from 'lucide-react'

const delMsg = (o: { id: number; customer_name: string; status: string }) =>
  `Order ${orderNo(o.id)} (${o.customer_name}) delete korbe?\n${['Cancelled', 'Returned'].includes(o.status) ? '' : 'Product gulo stock e ferot jabe.\n'}Eta ar ferot ana jabe na.`

export default async function Orders({ searchParams }: { searchParams: Promise<{ q?: string; src?: string; st?: string }> }) {
  await requireAdmin()
  const sp = await searchParams
  const [all, resellers] = await Promise.all([listOrders(), listResellers()])
  const q = (sp.q ?? '').toLowerCase()
  const list = all.filter((o) => (!sp.src || o.source === sp.src) && (!sp.st || o.status === sp.st) && (!q || `${o.customer_name} ${o.phone} ${orderNo(o.id)}`.toLowerCase().includes(q)))
  return (
    <>
      <PageHead title="Orders" sub="Status change korle stock auto update hoy (Cancel/Return e stock fere ashe)"><Link href="/admin/orders/new" className="btn bg-[#ff5a1f] text-white">+ New Order</Link></PageHead>
      <div className="card">
        <form className="mb-3 flex flex-wrap gap-2">
          <input name="q" defaultValue={sp.q} placeholder="🔍 Name / phone / #ID" className="input w-auto min-w-48" />
          <select name="src" defaultValue={sp.src ?? ''} className="input w-auto"><option value="">All sources</option>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
          <select name="st" defaultValue={sp.st ?? ''} className="input w-auto"><option value="">All status</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <button className="btn-dark">Filter</button>
          <span className="self-center text-sm text-neutral-500">{list.length} orders</span>
        </form>
        {/* phone: cards */}
        <div className="grid min-w-0 gap-2.5 sm:grid-cols-2 lg:hidden">
          {list.map((o) => {
            const m = orderMoney(o)
            return (
              <div key={o.id} className="rounded-xl border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold">{orderNo(o.id)} <span className="text-xs font-normal text-neutral-500">{shortDate(o.created_at)}</span></Link>
                  <SourceBadge s={o.source} />
                </div>
                <a href={`tel:${o.phone}`} className="mt-1 block text-sm"><b>{o.customer_name}</b> • <span className="underline">{o.phone}</span></a>
                <p className="text-xs text-neutral-500">{o.address}</p>
                <div className="mt-1 text-xs">{o.order_items.map((i) => <div key={i.id}>{i.product_name} ({i.size}×{i.qty})</div>)}</div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm">COD <b>{tk(m.cod)}</b> • <span className={m.profit >= 0 ? 'text-green-600' : 'text-red-600'}>{counts(o) ? tk(m.profit) : '—'}</span></span>
                  <StatusSelect id={o.id} value={o.status} />
                </div>
                <div className="mt-2 flex justify-end gap-2 border-t border-line pt-2">
                  <Link href={`/admin/orders/${o.id}`} className="btn-light px-3 py-1.5 text-xs"><Pencil size={13} /> Edit</Link>
                  <DeleteButton action={deleteOrder.bind(null, o.id)} confirmText={delMsg(o)} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead><tr><th className="th">ID</th><th className="th">Date</th><th className="th">Customer</th><th className="th">Items</th><th className="th">Source</th><th className="th text-right">COD</th><th className="th text-right">Profit</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>
              {list.map((o) => {
                const m = orderMoney(o)
                return (
                  <tr key={o.id} className="hover:bg-neutral-50">
                    <td className="td font-semibold"><Link href={`/admin/orders/${o.id}`} className="hover:text-[#ff5a1f]">{orderNo(o.id)}</Link></td>
                    <td className="td whitespace-nowrap text-neutral-500">{shortDate(o.created_at)}</td>
                    <td className="td"><b className="font-semibold">{o.customer_name}</b><div className="text-xs text-neutral-500">{o.phone} • {o.address}</div></td>
                    <td className="td text-xs">{o.order_items.map((i) => <div key={i.id}>{i.product_name} <span className="text-neutral-500">({i.size}×{i.qty})</span></div>)}{o.reseller_id && <div className="text-purple-700">🤝 {resellers.find((r) => r.id === o.reseller_id)?.name}</div>}</td>
                    <td className="td"><SourceBadge s={o.source} /></td>
                    <td className="td text-right">{tk(m.cod)}</td>
                    <td className={`td text-right font-semibold ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{counts(o) ? tk(m.profit) : '—'}</td>
                    <td className="td"><StatusSelect id={o.id} value={o.status} /></td>
                    <td className="td"><div className="flex justify-end gap-1.5">
                      <Link href={`/admin/orders/${o.id}`} aria-label="Edit" title="Edit" className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Pencil size={15} /></Link>
                      <DeleteButton action={deleteOrder.bind(null, o.id)} confirmText={delMsg(o)} />
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!list.length && <p className="p-10 text-center text-neutral-500">No orders</p>}
        </div>
      </div>
    </>
  )
}
