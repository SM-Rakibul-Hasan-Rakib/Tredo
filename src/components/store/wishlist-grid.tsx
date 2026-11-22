'use client'
import type { Category, PublicProduct } from '@/lib/types'
import { useWishlist } from './cart'
import { ProductCard } from './product-card'

export function WishlistGrid({ products, cats }: { products: PublicProduct[]; cats: Category[] }) {
  const w = useWishlist()
  const list = products.filter((p) => w.has(p.id))
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">My Wishlist</h1>
      {list.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{list.map((p) => <ProductCard key={p.id} p={p} cats={cats} />)}</div>
      ) : (
        <p className="rounded-2xl bg-soft p-14 text-center text-neutral-500">Wishlist e kichu nai — ♡ chap diye save koro</p>
      )}
    </div>
  )
}
