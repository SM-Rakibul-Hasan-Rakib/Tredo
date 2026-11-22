'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = { productId: number; slug: string; name: string; image: string | null; price: number; size: string; qty: number }
type Cart = {
  items: CartItem[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (v: boolean) => void
  add: (i: CartItem) => void
  setQty: (productId: number, size: string, qty: number) => void
  clear: () => void
}
const Ctx = createContext<Cart | null>(null)
const KEY = 'solebd-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [])
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
  }, [items, ready])

  const add = (i: CartItem) =>
    setItems((prev) => {
      const ex = prev.find((p) => p.productId === i.productId && p.size === i.size)
      return ex ? prev.map((p) => (p === ex ? { ...p, qty: p.qty + i.qty } : p)) : [...prev, i]
    })
  const setQty = (productId: number, size: string, qty: number) =>
    setItems((prev) => prev.flatMap((p) => (p.productId === productId && p.size === size ? (qty > 0 ? [{ ...p, qty }] : []) : [p])))

  return (
    <Ctx.Provider
      value={{
        items, open, setOpen, add, setQty,
        clear: () => setItems([]),
        count: items.reduce((a, i) => a + i.qty, 0),
        subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
export const useCart = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart outside CartProvider')
  return c
}

/** Wishlist (saved in the browser) */
export function useWishlist() {
  const [ids, setIds] = useState<number[]>([])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setIds(JSON.parse(localStorage.getItem('solebd-wish') || '[]')) } catch {}
    const on = () => { try { setIds(JSON.parse(localStorage.getItem('solebd-wish') || '[]')) } catch {} }
    window.addEventListener('wish', on)
    return () => window.removeEventListener('wish', on)
  }, [])
  const toggle = (id: number) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    try { localStorage.setItem('solebd-wish', JSON.stringify(next)) } catch {}
    setIds(next)
    window.dispatchEvent(new Event('wish'))
  }
  return { ids, toggle, has: (id: number) => ids.includes(id) }
}
