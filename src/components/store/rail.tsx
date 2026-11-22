'use client'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Category, PublicProduct } from '@/lib/types'
import { ProductCard } from './product-card'

/** one8-style horizontal product slider with category tabs */
export function Rail({ title, products, cats, tabs }: { title: string; products: PublicProduct[]; cats: Category[]; tabs?: boolean }) {
  const [tab, setTab] = useState<number | 'all'>('all')
  const [pct, setPct] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const list = products.filter((p) => tab === 'all' || p.category_id === tab)
  const onScroll = () => {
    const r = ref.current!
    const max = r.scrollWidth - r.clientWidth
    setPct(max > 0 ? r.scrollLeft / max : 0)
  }
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold md:text-[30px]">{title}<span className="mt-3 block h-0.5 w-11 bg-ink/15" /></h2>
        {tabs && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {[{ id: 'all' as const, name: 'All' }, ...cats.slice(0, 4)].map((c) => (
              <button key={c.id} onClick={() => setTab(c.id)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${tab === c.id ? 'border-ink bg-ink text-white' : 'border-neutral-300'}`}>{c.name}</button>
            ))}
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <p className="rounded-2xl bg-soft p-10 text-center text-neutral-500">No products yet — add from Admin → Products</p>
      ) : (
        <div ref={ref} onScroll={onScroll} className="no-scrollbar grid snap-x snap-mandatory auto-cols-[72%] grid-flow-col gap-3 overflow-x-auto sm:auto-cols-[calc((100%-48px)/4)] sm:gap-4">
          {list.map((p, k) => <div key={p.id} className="snap-start"><ProductCard p={p} cats={cats} priority={k < 4} /></div>)}
        </div>
      )}
      <div className="mt-5 flex items-center gap-3">
        <button onClick={() => ref.current?.scrollBy({ left: -ref.current.clientWidth, behavior: 'smooth' })} className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300"><ChevronLeft size={16} /></button>
        <button onClick={() => ref.current?.scrollBy({ left: ref.current.clientWidth, behavior: 'smooth' })} className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300"><ChevronRight size={16} /></button>
        <div className="relative h-0.5 w-56 rounded bg-neutral-200"><i className="absolute -top-px h-1 w-1/4 rounded bg-ink transition-all" style={{ left: `${pct * 75}%` }} /></div>
      </div>
    </section>
  )
}
