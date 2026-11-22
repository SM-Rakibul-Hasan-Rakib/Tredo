'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { saveOrderItems } from '@/app/actions/admin'
import { sizesOf, tk } from '@/lib/format'
import type { OrderItem } from '@/lib/types'

type P = { id: number; name: string; sell_price: number; stock: Record<string, number> }
type Line = { id?: number; product_id: number | null; name: string; size: string; qty: number; unit_price: number; remove?: boolean }

/** Order er product gulo edit: size, qty, price bodlao, notun product add, ba remove. */
export function OrderItemsEditor({ orderId, items, products }: { orderId: number; items: OrderItem[]; products: P[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [lines, setLines] = useState<Line[]>(items.map((i) => ({ id: i.id, product_id: i.product_id, name: i.product_name, size: i.size, qty: i.qty, unit_price: Number(i.unit_price) })))
  const upd = (k: number, patch: Partial<Line>) => setLines((ls) => ls.map((x, j) => (j === k ? { ...x, ...patch } : x)))
  const prod = (id: number | null) => products.find((p) => p.id === id)
  const first = products[0]
  const addLine = () => first && setLines((ls) => [...ls, { product_id: first.id, name: first.name, size: sizesOf(first.stock)[0] ?? '', qty: 1, unit_price: first.sell_price }])
  const total = lines.filter((l) => !l.remove).reduce((a, l) => a + l.unit_price * l.qty, 0)

  const save = () =>
    start(async () => {
      setMsg(null)
      const r = await saveOrderItems(orderId, lines.map(({ id, product_id, size, qty, unit_price, remove }) => ({ id, product_id, size, qty, unit_price, remove })))
      if (r.ok) { setMsg({ ok: true, t: 'Products updated ✓ (stock auto thik hoye geche)' }); router.refresh() }
      else setMsg({ ok: false, t: r.error ?? 'Error' })
    })

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold">Products in this order</h3>
        <button type="button" onClick={addLine} className="btn-light px-3 py-1.5 text-xs">+ Add product</button>
      </div>
      <div className="grid gap-2">
        {lines.map((l, k) => {
          const p = prod(l.product_id)
          const sizes = p ? sizesOf(p.stock) : []
          if (l.size && !sizes.includes(l.size)) sizes.unshift(l.size)
          return (
            <div key={l.id ?? `new-${k}`} className={`grid grid-cols-[1fr_1fr_1fr_36px] items-center gap-2 rounded-xl border border-line p-2 sm:grid-cols-[minmax(0,2fr)_90px_70px_100px_36px] ${l.remove ? 'opacity-40 line-through' : ''}`}>
              {l.id ? (
                <div className="col-span-4 min-w-0 truncate text-sm font-semibold sm:col-span-1">{l.name}{!p && <span className="ml-1 text-xs font-normal text-neutral-500">(product deleted)</span>}</div>
              ) : (
                <select value={l.product_id ?? ''} onChange={(e) => { const np = prod(Number(e.target.value))!; upd(k, { product_id: np.id, name: np.name, size: sizesOf(np.stock)[0] ?? '', unit_price: np.sell_price }) }} className="input col-span-4 sm:col-span-1">
                  {products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              )}
              <select disabled={!p || l.remove} value={l.size} onChange={(e) => upd(k, { size: e.target.value })} className="input" title="Size">
                {sizes.map((s) => <option key={s} value={s}>{s}{p && p.stock[s] != null ? ` (${p.stock[s]})` : ''}</option>)}
              </select>
              <input type="number" min={1} disabled={l.remove} value={l.qty} onChange={(e) => upd(k, { qty: Number(e.target.value) })} className="input" title="Qty" />
              <input type="number" disabled={l.remove} value={l.unit_price} onChange={(e) => upd(k, { unit_price: Number(e.target.value) })} className="input" title="Price per pair" />
              <button type="button" onClick={() => (l.id ? upd(k, { remove: !l.remove }) : setLines((ls) => ls.filter((_, j) => j !== k)))} title={l.remove ? 'Undo' : 'Remove'} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50">
                {l.remove ? '↺' : <Trash2 size={15} />}
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm">Products total: <b>{tk(total)}</b></span>
        <button type="button" disabled={pending} onClick={save} className="btn bg-[#ff5a1f] text-white">{pending ? 'Saving…' : '💾 Save products'}</button>
      </div>
      {msg && <p className={`mt-2 rounded-lg p-2 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.t}</p>}
      <p className="mt-2 text-xs text-neutral-500">Size/qty bodlale ba remove korle stock nije nije thik hoye jay. Notun product er buy price database theke nibe.</p>
    </div>
  )
}
