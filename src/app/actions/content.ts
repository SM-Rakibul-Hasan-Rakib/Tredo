'use server'
import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/supabase/admin'

const BUCKET = 'products'
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim() || null
const refresh = () => {
  updateTag('home')
  updateTag('products')
  revalidatePath('/admin', 'layout')
}

/** Gives the browser a one-time URL to upload a big file (photo/video) straight to Supabase Storage. */
export async function getUploadTarget(folder: 'banners' | 'categories' | 'videos' | 'orders', ext: string) {
  await requireAdmin()
  const safe = ext.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 5) || 'bin'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safe}`
  const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path)
  if (error) throw new Error(error.message)
  return { path, token: data.token, publicUrl: db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}

/* ---------- CATEGORIES ---------- */
export async function saveCategory(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const id = Number(fd.get('id') || 0)
  const name = str(fd, 'name')
  if (!name) return { ok: false, error: 'Name dao' }
  const slug = (str(fd, 'slug') ?? name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const row = { name, slug, image_url: str(fd, 'image_url'), sort_order: Number(fd.get('sort_order') || 0), is_active: fd.get('is_active') === 'on' }
  const { error } = id ? await db().from('categories').update(row).eq('id', id) : await db().from('categories').insert(row)
  if (error) return { ok: false, error: error.message.includes('duplicate') ? 'Ei nam/slug er category already ache' : error.message }
  refresh()
  return { ok: true }
}
export async function deleteCategory(id: number) {
  await requireAdmin()
  await db().from('categories').delete().eq('id', id) // products stay, just without category
  refresh()
}

/* ---------- BANNERS ---------- */
export async function saveBanner(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const id = Number(fd.get('id') || 0)
  const row = {
    placement: fd.get('placement') === 'promo' ? 'promo' : 'hero',
    title: str(fd, 'title'), subtitle: str(fd, 'subtitle'), button_text: str(fd, 'button_text'), link: str(fd, 'link') ?? '/shop',
    image_url: str(fd, 'image_url'), mobile_image_url: str(fd, 'mobile_image_url'),
    dark_text: fd.get('dark_text') === 'on', is_active: fd.get('is_active') === 'on', sort_order: Number(fd.get('sort_order') || 0),
  }
  if (!row.image_url && !row.title) return { ok: false, error: 'Photo ba title — kono ekta dao' }
  const { error } = id ? await db().from('banners').update(row).eq('id', id) : await db().from('banners').insert(row)
  if (error) return { ok: false, error: error.message }
  refresh()
  return { ok: true }
}
export async function deleteBanner(id: number) {
  await requireAdmin()
  await db().from('banners').delete().eq('id', id)
  refresh()
}

/* ---------- VIDEOS ---------- */
export async function saveVideo(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const id = Number(fd.get('id') || 0)
  const row = {
    video_url: str(fd, 'video_url'), poster_url: str(fd, 'poster_url'), title: str(fd, 'title'),
    product_id: Number(fd.get('product_id') || 0) || null, sort_order: Number(fd.get('sort_order') || 0), is_active: fd.get('is_active') === 'on',
  }
  if (!row.video_url) return { ok: false, error: 'Video upload koro' }
  const { error } = id ? await db().from('videos').update(row).eq('id', id) : await db().from('videos').insert(row)
  if (error) return { ok: false, error: error.message }
  refresh()
  return { ok: true }
}
export async function deleteVideo(id: number) {
  await requireAdmin()
  await db().from('videos').delete().eq('id', id)
  refresh()
}
