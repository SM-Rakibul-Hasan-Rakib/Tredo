import Link from 'next/link'
import { getBanners, getBestSellerIds, getCategories, getProducts, getVideos } from '@/lib/data'
import { Hero, type Slide } from '@/components/store/hero'
import { Rail } from '@/components/store/rail'
import { ProductCard } from '@/components/store/product-card'
import { ProductImage } from '@/components/store/product-image'
import { VideoReels } from '@/components/store/video-reels'

export default async function Home() {
  const [products, cats, best, banners, videos] = await Promise.all([getProducts(), getCategories(), getBestSellerIds(), getBanners(), getVideos()])
  const name = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'
  const catImg = (catId: number) => products.find((p) => p.category_id === catId && p.images[0])?.images[0] ?? null
  const bySlug = (slug: string) => cats.find((c) => c.slug === slug)
  const bestList = [...products].sort((a, b) => (best.indexOf(a.id) + 1 || 1e9) - (best.indexOf(b.id) + 1 || 1e9)).slice(0, 8)

  // HERO — admin banners, or a default design until you add some
  const heroBanners = banners.filter((b) => b.placement === 'hero')
  const slides: Slide[] = heroBanners.length
    ? heroBanners.map((b) => ({ title: b.title ?? '', sub: b.subtitle ?? '', href: b.link || '/shop', button: b.button_text ?? undefined, image: b.image_url, mobileImage: b.mobile_image_url, textDark: b.dark_text }))
    : [
        { title: 'Step Into<br>Premium Comfort', sub: 'Nike Air Force 1, Jordan, Adidas, New Balance — cash on delivery all over Bangladesh.', href: '/shop', button: 'Shop Now', textDark: true },
        { title: 'Jordan<br>Collection', sub: 'The icons are back in stock. Limited pairs available.', href: '/shop?cat=jordan', button: 'Shop Now' },
      ]

  // PROMO — admin banners, or the 2 default ones
  const promos = banners.filter((b) => b.placement === 'promo')
  const promoList = promos.length
    ? promos.map((b) => ({ key: b.id, title: b.title, sub: b.subtitle, btn: b.button_text, href: b.link || '/shop', img: b.image_url, light: b.dark_text }))
    : [
        { key: 1, title: 'Jordan Collection', sub: 'The icons are back', btn: 'Shop Jordan →', href: '/shop?cat=jordan', img: bySlug('jordan')?.image_url ?? null, light: false },
        { key: 2, title: 'New Balance', sub: 'Everyday comfort', btn: 'Explore →', href: '/shop?cat=new-balance', img: bySlug('new-balance')?.image_url ?? null, light: true },
      ]

  return (
    <>
      <Hero slides={slides} />

      <section className="mx-auto grid max-w-[1400px] grid-cols-3 gap-4 px-4 pt-10 md:px-8">
        {[['Premium Quality', 'Sneakers', '/shop'], ['Active Lifestyle', 'Running Shoes', '/shop?cat=running'], ['Explore Quality', 'All Brands', '/shop']].map(([s, t, h]) => (
          <div key={t}>
            <small className="hidden text-xs uppercase tracking-widest text-neutral-400 md:block">{s}</small>
            <h3 className="my-1.5 text-lg md:text-2xl">{t}</h3>
            <Link href={h} className="border-b-[1.5px] border-brand pb-0.5 text-sm font-semibold tracking-wide text-brand">VIEW ALL</Link>
          </div>
        ))}
      </section>

      <Rail title="New Shipment Products" products={products.slice(0, 16)} cats={cats} tabs />

      {/* SHOP BY BRAND — photo comes from Admin → Categories */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 className="mb-6 text-2xl font-semibold md:text-[30px]">Shop by Brand<span className="mt-3 block h-0.5 w-11 bg-ink/15" /></h2>
        <div className="no-scrollbar grid auto-cols-[42%] grid-flow-col gap-3 overflow-x-auto sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop?cat=${c.slug}`} className="group overflow-hidden rounded-2xl bg-soft transition hover:-translate-y-1">
              <div className="relative aspect-square overflow-hidden"><ProductImage src={c.image_url ?? catImg(c.id)} alt={c.name} sizes="(max-width:768px) 45vw, 16vw" className="transition duration-500 group-hover:scale-105" /></div>
              <div className="p-3 text-center"><b className="block text-sm font-semibold md:text-base">{c.name}</b><span className="text-xs text-neutral-500">{products.filter((p) => p.category_id === c.id).length} products</span></div>
            </Link>
          ))}
        </div>
      </section>

      {/* PROMO BANNERS — Admin → Banners → Promo */}
      <section className="grid-cols-[minmax(0,1fr)] mx-auto grid max-w-[1400px] gap-4 px-4 pt-12 md:grid-cols-2 md:px-8">
        {promoList.map((b) => (
          <Link key={b.key} href={b.href} className={`group relative flex min-h-[260px] items-end overflow-hidden rounded-3xl p-7 md:min-h-[360px] ${b.light ? 'bg-[linear-gradient(135deg,#e7eef7,#c9d9ee)] text-ink' : 'bg-[linear-gradient(135deg,#1a1a1a,#3a0d0d)] text-white'}`}>
            {b.img && (
              <>
                <div className="absolute inset-0 transition duration-700 group-hover:scale-105"><ProductImage src={b.img} alt={b.title ?? ''} sizes="(max-width:768px) 100vw, 50vw" /></div>
                <div className={`absolute inset-0 ${b.light ? 'bg-gradient-to-t from-white/75 to-transparent' : 'bg-gradient-to-t from-black/70 to-transparent'}`} />
              </>
            )}
            <div className="relative">
              {b.sub && <small className="text-xs uppercase tracking-[.14em] opacity-80">{b.sub}</small>}
              {b.title && <h3 className="mb-4 mt-1 text-3xl font-bold md:text-4xl">{b.title}</h3>}
              {b.btn && <span className={`btn ${b.light ? 'bg-ink text-white' : 'bg-white text-ink'}`}>{b.btn}</span>}
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold md:text-[30px]">Best Sellers<span className="mt-3 block h-0.5 w-11 bg-ink/15" /></h2>
          <Link href="/shop" className="border-b-[1.5px] border-brand pb-0.5 text-sm font-semibold text-brand">VIEW ALL</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{bestList.map((p) => <ProductCard key={p.id} p={p} cats={cats} />)}</div>
      </section>

      {/* VIDEO SECTION — Admin → Videos */}
      <VideoReels videos={videos} title={`Trending at ${name}`} />
    </>
  )
}
