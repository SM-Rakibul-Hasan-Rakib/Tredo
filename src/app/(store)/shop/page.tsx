import Link from 'next/link'
import { Suspense } from 'react'
import { getBestSellerIds, getCategories, getProducts } from '@/lib/data'
import { off, sizesOf } from '@/lib/format'
import { ProductCard } from '@/components/store/product-card'
import { WishlistGrid } from '@/components/store/wishlist-grid'
import { SortSelect } from '@/components/store/sort-select'

export const metadata = { title: 'Shop' }
type SP = { cat?: string; size?: string; max?: string; min?: string; sort?: string; q?: string; wish?: string }

export default function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1400px] animate-pulse px-8 py-10"><div className="h-8 w-60 rounded bg-soft" /></div>}>
      <Shop searchParams={searchParams} />
    </Suspense>
  )
}

async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const [products, cats, best] = await Promise.all([getProducts(), getCategories(), getBestSellerIds()])
  if (sp.wish) return <WishlistGrid products={products} cats={cats} />

  const cat = cats.find((c) => c.slug === sp.cat)
  const q = (sp.q ?? '').toLowerCase().trim()
  let list = products.filter(
    (p) =>
      (!cat || p.category_id === cat.id) &&
      (!sp.size || (p.stock[sp.size] ?? 0) > 0) &&
      (!sp.max || p.sell_price < Number(sp.max)) &&
      (!sp.min || p.sell_price >= Number(sp.min)) &&
      (!q || p.name.toLowerCase().includes(q)),
  )
  const rank = (id: number) => best.indexOf(id) + 1 || 1e9
  list = list.sort((a, b) =>
    sp.sort === 'lo' ? a.sell_price - b.sell_price
    : sp.sort === 'hi' ? b.sell_price - a.sell_price
    : sp.sort === 'new' ? +new Date(b.created_at) - +new Date(a.created_at)
    : sp.sort === 'sale' ? off(b.sell_price, b.compare_price) - off(a.sell_price, a.compare_price)
    : rank(a.id) - rank(b.id),
  )
  const sizes = [...new Set(products.flatMap((p) => sizesOf(p.stock)))].sort((a, b) => +a - +b)
  const link = (patch: Partial<SP>) => {
    const n = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][])
    return `/shop?${n.toString()}`
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">{q ? `Search: “${sp.q}”` : cat?.name ?? 'All Sneakers'}</h1>
      <div className="grid gap-8 md:grid-cols-[230px_1fr]">
        <aside className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-widest">Category</h4>
            <div className="no-scrollbar flex gap-2 overflow-x-auto md:flex-col md:gap-0.5">
              <Link href={link({ cat: undefined })} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${!cat ? 'bg-ink text-white' : 'hover:bg-soft'}`}>All</Link>
              {cats.map((c) => (
                <Link key={c.id} href={link({ cat: c.slug })} className={`flex justify-between whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${cat?.id === c.id ? 'bg-ink text-white' : 'hover:bg-soft'}`}>
                  {c.name}<span className="ml-3 opacity-50">{products.filter((p) => p.category_id === c.id).length}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-widest">Size (EU)</h4>
            <div className="grid grid-cols-6 gap-1.5 md:grid-cols-4">
              {sizes.map((s) => (
                <Link key={s} href={link({ size: sp.size === s ? undefined : s })} className={`rounded-lg border py-2 text-center text-sm ${sp.size === s ? 'border-ink bg-ink text-white' : 'border-neutral-300'}`}>{s}</Link>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-widest">Price</h4>
            {[[undefined, undefined, 'All prices'], [undefined, '2500', 'Under 2,500৳'], [undefined, '3500', 'Under 3,500৳'], ['3500', undefined, '3,500৳ +']].map(([min, max, l]) => (
              <Link key={l} href={link({ min, max })} className={`block py-1.5 text-sm ${sp.min === min && sp.max === max ? 'font-semibold' : 'text-neutral-600'}`}>{sp.min === min && sp.max === max ? '● ' : '○ '}{l}</Link>
            ))}
          </div>
        </aside>
        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-neutral-500">
            <span>Showing {list.length} of {products.length} results</span>
            <SortSelect value={sp.sort ?? 'pop'} />
          </div>
          {list.length ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">{list.map((p, k) => <ProductCard key={p.id} p={p} cats={cats} priority={k < 6} />)}</div>
          ) : (
            <p className="rounded-2xl bg-soft p-14 text-center text-neutral-500">কোনো প্রোডাক্ট পাওয়া যায়নি। ফিল্টার বদলে দেখুন।</p>
          )}
        </div>
      </div>
    </div>
  )
}
