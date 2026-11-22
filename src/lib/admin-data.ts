import 'server-only'
import { db } from './supabase/admin'
import type { Banner, Category, Expense, Order, Payout, Product, Reseller, VideoItem } from './types'

const since = (days?: number) => (days ? new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10) : '2000-01-01')

export async function listOrders(opts: { days?: number; resellerId?: number; limit?: number } = {}): Promise<Order[]> {
  let q = db().from('orders').select('*, order_items(*)').gte('created_at', since(opts.days)).order('created_at', { ascending: false }).limit(opts.limit ?? 2000)
  if (opts.resellerId) q = q.eq('reseller_id', opts.resellerId)
  const { data } = await q
  return (data as Order[]) ?? []
}
export async function getOrder(id: number): Promise<Order | null> {
  const { data } = await db().from('orders').select('*, order_items(*)').eq('id', id).maybeSingle()
  return data as Order | null
}
export async function listProducts(): Promise<Product[]> {
  const { data } = await db().from('products').select('*').order('created_at', { ascending: false })
  return (data as Product[]) ?? []
}
export async function getProduct(id: number): Promise<Product | null> {
  const { data } = await db().from('products').select('*').eq('id', id).maybeSingle()
  return data as Product | null
}
export async function listCategories(): Promise<Category[]> {
  const { data } = await db().from('categories').select('*').order('sort_order')
  return data ?? []
}
export async function listResellers(): Promise<Reseller[]> {
  const { data } = await db().from('resellers').select('*').order('id')
  return data ?? []
}
export async function listExpenses(days?: number): Promise<Expense[]> {
  const { data } = await db().from('expenses').select('*').gte('date', since(days)).order('date', { ascending: false })
  return data ?? []
}
export async function listPayouts(resellerId?: number): Promise<Payout[]> {
  let q = db().from('reseller_payouts').select('*').order('created_at', { ascending: false })
  if (resellerId) q = q.eq('reseller_id', resellerId)
  const { data } = await q
  return data ?? []
}
export async function listBanners(): Promise<Banner[]> {
  const { data } = await db().from('banners').select('*').order('placement').order('sort_order').order('id')
  return (data as Banner[]) ?? []
}
export async function listVideos(): Promise<VideoItem[]> {
  const { data } = await db().from('videos').select('*, product:products(name,slug,sell_price,images)').order('sort_order').order('id')
  return (data as VideoItem[]) ?? []
}
