'use client'
import { useState } from 'react'
import { uploadMedia } from '@/lib/upload-client'

/** Photo/Video picker: uploads on select, keeps the URL in a hidden input so the form can save it */
export function MediaField({ name, label, value, folder, kind = 'image', hint, aspect = 'aspect-video' }: {
  name: string; label: string; value?: string | null; folder: 'banners' | 'categories' | 'videos'; kind?: 'image' | 'video'; hint?: string; aspect?: string
}) {
  const [url, setUrl] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pick = async (f?: File) => {
    if (!f) return
    setBusy(true); setErr('')
    try { setUrl(await uploadMedia(f, folder)) } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed') }
    setBusy(false)
  }
  return (
    <div className="label">
      {label}{hint && <span className="font-normal text-neutral-500">{hint}</span>}
      <input type="hidden" name={name} value={url} />
      <label className={`relative grid ${aspect} w-full cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-sm font-normal text-neutral-500 hover:border-[#ff5a1f]`}>
        {url ? (
          kind === 'video'
            ? <video src={url} className="h-full w-full object-cover" muted playsInline controls />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={url} alt="" className="h-full w-full object-cover" />
        ) : <span>{busy ? 'Uploading…' : `+ ${kind === 'video' ? 'Video' : 'Photo'} select koro`}</span>}
        {busy && url && <span className="absolute inset-0 grid place-items-center bg-white/70">Uploading…</span>}
        <input type="file" hidden accept={kind === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'} onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {url && <button type="button" onClick={() => setUrl('')} className="self-start text-xs font-normal text-red-600">Remove</button>}
      {err && <span className="text-xs font-normal text-red-600">{err}</span>}
    </div>
  )
}
