'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** textDark = kalo lekha (halka photo/background er jonno) */
export type Slide = { title: string; sub: string; href: string; button?: string; bg?: string; textDark?: boolean; image?: string | null; mobileImage?: string | null }

export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5500)
    return () => clearInterval(t)
  }, [slides.length])
  return (
    <section className="relative h-[78svh] max-h-[680px] min-h-[460px] overflow-hidden bg-neutral-900">
      {slides.map((s, k) => {
        const full = !!s.image // admin photo = full background
        const light = !!s.textDark
        const bg = s.bg ?? (light ? 'linear-gradient(120deg,#efe3d3,#d9bfa2 55%,#c4a283)' : 'radial-gradient(circle at 70% 40%,#3a0d0d,#121212 60%)')
        return (
          <div key={k} className={`absolute inset-0 transition-opacity duration-700 ${k === i ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'}`} style={{ background: bg, color: light ? '#111' : '#fff' }}>
            {full && (
              <>
                <Image src={s.image!} alt={s.title} fill priority={k === 0} sizes="100vw" className={`object-cover ${s.mobileImage ? 'hidden md:block' : ''}`} />
                {s.mobileImage && <Image src={s.mobileImage} alt={s.title} fill priority={k === 0} sizes="100vw" className="object-cover md:hidden" />}
                <div className={`absolute inset-0 ${light ? 'bg-gradient-to-t from-white/70 via-white/10 to-transparent' : 'bg-gradient-to-t from-black/70 via-black/15 to-transparent'}`} />
              </>
            )}
            <Link href={s.href} className="absolute inset-0" aria-label={s.title} />
            <div className="pointer-events-none absolute bottom-16 left-0 max-w-xl px-5 md:px-[4vw]">
              {s.title && <h1 className="text-[clamp(30px,8vw,64px)] font-bold leading-[1.02] tracking-tight" dangerouslySetInnerHTML={{ __html: s.title }} />}
              {s.sub && <p className="mb-6 mt-3 text-[15px] opacity-90 sm:text-base md:text-lg">{s.sub}</p>}
              {s.button && <Link href={s.href} className={`btn pointer-events-auto px-7 py-3.5 text-[15px] ${light ? 'bg-ink text-white' : 'bg-white text-ink'}`}>{s.button}</Link>}
            </div>
          </div>
        )
      })}
      {slides.length > 1 && (
        <>
          <button onClick={() => setI((i - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 md:grid" aria-label="Previous"><ChevronLeft /></button>
          <button onClick={() => setI((i + 1) % slides.length)} className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 md:grid" aria-label="Next"><ChevronRight /></button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, k) => <button key={k} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? 'w-7 bg-white' : 'w-2 bg-white/60'}`} aria-label={`Slide ${k + 1}`} />)}
          </div>
        </>
      )}
    </section>
  )
}
