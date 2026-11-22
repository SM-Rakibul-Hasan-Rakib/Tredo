import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getOrder } from '@/lib/admin-data'
import { orderMoney } from '@/lib/profit'
import { orderNo, tk } from '@/lib/format'
import { saveOrderMeta } from '@/app/actions/admin'
import { PageHead, Row, SourceBadge } from '@/components/admin/ui'
import { StatusSelect } from '@/components/admin/status-select'

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const o = await getOrder(Number((await params).id))
  if (!o) notFound()
  const m = orderMoney(o)
  const f = (name: keyof typeof o, label: string, type = 'number') => (
    <label className="label">{label}<input name={name} type={type} defaultValue={String(o[name] ?? '')} className="input" /></label>
  )
  return (
    <>
      <PageHead title={`Order ${orderNo(o.id)}`} sub={new Date(o.created_at).toLocaleString('en-GB')}><Link href="/admin/orders" className="btn-light">← Back</Link><StatusSelect id={o.id} value={o.status} /></PageHead>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="mb-3 flex items-center gap-2"><b className="text-lg">{o.customer_name}</b><SourceBadge s={o.source} /></div>
            <p className="text-sm">📞 <a href={`tel:${o.phone}`} className="underline">{o.phone}</a> • {o.zone}</p>
            <table className="mt-4 w-full"><tbody>
              {o.order_items.map((i) => (
                <tr key={i.id}><td className="td">{i.product_name}<div className="text-xs text-neutral-500">Size {i.size} × {i.qty}</div></td><td className="td text-right">{tk(i.unit_price * i.qty)}</td><td className="td text-right text-xs text-orange-700">buy {tk(i.unit_buy_price * i.qty)}</td></tr>
              ))}
            </tbody></table>
          </div>
          <form action={saveOrderMeta.bind(null, o.id)} className="grid-cols-[minmax(0,1fr)] card grid gap-3 sm:grid-cols-2">
            <label className="label sm:col-span-2">Address<input name="address" defaultValue={o.address ?? ''} className="input" /></label>
            {f('courier_name', 'Courier', 'text')}{f('tracking_code', 'Tracking / Consignment ID', 'text')}
            {f('delivery_charge', 'Delivery charge (customer)')}{f('courier_cost', '🔒 Courier cost (actual)')}
            {f('packaging_cost', '🔒 Packaging / other')}{f('discount', 'Discount')}{f('advance', 'Advance received')}
            <label className="label sm:col-span-2">Note<input name="note" defaultValue={o.note ?? ''} className="input" /></label>
            <button className="btn bg-[#ff5a1f] text-white sm:col-span-2">Save changes</button>
          </form>
        </div>
        <div className="card h-fit">
          <h3 className="mb-2 font-semibold">Profit breakdown 🔒</h3>
          <Row l="Products" v={tk(m.goods)} /><Row l="− Discount" v={tk(-o.discount)} /><Row l="+ Delivery charge" v={tk(o.delivery_charge)} />
          <Row l={<b>Customer pays</b>} v={<b>{tk(m.revenue)}</b>} /><Row l="Courier collects (COD)" v={tk(m.cod)} />
          <Row l="− Buy cost" v={tk(-m.cogs)} cls="text-orange-700" /><Row l="− Courier cost" v={tk(-o.courier_cost)} cls="text-orange-700" />
          <Row l="− Packaging" v={tk(-o.packaging_cost)} cls="text-orange-700" />{o.reseller_id && <Row l="− Reseller commission" v={tk(-m.resellerCommission)} cls="text-orange-700" />}
          <Row l={<b>Order profit</b>} v={<b className={m.profit >= 0 ? 'text-green-600' : 'text-red-600'}>{tk(m.profit)}</b>} />
        </div>
      </div>
    </>
  )
}
