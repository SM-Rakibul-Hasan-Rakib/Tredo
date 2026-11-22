'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { resellerOrder } from '@/app/actions/reseller'
import { DELIVERY, tk, type Zone } from '@/lib/format'
import { Row } from './ui'

type P = { id: number; name: string; sell_price: number; reseller_price: number | null; stock: Record<string, number> }

export function ResellerOrderForm({ products, initial }: { products: P[]; initial?: number }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  const [pid, setPid] = useState(initial ?? products[0]?.id)
  const p = products.find((x) => x.id === pid)
  const sizes = p ? Object.entries(p.stock).filter(([, q]) => q > 0).map(([s]) => s) : []
  const [size, setSize] = useState(sizes[0] ?? '')
  const [qty, setQty] = useState(1)
  const [sell, setSell] = useState(p?.sell_price ?? 0)
  const [zone, setZone] = useState<Zone>('Inside Dhaka')
  if (!p) return <p className="card text-neutral-500">No products in stock</p>
  const rp = p.reseller_price ?? p.sell_price
  const submit = (fd: FormData) => start(async () => {
    setErr('')
    const r = await resellerOrder({ name: String(fd.get('name')), phone: String(fd.get('phone')), address: String(fd.get('address')), note: String(fd.get('note') || ''), zone, productId: p.id, size, qty, sellPrice: sell })
    if (r.ok) router.push('/reseller/orders')
    else setErr(r.error)
  })
  return (
    <form action={submit} className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="card grid gap-3 sm:grid-cols-2">
        <label className="label">Customer name<input name="name" required className="input" /></label>
        <label className="label">Customer phone<input name="phone" required className="input" /></label>
        <label className="label sm:col-span-2">Address<input name="address" required className="input" /></label>
        <label className="label sm:col-span-2">Product<select value={pid} onChange={(e) => { const np = products.find((x) => x.id === Number(e.target.value))!; setPid(np.id); setSell(np.sell_price); setSize(Object.entries(np.stock).find(([, q]) => q > 0)?.[0] ?? '') }} className="input">{products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label className="label">Size<select value={size} onChange={(e) => setSize(e.target.value)} className="input">{sizes.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Qty<input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input" /></label>
        <label className="label">Your selling price (per pair)<input type="number" value={sell} onChange={(e) => setSell(Number(e.target.value))} className="input" /></label>
        <label className="label">Zone<select value={zone} onChange={(e) => setZone(e.target.value as Zone)} className="input"><option>Inside Dhaka</option><option>Outside Dhaka</option></select></label>
        <label className="label sm:col-span-2">Note<input name="note" className="input" /></label>
        {err && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-600 sm:col-span-2">{err}</p>}
        <button disabled={pending || !size} className="btn bg-[#ff5a1f] text-white sm:col-span-2">{pending ? 'Submitting…' : 'Submit order'}</button>
      </div>
      <div className="card">
        <h3 className="mb-2 font-semibold">Your earning</h3>
        <Row l="Customer pays (COD)" v={tk(sell * qty + DELIVERY[zone].charge)} /><Row l="Your cost" v={tk(rp * qty)} />
        <Row l={<b>Your profit</b>} v={<b className={sell >= rp ? 'text-green-600' : 'text-red-600'}>{tk((sell - rp) * qty)}</b>} />
        {sell < rp && <p className="mt-2 text-sm text-red-600">⚠️ Selling price reseller price er cheye kom!</p>}
      </div>
    </form>
  )
}
