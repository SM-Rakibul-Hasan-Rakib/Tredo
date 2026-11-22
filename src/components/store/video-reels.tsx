'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { VideoItem } from '@/lib/types'
import { price } from '@/lib/format'

function Reel({ v }: { v: VideoItem }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  useEffect(() => {
    // play only when on screen → saves data & battery on phones
    const el = ref.current!
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const p = v.product
  const body = (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16 text-white">
      {p?.images?.[0] && <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-white/10"><Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" /></div>}
      <div className="min-w-0">
        <p className="line-clamp-2 text-[15px] leading-snug">{p?.name ?? v.title}</p>
        {p && <p className="mt-0.5 text-xl font-semibold">Tk {Math.round(p.sell_price).toLocaleString('en-IN')}.00</p>}
      </div>
    </div>
  )
  return (
    <div className="relative aspect-[9/16] snap-start overflow-hidden rounded-2xl bg-black">
      <video ref={ref} src={v.video_url} poster={v.poster_url ?? undefined} muted={muted} loop playsInline preload="metadata" className="h-full w-full object-cover" />
      {p ? <Link href={`/product/${p.slug}`} aria-label={p.name} className="absolute inset-0">{body}</Link> : body}
      <button onClick={() => setMuted(!muted)} aria-label="Sound" className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow">
        {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
      </button>
      {p && <span className="sr-only">{price(p.sell_price)}</span>}
    </div>
  )
}

export function VideoReels({ videos, title }: { videos: VideoItem[]; title: string }) {
  if (!videos.length) return null
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase tracking-tight md:text-4xl">{title}</h2>
      <div className="no-scrollbar grid snap-x snap-mandatory auto-cols-[68%] grid-flow-col gap-3 overflow-x-auto sm:auto-cols-[calc((100%-48px)/4)] sm:gap-4">
        {videos.map((v) => <Reel key={v.id} v={v} />)}
      </div>
    </section>
  )
}
