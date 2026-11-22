import { requireAdmin } from '@/lib/auth'
import { listOrders, listPayouts, listResellers } from '@/lib/admin-data'
import { counts, orderMoney } from '@/lib/profit'
import { tk } from '@/lib/format'
import { Kpi, PageHead } from '@/components/admin/ui'
import { AddResellerForm, PayButton } from '@/components/admin/reseller-forms'

export default async function Resellers() {
  await requireAdmin()
  const [rs, orders, payouts] = await Promise.all([listResellers(), listOrders(), listPayouts()])
  const stats = rs.map((r) => {
    const os = orders.filter((o) => o.reseller_id === r.id)
    const earned = os.filter((o) => o.status === 'Delivered').reduce((a, o) => a + orderMoney(o).resellerCommission, 0)
    const paid = payouts.filter((p) => p.reseller_id === r.id).reduce((a, p) => a + Number(p.amount), 0)
    return { r, os, earned, paid, due: earned - paid, sales: os.filter(counts).reduce((a, o) => a + orderMoney(o).goods, 0), mine: os.filter(counts).reduce((a, o) => a + orderMoney(o).profit, 0) }
  })
  return (
    <>
      <PageHead title="Resellers" sub="Reseller der order, sales ar payable commission" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi k="Resellers" v={rs.length} /><Kpi k="Reseller orders" v={stats.reduce((a, s) => a + s.os.length, 0)} />
        <Kpi k="Reseller sales" v={tk(stats.reduce((a, s) => a + s.sales, 0))} /><Kpi k="Commission due" v={tk(stats.reduce((a, s) => a + Math.max(0, s.due), 0))} />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className="th">Reseller</th><th className="th text-right">Orders</th><th className="th text-right">Sales</th><th className="th text-right">Your profit</th><th className="th text-right">Earned</th><th className="th text-right">Paid</th><th className="th text-right">Due</th><th className="th" /></tr></thead>
            <tbody>{stats.map((s) => (
              <tr key={s.r.id}>
                <td className="td"><b className="font-semibold">{s.r.name}</b><div className="text-xs text-neutral-500">{s.r.phone} • {s.r.payment_info}</div></td>
                <td className="td text-right">{s.os.length}</td><td className="td text-right">{tk(s.sales)}</td><td className="td text-right text-green-600">{tk(s.mine)}</td>
                <td className="td text-right">{tk(s.earned)}</td><td className="td text-right">{tk(s.paid)}</td><td className="td text-right font-bold">{tk(s.due)}</td>
                <td className="td"><PayButton id={s.r.id} due={s.due} /></td>
              </tr>
            ))}</tbody>
          </table>
          {!rs.length && <p className="p-8 text-center text-neutral-500">No resellers yet</p>}
        </div>
        <AddResellerForm />
      </div>
    </>
  )
}
