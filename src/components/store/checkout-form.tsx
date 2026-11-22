'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { placeOrder } from '@/app/actions/checkout'
import { DELIVERY, price, type Zone } from '@/lib/format'
import { useCart } from './cart'

export function CheckoutForm() {
  const cart = useCart()
  const router = useRouter()
  const [zone, setZone] = useState<Zone>('Inside Dhaka')
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()
  const del = DELIVERY[zone].charge

  if (!cart.items.length)
    return <div className="rounded-2xl bg-soft p-14 text-center"><p className="mb-4 text-neutral-500">Your bag is empty</p><Link href="/shop" className="btn-dark">Shop now</Link></div>

  const submit = (fd: FormData) => {
    setErr('')
    start(async () => {
      const r = await placeOrder({
        name: String(fd.get('name')),
        phone: String(fd.get('phone')),
        address: String(fd.get('address')),
        note: String(fd.get('note') ?? ''),
        zone,
        items: cart.items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
      })
      if (r.ok) {
        cart.clear()
        router.push(`/order-success?id=${r.id}`)
      } else setErr(r.error)
    })
  }

  return (
    <form action={submit} className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-4">
        <label className="label">আপনার নাম *<input name="name" required className="input" placeholder="Full name" /></label>
        <label className="label">মোবাইল নম্বর *<input name="phone" required inputMode="tel" pattern="(\+?88)?01[3-9]\d{8}" className="input" placeholder="01XXXXXXXXX" /></label>
        <label className="label">সম্পূর্ণ ঠিকানা *<textarea name="address" required rows={3} className="input" placeholder="বাসা, রোড, এলাকা, থানা, জেলা" /></label>
        <div className="label">ডেলিভারি এরিয়া
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DELIVERY) as Zone[]).map((z) => (
              <button type="button" key={z} onClick={() => setZone(z)} className={`rounded-xl border p-3 text-left text-sm ${zone === z ? 'border-ink bg-soft' : 'border-neutral-300'}`}>
                <b className="block">{z === 'Inside Dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}</b><span className="font-normal text-neutral-500">{price(DELIVERY[z].charge)}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="label">নোট (optional)<input name="note" className="input" placeholder="e.g. বিকেলে কল দিবেন" /></label>
      </div>
      <div className="h-fit rounded-2xl bg-soft p-5">
        <h3 className="mb-3 font-semibold">Your order</h3>
        {cart.items.map((i) => (
          <div key={i.productId + i.size} className="flex items-center gap-3 border-b border-neutral-200 py-2.5 text-sm">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">{i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}</div>
            <div className="flex-1"><p className="leading-snug">{i.name}</p><p className="text-neutral-500">Size {i.size} × {i.qty}</p></div>
            <b>{price(i.price * i.qty)}</b>
          </div>
        ))}
        <div className="mt-3 flex justify-between text-sm"><span>Subtotal</span><span>{price(cart.subtotal)}</span></div>
        <div className="mt-1 flex justify-between text-sm"><span>Delivery</span><span>{price(del)}</span></div>
        <div className="mt-3 flex justify-between border-t border-neutral-300 pt-3 text-lg font-semibold"><span>Total (COD)</span><span>{price(cart.subtotal + del)}</span></div>
        {err && <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-sale">{err}</p>}
        <button disabled={pending} className="btn-dark mt-4 w-full py-3.5">{pending ? 'Placing order…' : 'Confirm Order — Cash on Delivery'}</button>
      </div>
    </form>
  )
}
