'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, X } from 'lucide-react'
import { price } from '@/lib/format'
import { useCart } from './cart'

export function CartDrawer() {
  const c = useCart()
  return (
    <>
      <div onClick={() => c.setOpen(false)} className={`fixed inset-0 z-40 bg-black/40 transition ${c.open ? 'visible opacity-100' : 'invisible opacity-0'}`} />
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-white transition-transform duration-300 ${c.open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3 className="text-lg font-semibold">Shopping Bag ({c.count})</h3>
          <button onClick={() => c.setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-soft"><X size={17} /></button>
        </div>
        {c.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-neutral-500">
            <ShoppingBag size={52} strokeWidth={1.2} />
            <p>Your bag is empty</p>
            <Link href="/shop" onClick={() => c.setOpen(false)} className="btn-dark">Continue shopping</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto px-5">
              {c.items.map((i) => (
                <div key={i.productId + i.size} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border-b border-neutral-100 py-3">
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-xl bg-soft">{i.image && <Image src={i.image} alt={i.name} fill sizes="72px" className="object-cover" />}</div>
                  <div>
                    <p className="leading-snug">{i.name}</p>
                    <p className="text-[13px] text-neutral-500">Size: {i.size}</p>
                    <div className="mt-1.5 flex items-center gap-2.5 text-sm">
                      <button onClick={() => c.setQty(i.productId, i.size, i.qty - 1)} className="h-6 w-6 rounded-full border border-neutral-300">−</button>
                      {i.qty}
                      <button onClick={() => c.setQty(i.productId, i.size, i.qty + 1)} className="h-6 w-6 rounded-full border border-neutral-300">+</button>
                    </div>
                  </div>
                  <b className="font-semibold text-brand">{price(i.price * i.qty)}</b>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-line p-5">
              <div className="flex justify-between text-lg font-semibold"><span>Subtotal</span><span>{price(c.subtotal)}</span></div>
              <p className="text-[13px] text-neutral-500">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
              <Link href="/checkout" onClick={() => c.setOpen(false)} className="btn-dark py-3.5">Checkout — Cash on Delivery</Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
