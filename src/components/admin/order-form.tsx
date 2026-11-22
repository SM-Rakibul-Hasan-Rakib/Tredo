'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { createAdminOrder } from '@/app/actions/admin'
import { DELIVERY, sizesOf, tk, type Zone } from '@/lib/format'
import type { OrderSource, OrderStatus, Product, Reseller } from '@/lib/types'
import { Row } from './ui'

type Line = { productId: number; size: string; qty: number; unitPrice: number }

export function OrderForm({ products, resellers }: { products: Product[]; resellers: Reseller[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  const [src, setSrc] = useState<OrderSource>('Messenger')
  const [f, setF] = useState({ name: '', phone: '', address: '', zone: 'Inside Dhaka' as Zone, delivery_charge: 70, courier_cost: 60, courier_name: 'Steadfast', packaging_cost: 25, discount: 0, advance: 0, status: 'Pending' as OrderStatus, note: '', reseller_id: resellers[0]?.id ?? 0, paste: '' })
  const first = products[0]
  const [lines, setLines] = useState<Line[]>(first ? [{ productId: first.id, size: sizesOf(first.stock)[0] ?? '', qty: 1, unitPrice: first.sell_price }] : [])
  const set = (k: keyof typeof f, v: string | number) => setF((x) => ({ ...x, [k]: v }))
  const p = (id: number) => products.find((x) => x.id === id)!

  const paste = (t: string) => {
    set('paste', t)
    const ph = t.match(/01[3-9]\d{8}/)
    if (ph) set('phone', ph[0])
    if (/dhaka|ঢাকা/i.test(t)) zone('Inside Dhaka')
    else if (/(ctg|chattogram|sylhet|khulna|rajshahi|barishal|rangpur|cumilla|mymensingh)/i.test(t)) zone('Outside Dhaka')
  }
  const zone = (z: Zone) => setF((x) => ({ ...x, zone: z, delivery_charge: DELIVERY[z].charge, courier_cost: DELIVERY[z].courier }))

  const calc = useMemo(() => {
    const goods = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0)
    const cogs = lines.reduce((a, l) => a + (p(l.productId)?.buy_price ?? 0) * l.qty, 0)
    const rc = src === 'Reseller' ? lines.reduce((a, l) => a + Math.max(0, (l.unitPrice - (p(l.productId)?.reseller_price ?? l.unitPrice)) * l.qty), 0) : 0
    const revenue = goods - f.discount + f.delivery_charge
    return { goods, cogs, rc, revenue, profit: revenue - cogs - f.courier_cost - f.packaging_cost - rc }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, f, src])

  const submit = () =>
    start(async () => {
      setErr('')
      const r = await createAdminOrder({
        source: src, status: f.status, customer_name: f.name, phone: f.phone, address: f.address, zone: f.zone,
        delivery_charge: f.delivery_charge, courier_cost: f.courier_cost, courier_name: f.courier_name, packaging_cost: f.packaging_cost,
        discount: f.discount, advance: f.advance, note: f.note, reseller_id: src === 'Reseller' ? f.reseller_id : null, items: lines,
      })
      if (r.ok) router.push(`/admin/orders/${r.id}`)
      else setErr(r.error)
    })

  const num = (k: keyof typeof f, label: string) => <label className="label">{label}<input type="number" value={f[k] as number} onChange={(e) => set(k, Number(e.target.value))} className="input" /></label>

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid-cols-[minmax(0,1fr)] card grid gap-3 sm:grid-cols-2">
        <div className="label sm:col-span-2">Order source
          <div className="flex flex-wrap gap-2">{(['Messenger', 'WhatsApp', 'Website', 'Reseller', 'Other'] as OrderSource[]).map((s) => <button type="button" key={s} onClick={() => setSrc(s)} className={`rounded-lg border px-3 py-2 text-sm ${src === s ? 'border-[#ff5a1f] bg-orange-50 text-orange-700' : 'border-line'}`}>{s}</button>)}</div>
        </div>
        <label className="label rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3 sm:col-span-2">Quick paste — customer er message paste koro, phone & zone auto-fill
          <textarea rows={2} value={f.paste} onChange={(e) => paste(e.target.value)} className="input" placeholder="e.g. Jordan 1 42 size, Rahim, 01712345678, Mirpur Dhaka" />
        </label>
        <label className="label">Customer name<input value={f.name} onChange={(e) => set('name', e.target.value)} className="input" /></label>
        <label className="label">Phone<input value={f.phone} onChange={(e) => set('phone', e.target.value)} className="input" /></label>
        <label className="label sm:col-span-2">Address<input value={f.address} onChange={(e) => set('address', e.target.value)} className="input" /></label>

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[13px] font-semibold text-neutral-700">Products</p>
          {lines.map((l, k) => {
            const prod = p(l.productId)
            const upd = (patch: Partial<Line>) => setLines((ls) => ls.map((x, j) => (j === k ? { ...x, ...patch } : x)))
            return (
              <div key={k} className="mb-3 grid grid-cols-[1fr_1fr_1.4fr_28px] gap-2 sm:grid-cols-[1fr_80px_64px_100px_28px]">
                <select value={l.productId} onChange={(e) => { const np = p(Number(e.target.value)); upd({ productId: np.id, size: sizesOf(np.stock)[0] ?? '', unitPrice: np.sell_price }) }} className="input col-span-4 sm:col-span-1">
                  {products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
                <select value={l.size} onChange={(e) => upd({ size: e.target.value })} className="input">{sizesOf(prod?.stock ?? {}).map((s) => <option key={s} value={s}>{s} ({prod.stock[s]})</option>)}</select>
                <input type="number" min={1} value={l.qty} onChange={(e) => upd({ qty: Number(e.target.value) })} className="input" />
                <input type="number" value={l.unitPrice} onChange={(e) => upd({ unitPrice: Number(e.target.value) })} className="input" title="Selling price" />
                <button type="button" onClick={() => setLines((ls) => ls.filter((_, j) => j !== k))} aria-label="Remove" className="grid h-10 place-items-center text-neutral-400 hover:text-red-600">✕</button>
              </div>
            )
          })}
          {first && <button type="button" onClick={() => setLines((ls) => [...ls, { productId: first.id, size: sizesOf(first.stock)[0] ?? '', qty: 1, unitPrice: first.sell_price }])} className="text-sm font-semibold text-[#ff5a1f]">+ Add another product</button>}
        </div>

        <label className="label">Delivery zone<select value={f.zone} onChange={(e) => zone(e.target.value as Zone)} className="input"><option>Inside Dhaka</option><option>Outside Dhaka</option></select></label>
        <label className="label">Courier<select value={f.courier_name} onChange={(e) => set('courier_name', e.target.value)} className="input">{['Steadfast', 'Pathao', 'RedX', 'Sundarban', 'Self delivery'].map((c) => <option key={c}>{c}</option>)}</select></label>
        {num('delivery_charge', 'Delivery charge (customer theke)')}{num('courier_cost', '🔒 Courier cost (actual)')}
        {num('packaging_cost', '🔒 Packaging / other')}{num('discount', 'Discount')}{num('advance', 'Advance paid')}
        <label className="label">Status<select value={f.status} onChange={(e) => set('status', e.target.value)} className="input">{['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((s) => <option key={s}>{s}</option>)}</select></label>
        {src === 'Reseller' && <label className="label">Reseller<select value={f.reseller_id} onChange={(e) => set('reseller_id', Number(e.target.value))} className="input">{resellers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>}
        <label className="label sm:col-span-2">Note<input value={f.note} onChange={(e) => set('note', e.target.value)} className="input" /></label>
        {err && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-600 sm:col-span-2">{err}</p>}
        <button disabled={pending || !lines.length} onClick={submit} className="btn bg-[#ff5a1f] text-white sm:col-span-2">{pending ? 'Saving…' : '✅ Submit Order'}</button>
      </div>
      <div className="card lg:sticky lg:top-6">
        <h3 className="mb-2 font-semibold">Order profit 🔒 admin only</h3>
        <Row l="Products" v={tk(calc.goods)} /><Row l="− Discount" v={tk(-f.discount)} /><Row l="+ Delivery charge" v={tk(f.delivery_charge)} />
        <Row l={<b>Customer pays</b>} v={<b>{tk(calc.revenue)}</b>} /><Row l="Courier will collect" v={tk(calc.revenue - f.advance)} />
        <Row l="− Buy cost" v={tk(-calc.cogs)} cls="text-orange-700" /><Row l="− Courier cost" v={tk(-f.courier_cost)} cls="text-orange-700" /><Row l="− Packaging" v={tk(-f.packaging_cost)} cls="text-orange-700" />
        {src === 'Reseller' && <Row l="− Reseller commission" v={tk(-calc.rc)} cls="text-orange-700" />}
        <Row l={<b>Profit</b>} v={<b className={calc.profit >= 0 ? 'text-green-600' : 'text-red-600'}>{tk(calc.profit)}</b>} />
      </div>
    </div>
  )
}
