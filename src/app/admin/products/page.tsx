import Link from 'next/link'
import Image from 'next/image'
import { requireAdmin } from '@/lib/auth'
import { listCategories, listProducts } from '@/lib/admin-data'
import { tk, totalStock } from '@/lib/format'
import { PageHead } from '@/components/admin/ui'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteProduct } from '@/app/actions/admin'
import { Pencil } from 'lucide-react'

const delMsg = (name: string) => `"${name}" product delete korbe?\nWebsite theke chole jabe, photo gulo o muche jabe.\nPurono order er hishab thik thakbe.\n\n(Shudhu lukate chaile Edit → "Show on website" off koro)`

export default async function Products() {
  await requireAdmin()
  const [products, cats] = await Promise.all([listProducts(), listCategories()])
  return (
    <>
      <PageHead title="Products & Stock" sub="Ekhane add/edit korle website e sathe sathe update hoy"><Link href="/admin/products/new" className="btn bg-[#ff5a1f] text-white">+ Add Product</Link></PageHead>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-2 lg:hidden">
        {products.map((p) => {
          const st = totalStock(p.stock)
          return (
            <div key={p.id} className={`flex min-w-0 items-center gap-2 rounded-xl border border-line bg-white p-2.5 ${p.is_active ? '' : 'opacity-50'}`}>
            <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">{p.name}</b>
                <p className="text-xs text-neutral-500">Buy {tk(p.buy_price)} • Sell {tk(p.sell_price)} • <span className="text-green-600">+{tk(p.sell_price - p.buy_price)}</span></p>
                <p className={`text-xs ${st <= 5 ? 'text-red-600' : 'text-neutral-500'}`}>Stock {st}</p>
              </div>
            </Link>
              <Link href={`/admin/products/${p.id}`} aria-label="Edit" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line"><Pencil size={15} /></Link>
              <DeleteButton action={deleteProduct.bind(null, p.id)} confirmText={delMsg(p.name)} />
            </div>
          )
        })}
      </div>
      <div className="card hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead><tr><th className="th" /><th className="th">Product</th><th className="th text-right">Buy 🔒</th><th className="th text-right">Sell</th><th className="th text-right">Reseller</th><th className="th text-right">Margin</th><th className="th">Stock (size: qty)</th><th className="th text-right">Stock value</th><th className="th text-right">Actions</th></tr></thead>
          <tbody>
            {products.map((p) => {
              const st = totalStock(p.stock), m = p.sell_price - p.buy_price
              return (
                <tr key={p.id} className={p.is_active ? '' : 'opacity-50'}>
                  <td className="td"><div className="relative h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}</div></td>
                  <td className="td min-w-[200px]"><b className="font-semibold">{p.name}</b><div className="text-xs text-neutral-500">{cats.find((c) => c.id === p.category_id)?.name} {p.tag && `• ${p.tag}`} {!p.is_active && '• HIDDEN'}</div></td>
                  <td className="td text-right">{tk(p.buy_price)}</td><td className="td text-right">{tk(p.sell_price)}</td><td className="td text-right">{p.reseller_price ? tk(p.reseller_price) : '—'}</td>
                  <td className="td text-right font-semibold text-green-600">{tk(m)} <span className="text-xs font-normal text-neutral-500">({p.sell_price ? Math.round((m / p.sell_price) * 100) : 0}%)</span></td>
                  <td className="td text-xs">{Object.entries(p.stock).map(([s, q]) => <span key={s} className={`mr-1 inline-block rounded px-1.5 py-0.5 ${q > 0 ? 'bg-neutral-100' : 'bg-red-50 text-red-600'}`}>{s}:{q}</span>)}<b className={`ml-1 ${st <= 5 ? 'text-red-600' : ''}`}>= {st}</b></td>
                  <td className="td text-right">{tk(st * p.buy_price)}</td>
                  <td className="td"><div className="flex justify-end gap-1.5">
                    <Link href={`/admin/products/${p.id}`} aria-label="Edit" title="Edit" className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Pencil size={15} /></Link>
                    <DeleteButton action={deleteProduct.bind(null, p.id)} confirmText={delMsg(p.name)} />
                  </div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!products.length && <p className="p-10 text-center text-neutral-500">Ekhono kono product nai — “+ Add Product” chapo</p>}
      </div>
    </>
  )
}
