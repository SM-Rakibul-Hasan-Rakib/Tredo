import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getOrder, listProducts, listResellers } from '@/lib/admin-data'
import { orderMoney } from '@/lib/profit'
import { DELIVERY, orderNo, tk } from '@/lib/format'
import { SOURCES } from '@/lib/types'
import { deleteOrder, saveOrderMeta } from '@/app/actions/admin'
import { PageHead, Row, SourceBadge } from '@/components/admin/ui'
import { StatusSelect } from '@/components/admin/status-select'
import { DeleteButton } from '@/components/admin/delete-button'
import { OrderItemsEditor } from '@/components/admin/order-items-editor'

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const id = Number((await params).id)
  const [o, products, resellers] = await Promise.all([getOrder(id), listProducts(), listResellers()])
  if (!o) notFound()
  const m = orderMoney(o)
  const f = (name: keyof typeof o, label: string, type = 'number') => (
    <label className="label">{label}<input name={name} type={type} defaultValue={String(o[name] ?? '')} className="input" /></label>
  )
  // only what the browser needs (no buy price)
  const plist = products.map((p) => ({ id: p.id, name: p.name, sell_price: Number(p.sell_price), stock: p.stock }))
  return (
    <>
      <PageHead title={`Order ${orderNo(o.id)}`} sub={new Date(o.created_at).toLocaleString('en-GB')}>
        <Link href="/admin/orders" className="btn-light">← Back</Link>
        <StatusSelect id={o.id} value={o.status} />
        <DeleteButton
          action={deleteOrder.bind(null, o.id)}
          confirmText={`Order ${orderNo(o.id)} (${o.customer_name}) puro delete korbe?\n${['Cancelled', 'Returned'].includes(o.status) ? '' : 'Product gulo stock e ferot jabe.\n'}Eta ar ferot ana jabe na.`}
          redirectTo="/admin/orders"
          label="Delete order"
        />
      </PageHead>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="mb-1 flex items-center gap-2"><b className="text-lg">{o.customer_name}</b><SourceBadge s={o.source} /></div>
            <p className="text-sm">📞 <a href={`tel:${o.phone}`} className="underline">{o.phone}</a> • {o.zone}</p>
            <table className="mt-3 w-full"><tbody>
              {o.order_items.map((i) => (
                <tr key={i.id}><td className="td">{i.product_name}<div className="text-xs text-neutral-500">Size {i.size} × {i.qty}</div></td><td className="td text-right">{tk(i.unit_price * i.qty)}</td><td className="td text-right text-xs text-orange-700">buy {tk(i.unit_buy_price * i.qty)}</td></tr>
              ))}
            </tbody></table>
          </div>

          <OrderItemsEditor key={o.order_items.map((i) => `${i.id}-${i.size}-${i.qty}-${i.unit_price}`).join()} orderId={o.id} items={o.order_items} products={plist} />

          <form action={saveOrderMeta.bind(null, o.id)} className="grid-cols-[minmax(0,1fr)] card grid gap-3 sm:grid-cols-2">
            <h3 className="font-semibold sm:col-span-2">Edit order details</h3>
            {f('customer_name', 'Customer name', 'text')}{f('phone', 'Phone', 'tel')}
            <label className="label sm:col-span-2">Address<input name="address" defaultValue={o.address ?? ''} className="input" /></label>
            <label className="label">Delivery zone<select name="zone" defaultValue={o.zone} className="input">{Object.keys(DELIVERY).map((z) => <option key={z}>{z}</option>)}</select></label>
            <label className="label">Order source<select name="source" defaultValue={o.source} className="input">{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="label sm:col-span-2">Reseller <span className="font-normal text-neutral-500">(shudhu source = Reseller hole kaj kore)</span>
              <select name="reseller_id" defaultValue={o.reseller_id ?? ''} className="input"><option value="">— none —</option>{resellers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
            </label>
            {f('courier_name', 'Courier', 'text')}{f('tracking_code', 'Tracking / Consignment ID', 'text')}
            {f('delivery_charge', 'Delivery charge (customer)')}{f('courier_cost', '🔒 Courier cost (actual)')}
            {f('packaging_cost', '🔒 Packaging / other')}{f('discount', 'Discount')}{f('advance', 'Advance received')}
            <label className="label sm:col-span-2">Note<input name="note" defaultValue={o.note ?? ''} className="input" /></label>
            <button className="btn bg-[#ff5a1f] text-white sm:col-span-2">💾 Save changes</button>
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
