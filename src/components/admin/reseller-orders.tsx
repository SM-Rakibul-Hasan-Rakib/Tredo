import { orderNo, shortDate, tk } from '@/lib/format'
import type { OrderStatus } from '@/lib/types'
import { StatusBadge, Thumb } from './ui'

type O = { id: number; created_at: string; status: OrderStatus; customer_name: string; phone: string; items: { id: number; name: string; size: string; qty: number; img: string | null }[]; cod: number; commission: number }
export function ResellerOrders({ orders }: { orders: O[] }) {
  if (!orders.length) return <p className="p-8 text-center text-neutral-500">Ekhono kono order nai</p>
  return (
    <div className="overflow-x-auto"><table className="w-full">
      <thead><tr><th className="th">ID</th><th className="th">Date</th><th className="th">Customer</th><th className="th">Product</th><th className="th text-right">COD</th><th className="th text-right">My profit</th><th className="th">Status</th></tr></thead>
      <tbody>{orders.map((o) => (
        <tr key={o.id}><td className="td font-semibold">{orderNo(o.id)}</td><td className="td text-neutral-500">{shortDate(o.created_at)}</td>
          <td className="td">{o.customer_name}<div className="text-xs text-neutral-500">{o.phone}</div></td>
          <td className="td text-xs"><div className="grid gap-1.5">{o.items.map((i) => <div key={i.id} className="flex items-center gap-2"><Thumb src={i.img} /><span>{i.name} ({i.size}×{i.qty})</span></div>)}</div></td>
          <td className="td text-right">{tk(o.cod)}</td><td className="td text-right font-semibold text-green-600">{['Cancelled', 'Returned'].includes(o.status) ? '—' : tk(o.commission)}</td><td className="td"><StatusBadge s={o.status} /></td></tr>
      ))}</tbody>
    </table></div>
  )
}
