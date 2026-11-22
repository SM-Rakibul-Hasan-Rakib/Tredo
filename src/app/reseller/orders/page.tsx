import { requireReseller } from '@/lib/auth'
import { resellerSummary } from '@/lib/reseller-data'
import { tk } from '@/lib/format'
import { PageHead } from '@/components/admin/ui'
import { ResellerOrders } from '@/components/admin/reseller-orders'

export default async function MyOrders() {
  const me = await requireReseller()
  const s = await resellerSummary(me.resellerId)
  return (
    <>
      <PageHead title="My Orders" sub={`Payout due ${tk(Math.max(0, s.due))} • Paid ${tk(s.paid)}`} />
      <div className="card"><ResellerOrders orders={s.orders} /></div>
    </>
  )
}
