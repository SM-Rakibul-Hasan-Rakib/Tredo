'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import type { Category } from '@/lib/types'
import { useCart } from './cart'

export function Header({ cats }: { cats: Category[] }) {
  const cart = useCart()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const go = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/shop?q=${encodeURIComponent(q)}`)
    setMenu(false)
  }
  return (
    <>
      <div className="bg-ink px-3 py-2 text-center text-[11.5px] text-white sm:text-[12.5px]">
        🚚 সারা বাংলাদেশে <b className="font-semibold text-yellow-300">ক্যাশ অন ডেলিভারি</b><span className="hidden sm:inline"> • ঢাকায় ২৪ ঘণ্টায় ডেলিভারি • ৭ দিনে এক্সচেঞ্জ</span>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3.5 lg:grid-cols-[1fr_auto_1fr] md:px-8">
          <nav className="hidden items-center gap-6 text-[14.5px] font-medium lg:flex xl:gap-7">
            <Link href="/shop?sort=new" className="hover:text-brand">New Arrivals</Link>
            <div className="group relative">
              <Link href="/shop" className="hover:text-brand">Sneakers ▾</Link>
              <div className="invisible absolute -left-4 top-full grid w-[380px] grid-cols-2 gap-1 rounded-2xl border border-line bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                {cats.map((c) => (
                  <Link key={c.id} href={`/shop?cat=${c.slug}`} className="rounded-lg px-3 py-2 hover:bg-soft">{c.name}</Link>
                ))}
              </div>
            </div>
            <Link href="/shop?cat=running" className="hover:text-brand">Running</Link>
            <Link href="/shop?sort=sale" className="text-sale">Sale</Link>
          </nav>
          <button className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => setMenu(true)} aria-label="Menu"><Menu /></button>
          <Link href="/" className="text-center leading-none lg:justify-self-center">
            <span className="block text-xl font-bold tracking-[.18em] lg:text-[26px]">{process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'}</span>
            <span className="mt-1 block text-[9px] font-medium tracking-[.35em] text-neutral-400">BANGLADESH</span>
          </Link>
          <div className="flex items-center justify-end gap-1">
            <form onSubmit={go} className="mr-2 hidden w-60 items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 lg:flex">
              <Search size={16} className="text-neutral-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for sneakers" className="w-full bg-transparent text-sm outline-none" />
            </form>
            <Link href="/login" className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft" aria-label="Admin / Account" title="Admin / Reseller login"><UserRound size={21} /></Link>
            <Link href="/shop?wish=1" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-soft sm:grid" aria-label="Wishlist"><Heart size={21} /></Link>
            <button onClick={() => cart.setOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-soft" aria-label="Bag">
              <ShoppingBag size={21} />
              {cart.count > 0 && <b className="absolute right-0 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] text-white">{cart.count}</b>}
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMenu(false)}>
          <div className="h-full w-[82%] max-w-sm bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between"><b className="tracking-[.18em]">MENU</b><button onClick={() => setMenu(false)}><X /></button></div>
            <form onSubmit={go} className="mb-5 flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5">
              <Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full outline-none" />
            </form>
            <div className="flex flex-col divide-y divide-line text-[15px]">
              <Link onClick={() => setMenu(false)} href="/shop?sort=new" className="py-3">New Arrivals</Link>
              {cats.map((c) => <Link onClick={() => setMenu(false)} key={c.id} href={`/shop?cat=${c.slug}`} className="py-3">{c.name}</Link>)}
              <Link onClick={() => setMenu(false)} href="/shop?sort=sale" className="py-3 text-sale">Sale</Link>
              <Link onClick={() => setMenu(false)} href="/login" className="py-3 text-sm text-neutral-500">Admin / Reseller login</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
