import Link from 'next/link'
import type { Category } from '@/lib/types'
import { InstallApp } from '@/components/install-app'

export function Footer({ cats }: { cats: Category[] }) {
  const name = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'
  const phone = process.env.NEXT_PUBLIC_PHONE ?? '+880 1602-853899'
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '8801602853899'
  const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL ?? 'https://m.me/61582221041385'
  const facebookUrl = 'https://www.facebook.com/profile.php?id=61582221041385'
  const instagramUrl = 'https://www.instagram.com/tredosneaker/'
  const tiktokUrl = 'https://www.tiktok.com/@tredo621'
  const location = 'North South Road, Near Al Razzak Hotel, Bongshal, Dhaka-1000, Bangladesh'

  return (
    <>
      <section className="mx-auto grid max-w-[1400px] grid-cols-2 gap-5 border-y border-line px-4 py-10 md:grid-cols-4 md:px-8">
        {[
          ['💵', 'Cash on Delivery', 'সারা বাংলাদেশে'],
          ['🚚', 'Fast Delivery', 'ঢাকায় ২৪ ঘণ্টা, বাইরে ২-৩ দিন'],
          ['🔁', 'Easy Exchange', '৭ দিনের মধ্যে সাইজ এক্সচেঞ্জ'],
          ['✅', 'Quality Checked', 'প্রতিটা পেয়ার চেক করে পাঠানো হয়'],
        ].map(([i, t, s]) => (
          <div key={t} className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-soft text-xl">{i}</span>
            <div>
              <b className="block font-semibold">{t}</b>
              <span className="text-[13px] text-neutral-500">{s}</span>
            </div>
          </div>
        ))}
      </section>

      <footer className="bg-neutral-50 px-4 pb-24 pt-14 md:px-8 md:pb-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="text-sm text-neutral-600">
            <b className="mb-3 block text-2xl font-bold tracking-[.18em] text-ink">{name}</b>
            <p>প্রিমিয়াম স্নিকার্স, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।</p>
            <p className="mt-3 flex items-start gap-2">
              <span className="shrink-0">📍</span>
              <span>{location}</span>
            </p>
            <p className="mt-2">
              <a href="tel:+8801602853899" className="inline-flex items-center gap-2 hover:text-ink">
                <span>📞</span>
                <span>{phone}</span>
              </a>
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:border-ink hover:text-ink"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4z" />
                </svg>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:border-ink hover:text-ink"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0-2.2C8.7 0 8.3 0 7 .1 5.7.1 4.8.3 4 .6c-.8.3-1.5.7-2.2 1.4C1.1 2.7.7 3.4.4 4.2.1 5 0 5.9 0 7.2 0 8.5 0 8.9 0 12.2s0 3.7.1 5c.1 1.3.2 2.2.5 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .5 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.2 3-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.5-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.2-2.2-.5-3-.3-.8-.7-1.5-1.4-2.2C21.5 1.3 20.8.9 20 .6c-.8-.3-1.7-.5-3-.5C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" />
                </svg>
              </a>

              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:border-ink hover:text-ink"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <h5 className="mb-1 font-semibold text-ink">Shop</h5>
            {cats.map((c) => (
              <Link key={c.id} href={`/shop?cat=${c.slug}`} className="hover:text-ink">
                {c.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <h5 className="mb-1 font-semibold text-ink">Help</h5>
            <span>Size Guide</span>
            <span>Delivery Info</span>
            <span>Exchange Policy</span>
            <Link href="/login" className="hover:text-ink">Admin / Reseller login</Link>
          </div>

          <div className="text-sm text-neutral-600">
            <h5 className="mb-3 font-semibold text-ink">Talk to us</h5>
            <div className="flex flex-col gap-2">
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-0.5 hover:text-ink"
              >
                <svg className="h-4 w-4 shrink-0 fill-current text-[#0084FF]" viewBox="0 0 24 24">
                  <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.04.57.61.94 1.13.71l1.98-.87c.17-.08.36-.1.55-.06.91.25 1.87.38 2.88.38 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm6 7.46-2.93 4.67c-.47.73-1.47.92-2.17.4l-2.33-1.75a.6.6 0 0 0-.72 0l-3.15 2.4c-.42.32-.97-.18-.69-.63l2.93-4.67c.47-.73 1.47-.92 2.17-.4l2.33 1.75a.6.6 0 0 0 .72 0l3.15-2.4c.42-.32.97.18.69.63z" />
                </svg>
                <span>Messenger</span>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-0.5 hover:text-ink"
              >
                <svg className="h-4 w-4 shrink-0 fill-current text-[#25D366]" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.14.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.14.49.22.56.34.07.12.07.7-.17 1.38z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
            <div className="mt-3">
              <InstallApp />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1400px] flex-wrap justify-between gap-3 border-t border-neutral-200 pt-5 text-[13px] text-neutral-400">
          <span>© {name}. All rights reserved.</span>
          <span className="flex gap-1.5">
            {['COD', 'bKash', 'Nagad'].map((x) => (
              <span key={x} className="rounded-md border border-neutral-300 bg-white px-2 py-0.5 text-xs font-semibold text-neutral-600">
                {x}
              </span>
            ))}
          </span>
        </div>
      </footer>
    </>
  )
}