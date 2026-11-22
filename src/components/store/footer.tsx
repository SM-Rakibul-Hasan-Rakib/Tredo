import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import type { Category } from '@/lib/types'
import { InstallApp } from '@/components/install-app'

export function Footer({ cats }: { cats: Category[] }) {
  const name = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'
  const phone = process.env.NEXT_PUBLIC_PHONE ?? '01602-853899'
  const address = process.env.NEXT_PUBLIC_ADDRESS ?? 'Dhaka, Bangladesh'
  const email = process.env.NEXT_PUBLIC_EMAIL
  const tel = '+88' + phone.replace(/\D/g, '').replace(/^88/, '')
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
      <footer className="bg-neutral-50 px-4 pb-28 pt-14 md:px-8 md:pb-8">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div className="col-span-2 text-sm text-neutral-600 md:col-span-1">
            <b className="mb-3 block text-2xl font-bold tracking-[.18em] text-ink">{name}</b>
            <p className="mb-4">প্রিমিয়াম স্নিকার্স, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।</p>
            <a href={`tel:${tel}`} className="mb-2 flex items-center gap-2.5 hover:text-ink"><Phone size={16} className="shrink-0" /> <span className="font-semibold text-ink">{phone}</span></a>
            <p className="mb-2 flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0" /> <span>{address}</span></p>
            {email && <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-ink"><Mail size={16} className="shrink-0" /> {email}</a>}
          </div>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <h5 className="mb-1 font-semibold text-ink">Shop</h5>
            {cats.map((c) => <Link key={c.id} href={`/shop?cat=${c.slug}`} className="hover:text-ink">{c.name}</Link>)}
          </div>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <h5 className="mb-1 font-semibold text-ink">Help</h5>
            <span>Size Guide</span><span>Delivery Info</span><span>Exchange Policy</span><Link href="/login" className="hover:text-ink">Admin / Reseller login</Link>
          </div>
          <div className="col-span-2 text-sm text-neutral-600 md:col-span-1">
            <h5 className="mb-3 font-semibold text-ink">Talk to us</h5>
            <a href={process.env.NEXT_PUBLIC_MESSENGER_URL ?? 'https://m.me/'} target="_blank" rel="noopener" className="block py-1 hover:text-ink">💬 Messenger</a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}`} target="_blank" rel="noopener" className="block py-1 hover:text-ink">📱 WhatsApp</a>
            <a href={`tel:${tel}`} className="block py-1 hover:text-ink">📞 Call: {phone}</a>
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
