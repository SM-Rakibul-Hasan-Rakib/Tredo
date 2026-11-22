'use client'
import { createClient } from '@supabase/supabase-js'
import { getUploadTarget } from '@/app/actions/content'

/** Shrink photos in the browser (fast site, small uploads). Videos are uploaded as-is. */
async function shrink(file: File, max = 1920): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  const img = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale)
  c.height = Math.round(img.height * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/webp', 0.85))
  return new File([blob], 'image.webp', { type: 'image/webp' })
}

/** Upload a file straight to Supabase Storage and return its public URL */
export async function uploadMedia(file: File, folder: 'banners' | 'categories' | 'videos' | 'orders') {
  if (file.size > 50 * 1024 * 1024) throw new Error('File 50MB er beshi — video choto/compress koro')
  const f = await shrink(file)
  const ext = f.type === 'image/webp' ? 'webp' : (f.name.split('.').pop() ?? 'mp4')
  const t = await getUploadTarget(folder, ext)
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { error } = await supa.storage.from('products').uploadToSignedUrl(t.path, t.token, f, { contentType: f.type, cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  return t.publicUrl
}
