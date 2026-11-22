import Link from 'next/link'
import type { Category } from '@/lib/types'
import { InstallApp } from '@/components/install-app'

export function Footer({ cats }: { cats: Category[] }) {
  const name = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] grid-cols-2 gap-5 border-y border-line px-4 py-10 md:grid-cols-4 md:px-8">
        {[['💵', 'Cash on Delivery', 'সারা বাংলাদেশে'], ['🚚', 'Fast Delivery', 'ঢাকায় ২৪ ঘণ্টা, বাইরে ২-৩ দিন'], ['🔁', 'Easy Exchange', '৭ দিনের মধ্যে সাইজ এক্সচেঞ্জ'], ['✅', 'Quality Checked', 'প্রতিটা পেয়ার চেক করে পাঠানো হয়']].map(([i, t, s]) => (
          <div key={t} className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-soft text-xl">{i}</span>
            <div><b className="block font-semibold">{t}</b><span className="text-[13px] text-neutral-500">{s}</span></div>
          </div>
        ))}
      </section>
      <footer className="bg-neutral-50 px-4 pb-24 pt-14 md:px-8 md:pb-8">
        <div className="grid-cols-[minmax(0,1fr)] mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="text-sm text-neutral-600">
            <b className="mb-3 block text-2xl font-bold tracking-[.18em] text-ink">{name}</b>
            <p>প্রিমিয়াম স্নিকার্স, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।</p>
            <p className="mt-2">📞 {process.env.NEXT_PUBLIC_PHONE ?? '01XXXXXXXXX'}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <h5 className="mb-1 font-semibold text-ink">Shop</h5>
            {cats.map((c) => <Link key={c.id} href={`/shop?cat=${c.slug}`} className="hover:text-ink">{c.name}</Link>)}
          </div>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <h5 className="mb-1 font-semibold text-ink">Help</h5>
            <span>Size Guide</span><span>Delivery Info</span><span>Exchange Policy</span><Link href="/login">Admin / Reseller login</Link>
          </div>
          <div className="text-sm text-neutral-600">
            <h5 className="mb-3 font-semibold text-ink">Talk to us</h5>
            <a href={process.env.NEXT_PUBLIC_MESSENGER_URL ?? 'https://m.me/'} className="block py-1 hover:text-ink">💬 Messenger</a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}`} className="block py-1 hover:text-ink">📱 WhatsApp</a>
            <InstallApp />
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1400px] flex-wrap justify-between gap-3 border-t border-neutral-200 pt-5 text-[13px] text-neutral-400">
          <span>© {name}. All rights reserved.</span>
          <span className="flex gap-1.5">{['COD', 'bKash', 'Nagad'].map((x) => <span key={x} className="rounded-md border border-neutral-300 bg-white px-2 py-0.5 text-xs font-semibold text-neutral-600">{x}</span>)}</span>
        </div>
      </footer>
    </>
  )
}
