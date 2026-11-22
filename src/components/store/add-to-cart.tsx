'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import type { PublicProduct } from '@/lib/types'
import { price, sizesOf, totalStock } from '@/lib/format'
import { useCart } from './cart'

export function AddToCart({ p }: { p: PublicProduct }) {
  const cart = useCart()
  const router = useRouter()
  const [size, setSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [err, setErr] = useState('')
  const stock = totalStock(p.stock)
  const add = (buy?: boolean) => {
    if (!size) return setErr('Please select a size')
    cart.add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? null, price: p.sell_price, size, qty })
    if (buy) router.push('/checkout')
    else cart.setOpen(true)
  }
  const wa = encodeURIComponent(`Hi! Ami ei product ta order korte chai:\n${p.name}\nPrice: ${price(p.sell_price)}\nSize: ${size ?? '?'}`)
  return (
    <div className="flex flex-col gap-4">
      <p className={`text-sm ${stock <= 5 ? 'text-sale' : 'text-green-700'}`}>● {stock <= 0 ? 'Out of stock' : stock <= 5 ? `Only ${stock} left in stock` : 'In stock'}</p>
      <div>
        <div className="mb-2 flex justify-between text-sm font-semibold"><span>Select Size (EU)</span>{err && <span className="text-sale">{err}</span>}</div>
        <div className="grid grid-cols-6 gap-2">
          {sizesOf(p.stock).map((s) => {
            const out = (p.stock[s] ?? 0) <= 0
            return (
              <button key={s} disabled={out} onClick={() => { setSize(s); setErr('') }}
                className={`h-11 rounded-xl border text-sm font-medium transition ${size === s ? 'border-ink bg-ink text-white' : 'border-neutral-300 hover:border-ink'} disabled:cursor-not-allowed disabled:text-neutral-300 disabled:line-through`}>
                {s}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="flex items-center rounded-full border border-neutral-300">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-10 text-lg">−</button><b className="w-6 text-center">{qty}</b><button onClick={() => setQty(qty + 1)} className="h-12 w-10 text-lg">+</button>
        </div>
        <button disabled={stock <= 0} onClick={() => add()} className="btn-light flex-1"><ShoppingBag size={18} /> Add to Bag</button>
      </div>
      <button disabled={stock <= 0} onClick={() => add(true)} className="btn-dark py-3.5">Buy Now — Cash on Delivery</button>
      <div className="grid grid-cols-2 gap-2.5">
        <a href={process.env.NEXT_PUBLIC_MESSENGER_URL ?? 'https://m.me/'} target="_blank" className="btn bg-[#0084ff] text-white">Order on Messenger</a>
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}?text=${wa}`} target="_blank" className="btn bg-[#25d366] text-white">Order on WhatsApp</a>
      </div>
    </div>
  )
}
