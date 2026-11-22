'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Home, MessageCircle, Phone, ShoppingBag, Store } from 'lucide-react'
import { useCart } from './cart'

/** public/icons/whatsapp.svg & public/icons/messenger.svg thakle logo dekhabe, na thakle normal icon */
function BrandIcon({ src, fallback }: { src: string; fallback: React.ReactNode }) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setOk(true)
    img.src = src
  }, [src])
  // eslint-disable-next-line @next/next/no-img-element
  return ok ? <img src={src} alt="" className="h-7 w-7" /> : <>{fallback}</>
}

export function Floating() {
  const cart = useCart()
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const waText = encodeURIComponent('Hi TREDO! Ami ekta sneaker order korte chai 👟')
  const wa = `https://wa.me/${waNumber}?text=${waText}`
  const ms = process.env.NEXT_PUBLIC_MESSENGER_URL ?? 'https://m.me/'

  const btn = 'group relative grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_8px_24px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5 hover:scale-105'
  const tip = 'pointer-events-none absolute right-16 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100'

  return (
    <>
      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-3 md:bottom-6 md:right-6">
        <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp" className={`${btn} bg-[#25D366]`}>
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
          <BrandIcon src="/icons/whatsapp.svg" fallback={<Phone size={26} />} />
          <span className={tip}>WhatsApp e order</span>
        </a>
        <a href={ms} target="_blank" rel="noopener" aria-label="Messenger" className={`${btn} bg-gradient-to-br from-[#00B2FF] via-[#006AFF] to-[#A033FF]`}>
          <BrandIcon src="/icons/messenger.svg" fallback={<MessageCircle size={26} />} />
          <span className={tip}>Messenger e chat</span>
        </a>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 text-[11px] md:hidden">
        <Link href="/shop" className="flex flex-col items-center gap-0.5"><Store size={21} />Shop</Link>
        <Link href="/shop?wish=1" className="flex flex-col items-center gap-0.5"><Heart size={21} />Wishlist</Link>
        <Link href="/" className="flex flex-col items-center gap-0.5"><Home size={21} />Home</Link>
        <button onClick={() => cart.setOpen(true)} className="flex flex-col items-center gap-0.5"><ShoppingBag size={21} />Bag ({cart.count})</button>
        <a href={ms} className="flex flex-col items-center gap-0.5"><MessageCircle size={21} />Contact</a>
      </nav>
    </>
  )
}
