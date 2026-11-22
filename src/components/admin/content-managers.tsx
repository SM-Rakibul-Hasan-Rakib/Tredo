'use client'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteBanner, deleteCategory, deleteVideo, saveBanner, saveCategory, saveVideo } from '@/app/actions/content'
import type { Banner, Category, VideoItem } from '@/lib/types'
import { tk } from '@/lib/format'
import { MediaField } from './media-field'
import { askConfirm, notify } from './swal'

type Res = { ok: boolean; error?: string }
function useSaver(action: (fd: FormData) => Promise<Res>, onDone: () => void) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  const submit = (fd: FormData) => start(async () => { setErr(''); const r = await action(fd); if (r.ok) { notify('Saved!'); onDone() } else { setErr(r.error ?? 'Error'); notify('Save hoy nai', { type: 'error', text: r.error }) } })
  return { pending, err, submit }
}
const Active = ({ on }: { on?: boolean }) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={on ?? true} className="h-5 w-5 accent-[#ff5a1f]" /> Website e dekhabe</label>
const Del = ({ onDel }: { onDel: () => Promise<void> }) => {
  const [p, start] = useTransition()
  return <button type="button" disabled={p} onClick={async () => { if (await askConfirm({ title: 'Delete korbe?', text: 'Eta ar ferot ana jabe na.' })) start(async () => { await onDel(); notify('Deleted!') }) }} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-red-600"><Trash2 size={16} /></button>
}

/* ============ CATEGORIES ============ */
export function CategoryManager({ cats, counts }: { cats: Category[]; counts: Record<number, number> }) {
  const [edit, setEdit] = useState<Category | 'new' | null>(null)
  const s = useSaver(saveCategory, () => setEdit(null))
  const c = edit === 'new' ? undefined : edit ?? undefined
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1fr_380px]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {cats.map((x) => (
          <div key={x.id} className={`overflow-hidden rounded-2xl border border-line bg-white ${x.is_active ? '' : 'opacity-50'}`}>
            <div className="relative aspect-[4/3] bg-neutral-100">{x.image_url && <Image src={x.image_url} alt="" fill sizes="200px" className="object-cover" />}</div>
            <div className="flex items-center gap-2 p-3">
              <div className="min-w-0 flex-1"><b className="block truncate text-sm">{x.name}</b><span className="text-xs text-neutral-500">{counts[x.id] ?? 0} products{!x.is_active && ' • hidden'}</span></div>
              <button onClick={() => setEdit(x)} className="grid h-9 w-9 place-items-center rounded-lg border border-line"><Pencil size={15} /></button>
            </div>
          </div>
        ))}
        <button onClick={() => setEdit('new')} className="grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-[#ff5a1f]">+ New category / brand</button>
      </div>
      {edit && (
        <form key={c?.id ?? 'new'} action={s.submit} className="card grid gap-3 lg:sticky lg:top-6">
          <h3 className="font-semibold">{c ? `Edit: ${c.name}` : 'New category / brand'}</h3>
          {c && <input type="hidden" name="id" value={c.id} />}
          <label className="label">Name *<input name="name" required defaultValue={c?.name} className="input" placeholder="e.g. Travis Scott" /></label>
          <label className="label">Link name (slug)<input name="slug" defaultValue={c?.slug} className="input" placeholder="auto: travis-scott" /></label>
          <MediaField name="image_url" label="Brand photo" hint=" — 'Shop by Brand' e ei chhobi dekhabe" value={c?.image_url} folder="categories" aspect="aspect-[4/3]" />
          <label className="label">Order (choto number age)<input name="sort_order" type="number" defaultValue={c?.sort_order ?? cats.length + 1} className="input" /></label>
          <Active on={c?.is_active} />
          {s.err && <p className="text-sm text-red-600">{s.err}</p>}
          <div className="flex gap-2">
            <button disabled={s.pending} className="btn flex-1 bg-[#ff5a1f] text-white">{s.pending ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEdit(null)} className="btn-light">Cancel</button>
            {c && <Del onDel={async () => { await deleteCategory(c.id); setEdit(null) }} />}
          </div>
        </form>
      )}
    </div>
  )
}

