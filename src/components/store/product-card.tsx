import Link from 'next/link'
import type { Category, PublicProduct } from '@/lib/types'
import { off, price, totalStock } from '@/lib/format'
import { ProductImage } from './product-image'
import { WishButton } from './wish-button'

export function ProductCard({ p, cats, priority }: { p: PublicProduct; cats: Category[]; priority?: boolean }) {
  const d = off(p.sell_price, p.compare_price)
  const stock = totalStock(p.stock)
  const cat = cats.find((c) => c.id === p.category_id)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,.08)]">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-soft">
        <div className="absolute inset-0 transition duration-500 group-hover:scale-105">
          <ProductImage src={p.images[0]} alt={p.name} sizes="(max-width:768px) 50vw, 25vw" priority={priority} />
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {d >= 10 && <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">-{d}%</span>}
          {p.tag && <span className={`grid h-11 w-11 place-items-center rounded-full text-[11px] font-bold text-white ${p.tag === 'HOT' ? 'bg-sale' : 'bg-ink'}`}>{p.tag}</span>}
        </div>
        {stock <= 0 ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-1.5 text-center text-xs font-semibold tracking-widest text-white">SOLD OUT</span>
        ) : stock <= 5 ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-sale">Only {stock} left</span>
        ) : null}
      </Link>
      <WishButton id={p.id} />
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wide">{cat?.name}</span>
        <Link href={`/product/${p.slug}`} className="line-clamp-2 min-h-10 text-[15px] leading-snug hover:text-brand">{p.name}</Link>
        <div className="mt-1 flex items-center gap-2">
          {p.compare_price ? <s className="text-[13px] text-neutral-400">{price(p.compare_price)}</s> : null}
          <b className="text-[17px] font-semibold text-brand">{price(p.sell_price)}</b>
        </div>
      </div>
    </div>
  )
}
