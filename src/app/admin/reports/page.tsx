import { requireAdmin } from '@/lib/auth'
import { listExpenses, listOrders } from '@/lib/admin-data'
import { counts, orderMoney } from '@/lib/profit'
import { tk } from '@/lib/format'
import { SOURCES } from '@/lib/types'
import { PageHead, Row } from '@/components/admin/ui'

export default async function Reports() {
  await requireAdmin()
  const [orders, exps] = await Promise.all([listOrders(), listExpenses()])
  const ok = orders.filter(counts)
  const byProduct = new Map<string, { qty: number; rev: number; profit: number }>()
  for (const o of ok) {
    const m = orderMoney(o)
    for (const i of o.order_items) {
      const share = m.goods ? (i.unit_price * i.qty) / m.goods : 0
      const x = byProduct.get(i.product_name) ?? { qty: 0, rev: 0, profit: 0 }
      byProduct.set(i.product_name, { qty: x.qty + i.qty, rev: x.rev + i.unit_price * i.qty, profit: x.profit + m.profit * share })
    }
  }
  const del = orders.filter((o) => o.status === 'Delivered').map(orderMoney)
  const s = (k: keyof ReturnType<typeof orderMoney>) => del.reduce((a, x) => a + x[k], 0)
  const exp = exps.reduce((a, e) => a + Number(e.amount), 0)
  const retLoss = orders.filter((o) => o.status === 'Returned').reduce((a, o) => a + Number(o.courier_cost) + Number(o.packaging_cost), 0)
  return (
    <>
      <PageHead title="Profit Report" sub="All time — shob cost bad diye asol profit" />
      <div className="mb-4 grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card overflow-x-auto">
          <h3 className="mb-2 font-semibold">Product-wise profit</h3>
          <table className="w-full"><thead><tr><th className="th">Product</th><th className="th text-right">Sold</th><th className="th text-right">Revenue</th><th className="th text-right">Profit</th><th className="th text-right">Per pair</th></tr></thead>
            <tbody>{[...byProduct.entries()].sort((a, b) => b[1].profit - a[1].profit).map(([n, x]) => (
              <tr key={n}><td className="td font-semibold">{n}</td><td className="td text-right">{x.qty}</td><td className="td text-right">{tk(x.rev)}</td><td className="td text-right font-semibold text-green-600">{tk(x.profit)}</td><td className="td text-right">{tk(x.qty ? x.profit / x.qty : 0)}</td></tr>
            ))}</tbody></table>
        </div>
        <div className="card">
          <h3 className="mb-2 font-semibold">P&L (delivered orders)</h3>
          <Row l="Delivered orders" v={del.length} /><Row l="Sales (incl. delivery)" v={tk(s('revenue'))} /><Row l="− Product cost" v={tk(-s('cogs'))} cls="text-red-600" />
          <Row l="− Reseller commission" v={tk(-s('resellerCommission'))} cls="text-red-600" /><Row l="= Gross profit (after courier+pack)" v={tk(s('profit'))} />
          <Row l="− Marketing & expenses" v={tk(-exp)} cls="text-red-600" /><Row l="− Return courier loss" v={tk(-retLoss)} cls="text-red-600" />
          <Row l={<b>= Real net profit</b>} v={<b>{tk(s('profit') - exp - retLoss)}</b>} />
        </div>
      </div>
      <div className="card overflow-x-auto">
        <h3 className="mb-2 font-semibold">Source-wise</h3>
        <table className="w-full"><thead><tr><th className="th">Source</th><th className="th text-right">Orders</th><th className="th text-right">Delivered</th><th className="th text-right">Returned/Cancelled</th><th className="th text-right">Profit</th><th className="th text-right">Avg / order</th></tr></thead>
          <tbody>{SOURCES.map((src) => {
            const os = orders.filter((o) => o.source === src), k = os.filter(counts), pr = k.reduce((a, o) => a + orderMoney(o).profit, 0)
            return <tr key={src}><td className="td font-semibold">{src}</td><td className="td text-right">{os.length}</td><td className="td text-right">{os.filter((o) => o.status === 'Delivered').length}</td><td className="td text-right text-red-600">{os.length - k.length}</td><td className="td text-right text-green-600">{tk(pr)}</td><td className="td text-right">{tk(k.length ? pr / k.length : 0)}</td></tr>
          })}</tbody></table>
      </div>
    </>
  )
}
