import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { listExpenses, listOrders, listProducts } from '@/lib/admin-data'
import { counts, orderMoney } from '@/lib/profit'
import { lastDays, orderNo, shortDate, tk, totalStock } from '@/lib/format'
import { MARKETING_CATS, SOURCES } from '@/lib/types'
import { Kpi, PageHead, Row, SourceBadge, StatusBadge, Thumb, itemImg } from '@/components/admin/ui'

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  await requireAdmin()
  const { r } = await searchParams
  const days = r === 'all' ? undefined : Number(r ?? 7)
  const [orders, exps, products] = await Promise.all([listOrders({ days }), listExpenses(days), listProducts()])
  const ok = orders.filter(counts)
  const m = ok.map(orderMoney)
  const sum = (k: keyof ReturnType<typeof orderMoney>) => m.reduce((a, x) => a + x[k], 0)
  const exp = exps.reduce((a, e) => a + Number(e.amount), 0)
  const mkt = exps.filter((e) => MARKETING_CATS.includes(e.category)).reduce((a, e) => a + Number(e.amount), 0)
  const rev = sum('revenue'), gross = sum('profit'), net = gross - exp
  const returned = orders.filter((o) => o.status === 'Returned').length

  // daily chart (last 14 days max)
  const n = Math.min(days ?? 14, 14)
  const daysArr = lastDays(n)
  const daily = daysArr.map((d) => {
    const os = ok.filter((o) => o.created_at.slice(0, 10) === d).map(orderMoney)
    const e = exps.filter((x) => x.date === d).reduce((a, x) => a + Number(x.amount), 0)
    return { d, rev: os.reduce((a, x) => a + x.revenue, 0), pro: os.reduce((a, x) => a + x.profit, 0) - e }
  })
  const max = Math.max(1, ...daily.map((x) => x.rev))
  const low = products.filter((p) => p.is_active && totalStock(p.stock) <= 5)

  return (
    <>
      <PageHead title="Dashboard" sub="Shob order, cost & profit ek jaygay">
        {[['7', '7 days'], ['30', '30 days'], ['all', 'All time']].map(([v, l]) => (
          <Link key={v} href={`/admin?r=${v}`} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${(r ?? '7') === v ? 'border-[#ff5a1f] bg-orange-50 text-orange-700' : 'border-line bg-white'}`}>{l}</Link>
        ))}
      </PageHead>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi k="Total Sales" v={tk(rev)} d={`${ok.length} orders • ${sum('pairs')} pairs`} />
        <Kpi k="Net Profit" v={<span className={net >= 0 ? 'text-green-600' : 'text-red-600'}>{tk(net)}</span>} d={`${rev ? Math.round((net / rev) * 100) : 0}% margin after ALL cost`} />
        <Kpi k="Marketing Spend" v={tk(mkt)} d={`Cost per order ${tk(ok.length ? mkt / ok.length : 0)}`} />
        <Kpi k="Pending / Returned" v={`${orders.filter((o) => o.status === 'Pending').length} / ${returned}`} d={`Return rate ${orders.length ? Math.round((returned / orders.length) * 100) : 0}%`} />
      </div>
      <div className="grid-cols-[minmax(0,1fr)] mb-4 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <h3 className="mb-3 font-semibold">Revenue vs Net profit <span className="ml-2 text-xs font-normal text-neutral-500">■ revenue <span className="text-[#ff5a1f]">■ profit</span></span></h3>
          <div className="flex h-48 items-end gap-2">
            {daily.map((x) => (
              <div key={x.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${x.d}\nRevenue ${tk(x.rev)}\nProfit ${tk(x.pro)}`}>
                <div className="flex w-full max-w-9 flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${(x.rev / max) * 100}%` }}>
                  <div className="bg-[#ff5a1f]" style={{ height: `${x.rev ? (Math.max(0, x.pro) / x.rev) * 100 : 0}%` }} /><div className="flex-1 bg-orange-200" />
                </div>
                <small className="text-[10px] text-neutral-500">{x.d.slice(8)}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="mb-3 font-semibold">Orders by source</h3>
          {SOURCES.map((s) => {
            const c = orders.filter((o) => o.source === s).length
            return (
              <div key={s} className="mb-3 grid grid-cols-[90px_1fr_32px] items-center gap-2 text-sm">
                <span>{s}</span><div className="h-2.5 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-[#ff5a1f]" style={{ width: `${orders.length ? (c / orders.length) * 100 : 0}%` }} /></div><span className="text-right">{c}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-x-auto">
          <h3 className="mb-2 flex justify-between font-semibold">Recent orders <Link href="/admin/orders" className="text-sm text-[#ff5a1f]">View all →</Link></h3>
          <table className="w-full">
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id}>
                  <td className="td font-semibold"><Link href={`/admin/orders/${o.id}`}>{orderNo(o.id)}</Link></td><td className="td hidden whitespace-nowrap text-neutral-500 xl:table-cell">{shortDate(o.created_at)}</td>
                  <td className="td"><div className="flex items-center gap-2"><Thumb src={o.image_url || (o.order_items[0] ? itemImg(o.order_items[0]) : null)} size={36} /><span>{o.customer_name}{o.order_items.length > 1 && <span className="text-xs text-neutral-500"> +{o.order_items.length - 1}</span>}</span></div></td><td className="td hidden md:table-cell"><SourceBadge s={o.source} /></td>
                  <td className="td text-right font-semibold text-green-600">{counts(o) ? tk(orderMoney(o).profit) : '—'}</td><td className="td"><StatusBadge s={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <p className="p-8 text-center text-neutral-500">No orders yet</p>}
        </div>
        <div className="flex flex-col gap-3">
          <div className="card">
            <h3 className="mb-2 font-semibold">Where the money goes</h3>
            <Row l="Revenue (incl. delivery)" v={tk(rev)} />
            <Row l="− Product buy cost" v={tk(-sum('cogs'))} cls="text-red-600" />
            <Row l="− Courier + packaging" v={tk(-ok.reduce((a, o) => a + Number(o.courier_cost) + Number(o.packaging_cost), 0))} cls="text-red-600" />
            <Row l="− Reseller commission" v={tk(-sum('resellerCommission'))} cls="text-red-600" />
            <Row l="− Marketing & expenses" v={tk(-exp)} cls="text-red-600" />
            <Row l={<b>= Net profit</b>} v={<b>{tk(net)}</b>} />
          </div>
          <div className="card">
            <h3 className="mb-2 font-semibold">⚠️ Low stock</h3>
            {low.length ? low.map((p) => <Row key={p.id} l={<Link href={`/admin/products/${p.id}`}>{p.name}</Link>} v={<span className="text-red-600">{totalStock(p.stock)} left</span>} />) : <p className="text-sm text-neutral-500">All good</p>}
          </div>
        </div>
      </div>
    </>
  )
}
