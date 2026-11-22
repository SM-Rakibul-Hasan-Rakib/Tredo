import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { db } from './supabase/admin'
import type { Banner, Category, PublicProduct, VideoItem } from './types'

// Only these columns ever reach the website (no buy_price / reseller_price!)
const PUBLIC_COLS = 'id,name,slug,category_id,description,sell_price,compare_price,stock,images,tag,created_at'

/** Cached for speed. Admin changes call updateTag('products') so the site updates instantly. */
export async function getCategories(): Promise<Category[]> {
  'use cache'
  cacheTag('products')
  cacheLife('hours')
  try {
    const { data, error } = await db().from('categories').select('*').eq('is_active', true).order('sort_order')
    if (error) throw error
    return data ?? []
  } catch (e) {
    return failed('getCategories', e)
  }
}

export async function getProducts(): Promise<PublicProduct[]> {
  'use cache'
  cacheTag('products')
  cacheLife('hours')
  try {
    const { data, error } = await db().from('products').select(PUBLIC_COLS).eq('is_active', true).order('created_at', { ascending: false })
    if (error) throw error
    return (data as PublicProduct[]) ?? []
  } catch (e) {
    return failed('getProducts', e)
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  'use cache'
  cacheTag('products')
  cacheLife('hours')
  try {
    const { data, error } = await db().from('products').select(PUBLIC_COLS).eq('slug', slug).eq('is_active', true).maybeSingle()
    if (error) throw error
    return (data as PublicProduct) ?? null
  } catch (e) {
    failed('getProductBySlug', e)
    return null
  }
}

/** Best sellers = most pairs sold in non-cancelled orders */
export async function getBestSellerIds(): Promise<number[]> {
  'use cache'
  cacheTag('orders-summary')
  cacheLife('hours')
  try {
    const { data, error } = await db().from('order_items').select('product_id, qty').limit(5000)
    if (error) throw error
    const m = new Map<number, number>()
    for (const r of data ?? []) if (r.product_id) m.set(r.product_id, (m.get(r.product_id) ?? 0) + r.qty)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
  } catch (e) {
    return failed('getBestSellerIds', e)
  }
}

export async function getBanners(): Promise<Banner[]> {
  'use cache'
  cacheTag('home')
  cacheLife('hours')
  try {
    const { data, error } = await db().from('banners').select('*').eq('is_active', true).order('sort_order').order('id')
    if (error) throw error
    return (data as Banner[]) ?? []
  } catch (e) {
    return failed('getBanners', e)
  }
}

export async function getVideos(): Promise<VideoItem[]> {
  'use cache'
  cacheTag('home')
  cacheTag('products')
  cacheLife('hours')
  try {
    const { data, error } = await db().from('videos').select('*, product:products(name,slug,sell_price,images)').eq('is_active', true).order('sort_order').order('id')
    if (error) throw error
    return (data as VideoItem[]) ?? []
  } catch (e) {
    return failed('getVideos', e)
  }
}

/** On error: print the reason in the terminal and DON'T keep the empty result cached (retry after ~1 minute). */
function failed(where: string, e: unknown): [] {
  console.error(`❌ [${where}] Supabase error:`, e instanceof Error ? e.message : JSON.stringify(e), '→ open /setup-check')
  cacheLife('minutes') // retry after ~1 minute
  return []
}
