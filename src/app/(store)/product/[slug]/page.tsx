import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategories, getProductBySlug, getProducts } from '@/lib/data'
import { off, price } from '@/lib/format'
import { Gallery } from '@/components/store/gallery'
import { AddToCart } from '@/components/store/add-to-cart'
import { Rail } from '@/components/store/rail'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug)
  return p ? { title: p.name, description: p.description ?? `${p.name} — ${price(p.sell_price)}. Cash on delivery in Bangladesh.`, openGraph: { images: p.images.slice(0, 1) } } : {}
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto grid max-w-[1400px] animate-pulse gap-8 px-4 py-8 md:grid-cols-2 md:px-8"><div className="aspect-square rounded-2xl bg-soft" /><div className="h-80 rounded-2xl bg-soft" /></div>}>
      <Product params={params} />
    </Suspense>
  )
}

async function Product({ params }: Props) {
  const { slug } = await params
  const [p, cats, all] = await Promise.all([getProductBySlug(slug), getCategories(), getProducts()])
  if (!p) notFound()
  const cat = cats.find((c) => c.id === p.category_id)
  const d = off(p.sell_price, p.compare_price)
  const related = all.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 8)
  return (
    <>
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 md:grid-cols-[1.1fr_1fr] md:gap-12 md:px-8">
        <Gallery images={p.images} name={p.name} />
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{cat?.name}</span>
          <h1 className="text-2xl font-semibold leading-tight md:text-[32px]">{p.name}</h1>
          <div className="flex items-center gap-3">
            {p.compare_price ? <s className="text-neutral-400">{price(p.compare_price)}</s> : null}
            <b className="text-3xl font-semibold text-brand">{price(p.sell_price)}</b>
            {d > 0 && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-sale">Save {price((p.compare_price ?? 0) - p.sell_price)}</span>}
          </div>
          <AddToCart p={p} />
          <div className="divide-y divide-line border-y border-line text-sm">
            <details open className="py-3"><summary className="cursor-pointer font-semibold">Delivery & Payment</summary><p className="mt-2 leading-relaxed text-neutral-600">ঢাকার ভিতরে ৭০৳ (২৪ ঘণ্টা) • ঢাকার বাইরে ১৩০৳ (২-৩ দিন)। প্রোডাক্ট হাতে পেয়ে টাকা পরিশোধ করুন।</p></details>
            <details className="py-3"><summary className="cursor-pointer font-semibold">Exchange Policy</summary><p className="mt-2 text-neutral-600">সাইজ না মিললে ৭ দিনের মধ্যে এক্সচেঞ্জ। প্রোডাক্ট অব্যবহৃত ও বক্সসহ থাকতে হবে।</p></details>
            <details className="py-3"><summary className="cursor-pointer font-semibold">Size Guide</summary><p className="mt-2 text-neutral-600">EU 40 ≈ US 7 • 41 ≈ 8 • 42 ≈ 8.5 • 43 ≈ 9.5 • 44 ≈ 10 • 45 ≈ 11</p></details>
            {p.description && <details className="py-3"><summary className="cursor-pointer font-semibold">Description</summary><p className="mt-2 whitespace-pre-line text-neutral-600">{p.description}</p></details>}
          </div>
        </div>
      </div>
      {related.length > 0 && <Rail title="You may also like" products={related} cats={cats} />}
    </>
  )
}
