'use client'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { saveProduct } from '@/app/actions/admin'
import { tk } from '@/lib/format'
import type { Category, Product } from '@/lib/types'

const DEFAULT_SIZES = ['39', '40', '41', '42', '43', '44', '45']

/** Shrinks a photo in the browser (max 1400px, WebP) so uploads are small and the site loads fast */
async function compress(file: File): Promise<File> {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, 1400 / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale)
  c.height = Math.round(img.height * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/webp', 0.82))
  return new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' })
}

export function ProductForm({ cats, p }: { cats: Category[]; p?: Product }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  const [images, setImages] = useState<string[]>(p?.images ?? [])
  const [files, setFiles] = useState<{ file: File; url: string }[]>([])
  const [stock, setStock] = useState<Record<string, number>>(p?.stock && Object.keys(p.stock).length ? p.stock : Object.fromEntries(DEFAULT_SIZES.map((s) => [s, 0])))
  const [newSize, setNewSize] = useState('')
  const [prices, setPrices] = useState({ buy: p?.buy_price ?? 0, sell: p?.sell_price ?? 0 })

  const addFiles = async (list: FileList | null) => {
    if (!list) return
    const out = await Promise.all([...list].map(async (f) => { const c = await compress(f); return { file: c, url: URL.createObjectURL(c) } }))
    setFiles((x) => [...x, ...out])
  }
  const submit = (fd: FormData) => {
    fd.set('images', JSON.stringify(images))
    fd.set('stock', JSON.stringify(stock))
    fd.delete('files')
    files.forEach((f) => fd.append('files', f.file))
    setErr('')
    start(async () => {
      const r = await saveProduct(fd)
      if (r && !r.ok) setErr(r.error)
    })
  }
  const total = Object.values(stock).reduce((a, b) => a + b, 0)

  return (
    <form action={submit} className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid-cols-[minmax(0,1fr)] card grid gap-3 sm:grid-cols-2">
        <label className="label sm:col-span-2">Product name *<input name="name" required defaultValue={p?.name} className="input" placeholder="Nike Air Force 1 '07 Triple White" /></label>
        <label className="label">Category<select name="category_id" defaultValue={p?.category_id ?? cats[0]?.id} className="input">{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="label">Badge<select name="tag" defaultValue={p?.tag ?? ''} className="input"><option value="">None</option><option>HOT</option><option>NEW</option></select></label>
        <label className="label">🔒 Buy price (hidden)<input name="buy_price" type="number" defaultValue={p?.buy_price} onChange={(e) => setPrices((x) => ({ ...x, buy: Number(e.target.value) }))} className="input" /></label>
        <label className="label">Selling price *<input name="sell_price" type="number" required defaultValue={p?.sell_price} onChange={(e) => setPrices((x) => ({ ...x, sell: Number(e.target.value) }))} className="input" /></label>
        <label className="label">Old price (strike-through)<input name="compare_price" type="number" defaultValue={p?.compare_price ?? ''} className="input" /></label>
        <label className="label">Reseller price<input name="reseller_price" type="number" defaultValue={p?.reseller_price ?? ''} className="input" /></label>
        <label className="label sm:col-span-2">Description<textarea name="description" rows={3} defaultValue={p?.description ?? ''} className="input" /></label>

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[13px] font-semibold text-neutral-700">Size-wise stock <span className="font-normal text-neutral-500">(total {total})</span></p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(stock).sort((a, b) => +a - +b).map((s) => (
              <div key={s} className="flex items-center overflow-hidden rounded-lg border border-line">
                <span className="bg-neutral-100 px-2.5 py-2 text-sm font-semibold">{s}</span>
                <input type="number" min={0} value={stock[s]} onChange={(e) => setStock((x) => ({ ...x, [s]: Number(e.target.value) }))} className="w-14 px-2 py-2 text-sm outline-none" />
                <button type="button" onClick={() => setStock((x) => { const n = { ...x }; delete n[s]; return n })} aria-label="Remove size" className="grid h-9 w-8 place-items-center text-neutral-400 hover:text-red-600">✕</button>
              </div>
            ))}
            <div className="flex items-center gap-1"><input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Size" className="input w-20" /><button type="button" onClick={() => { if (newSize) setStock((x) => ({ ...x, [newSize]: 0 })); setNewSize('') }} className="btn-light px-3">+ Add</button></div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[13px] font-semibold text-neutral-700">Photos <span className="font-normal text-neutral-500">(first photo = main; auto-compressed for speed)</span></p>
          <div className="flex flex-wrap gap-2">
            {images.map((src, k) => (
              <div key={src} className="relative h-24 w-24 overflow-hidden rounded-xl bg-neutral-100">
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                <button type="button" onClick={() => setImages((x) => x.filter((y) => y !== src))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-xs shadow">✕</button>
                {k > 0 && <button type="button" onClick={() => setImages((x) => [src, ...x.filter((y) => y !== src)])} className="absolute bottom-1 left-1 rounded bg-white px-1.5 text-[10px] shadow">Main</button>}
              </div>
            ))}
            {files.map((f) => (
              <div key={f.url} className="relative h-24 w-24 overflow-hidden rounded-xl bg-neutral-100 ring-2 ring-[#ff5a1f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setFiles((x) => x.filter((y) => y !== f))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-xs shadow">✕</button>
              </div>
            ))}
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-neutral-300 text-center text-xs text-neutral-500 hover:border-[#ff5a1f]">
              + Add<br />photos<input type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="is_active" defaultChecked={p?.is_active ?? true} className="h-5 w-5 accent-[#ff5a1f]" /> Show on website</label>
        {err && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-600 sm:col-span-2">{err}</p>}
        <button disabled={pending} className="btn bg-[#ff5a1f] text-white sm:col-span-2">{pending ? 'Saving… (uploading photos)' : '💾 Save product'}</button>
      </div>
      <div className="card lg:sticky lg:top-6">
        <h3 className="mb-2 font-semibold">Quick math</h3>
        <p className="text-sm">Profit per pair: <b className="text-green-600">{tk(prices.sell - prices.buy)}</b> ({prices.sell ? Math.round(((prices.sell - prices.buy) / prices.sell) * 100) : 0}%)</p>
        <p className="mt-1 text-sm">Stock value (buy): <b>{tk(total * prices.buy)}</b></p>
        <p className="mt-3 text-xs text-neutral-500">Buy price & reseller price customer kokhono dekhbe na.</p>
      </div>
    </form>
  )
}
