'use client'
import { Heart } from 'lucide-react'
import { useWishlist } from './cart'

export function WishButton({ id }: { id: number }) {
  const w = useWishlist()
  const on = w.has(id)
  return (
    <button
      aria-label="Wishlist"
      onClick={() => w.toggle(id)}
      className="absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm"
    >
      <Heart size={17} className={on ? 'fill-sale stroke-sale' : ''} />
    </button>
  )
}
