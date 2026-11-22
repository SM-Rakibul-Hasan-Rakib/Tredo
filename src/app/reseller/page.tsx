import Link from 'next/link'
import { requireReseller } from '@/lib/auth'
import { resellerSummary } from '@/lib/reseller-data'
import { tk } from '@/lib/format'
import { Kpi, PageHead } from '@/components/admin/ui'
import { ResellerOrders } from '@/components/admin/reseller-orders'

export default async function ResellerHome() {
  const me = await requireReseller()
  const s = await resellerSummary(me.resellerId)
  return (
    <>
      <PageHead title={`Hi, ${s.reseller?.name ?? ''} 👋`} sub="Tomar sales, profit ar payout"><Link href="/reseller/new-order" className="btn bg-[#ff5a1f] text-white">+ Place Order</Link></PageHead>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi k="My orders" v={s.orders.length} /><Kpi k="My sales" v={tk(s.sales)} />
        <Kpi k="Earned (delivered)" v={tk(s.earned)} d={`+ ${tk(s.pending)} pending`} /><Kpi k="Payout due" v={tk(Math.max(0, s.due))} d={`Paid so far ${tk(s.paid)}`} />
      </div>
      <div className="card"><h3 className="mb-2 font-semibold">Recent orders</h3><ResellerOrders orders={s.orders.slice(0, 8)} /></div>
    </>
  )
}