/* ============ BANNERS ============ */
export function BannerManager({ banners }: { banners: Banner[] }) {
  const [edit, setEdit] = useState<Banner | { placement: 'hero' | 'promo' } | null>(null)
  const s = useSaver(saveBanner, () => setEdit(null))
  const b = edit && 'id' in edit ? edit : undefined
  const placement = edit?.placement ?? 'hero'
  const group = (pl: 'hero' | 'promo', title: string, sub: string) => (
    <div className="card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">{title}</h3><p className="text-xs text-neutral-500">{sub}</p></div>
        <button onClick={() => setEdit({ placement: pl })} className="btn bg-[#ff5a1f] text-white">+ Add</button></div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        {banners.filter((x) => x.placement === pl).map((x) => (
          <div key={x.id} className={`overflow-hidden rounded-xl border border-line ${x.is_active ? '' : 'opacity-50'}`}>
            <div className="relative aspect-[16/7] bg-neutral-800">
              {x.image_url && <Image src={x.image_url} alt="" fill sizes="300px" className="object-cover" />}
              <div className={`absolute inset-x-3 bottom-2 text-sm font-bold ${x.dark_text ? 'text-ink' : 'text-white'}`}>{x.title}</div>
            </div>
            <div className="flex items-center gap-2 p-2.5 text-xs text-neutral-500"><span className="flex-1">#{x.sort_order} • {x.link}{!x.is_active && ' • hidden'}</span>
              <button onClick={() => setEdit(x)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink"><Pencil size={14} /></button></div>
          </div>
        ))}
        {!banners.some((x) => x.placement === pl) && <p className="text-sm text-neutral-500">Ekhono nai — default design dekhabe</p>}
      </div>
    </div>
  )
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1fr_400px]">
      <div className="grid gap-4">
        {group('hero', 'Hero slider (upore boro banner)', 'Photo size: 1920×800 (desktop). Phone er jonno 1080×1350 alada dite paro.')}
        {group('promo', 'Promo banners (Shop by Brand er niche)', 'Joto khushi add koro — 2 ta kore pashapashi dekhabe. Size: 1200×800')}
      </div>
      {edit && (
        <form key={b?.id ?? placement} action={s.submit} className="card grid gap-3 lg:sticky lg:top-6">
          <h3 className="font-semibold">{b ? 'Edit banner' : `New ${placement === 'hero' ? 'hero slide' : 'promo banner'}`}</h3>
          {b && <input type="hidden" name="id" value={b.id} />}
          <input type="hidden" name="placement" value={placement} />
          <MediaField name="image_url" label="Photo (desktop)" value={b?.image_url} folder="banners" aspect="aspect-[16/7]" />
          {placement === 'hero' && <MediaField name="mobile_image_url" label="Photo (mobile, optional)" value={b?.mobile_image_url} folder="banners" aspect="aspect-[4/5] max-w-48" />}
          <label className="label">Title<input name="title" defaultValue={b?.title ?? ''} className="input" placeholder="Jordan Collection" /></label>
          <label className="label">Subtitle<input name="subtitle" defaultValue={b?.subtitle ?? ''} className="input" placeholder="The icons are back in stock" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="label">Button text<input name="button_text" defaultValue={b?.button_text ?? 'Shop Now'} className="input" /></label>
            <label className="label">Order<input name="sort_order" type="number" defaultValue={b?.sort_order ?? 0} className="input" /></label>
          </div>
          <label className="label">Link (click korle kothay jabe)<input name="link" defaultValue={b?.link ?? '/shop'} className="input" placeholder="/shop?cat=jordan" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="dark_text" defaultChecked={b?.dark_text} className="h-5 w-5 accent-[#ff5a1f]" /> Photo halka rong er — lekha kalo koro</label>
          <Active on={b?.is_active} />
          {s.err && <p className="text-sm text-red-600">{s.err}</p>}
          <div className="flex gap-2">
            <button disabled={s.pending} className="btn flex-1 bg-[#ff5a1f] text-white">{s.pending ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEdit(null)} className="btn-light">Cancel</button>
            {b && <Del onDel={async () => { await deleteBanner(b.id); setEdit(null) }} />}
          </div>
        </form>
      )}
    </div>
  )
}

/* ============ VIDEOS ============ */
export function VideoManager({ videos, products }: { videos: VideoItem[]; products: { id: number; name: string; sell_price: number }[] }) {
  const [edit, setEdit] = useState<VideoItem | 'new' | null>(null)
  const s = useSaver(saveVideo, () => setEdit(null))
  const v = edit === 'new' ? undefined : edit ?? undefined
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1fr_380px]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {videos.map((x) => (
          <div key={x.id} className={`overflow-hidden rounded-2xl border border-line bg-white ${x.is_active ? '' : 'opacity-50'}`}>
            <video src={x.video_url} poster={x.poster_url ?? undefined} muted playsInline preload="metadata" className="aspect-[9/16] w-full bg-black object-cover" />
            <div className="flex items-center gap-2 p-2.5">
              <div className="min-w-0 flex-1 text-xs"><b className="block truncate">{x.product?.name ?? x.title ?? 'Video'}</b>{x.product && <span className="text-neutral-500">{tk(x.product.sell_price)}</span>}</div>
              <button onClick={() => setEdit(x)} className="grid h-8 w-8 place-items-center rounded-lg border border-line"><Pencil size={14} /></button>
            </div>
          </div>
        ))}
        <button onClick={() => setEdit('new')} className="grid aspect-[9/16] place-items-center rounded-2xl border-2 border-dashed border-neutral-300 p-4 text-center text-sm font-semibold text-neutral-500 hover:border-[#ff5a1f]">+ Add video<br /><span className="font-normal">(Reels / TikTok style, 9:16)</span></button>
      </div>
      {edit && (
        <form key={v?.id ?? 'new'} action={s.submit} className="card grid gap-3 lg:sticky lg:top-6">
          <h3 className="font-semibold">{v ? 'Edit video' : 'New video'}</h3>
          {v && <input type="hidden" name="id" value={v.id} />}
          <MediaField name="video_url" label="Video *" hint=" — MP4, 50MB er kom, 9:16" value={v?.video_url} folder="videos" kind="video" aspect="aspect-[9/16] max-w-52" />
          <MediaField name="poster_url" label="Cover photo (optional)" value={v?.poster_url} folder="videos" aspect="aspect-[9/16] max-w-32" />
          <label className="label">Kon product er video?<select name="product_id" defaultValue={v?.product_id ?? ''} className="input"><option value="">— None —</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({tk(p.sell_price)})</option>)}</select></label>
          <label className="label">Title (product na dile)<input name="title" defaultValue={v?.title ?? ''} className="input" placeholder="e.g. Visit our store" /></label>
          <label className="label">Order<input name="sort_order" type="number" defaultValue={v?.sort_order ?? 0} className="input" /></label>
          <Active on={v?.is_active} />
          {s.err && <p className="text-sm text-red-600">{s.err}</p>}
          <div className="flex gap-2">
            <button disabled={s.pending} className="btn flex-1 bg-[#ff5a1f] text-white">{s.pending ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEdit(null)} className="btn-light">Cancel</button>
            {v && <Del onDel={async () => { await deleteVideo(v.id); setEdit(null) }} />}
          </div>
        </form>
      )}
    </div>
  )
}
