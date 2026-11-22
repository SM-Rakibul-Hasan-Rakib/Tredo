'use server'
import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/supabase/admin'
import { createOrder, type NewOrder } from '@/lib/orders'
import { counts } from '@/lib/profit'
import { slugify } from '@/lib/format'
import type { OrderStatus } from '@/lib/types'

/* ---------- ORDERS ---------- */
export async function updateStatus(id: number, status: OrderStatus) {
  await requireAdmin()
  const supa = db()
  const { data: o } = await supa.from('orders').select('status, order_items(product_id,size,qty)').eq('id', id).single()
  if (!o) return
  const was = counts(o), now = counts({ status })
  // Cancel / Return → stock goes back.  Re-open → stock taken again.
  if (was !== now)
    for (const it of o.order_items as { product_id: number; size: string; qty: number }[])
      if (it.product_id) await supa.rpc('change_stock', { p_id: it.product_id, p_size: it.size, p_delta: now ? -it.qty : it.qty })
  await supa.from('orders').update({ status }).eq('id', id)
  updateTag('products')
  revalidatePath('/admin', 'layout')
}

export async function saveOrderMeta(id: number, fd: FormData) {
  await requireAdmin()
  const n = (k: string) => Number(fd.get(k) || 0)
  await db().from('orders').update({
    courier_name: String(fd.get('courier_name') || '') || null,
    tracking_code: String(fd.get('tracking_code') || '') || null,
    courier_cost: n('courier_cost'), packaging_cost: n('packaging_cost'), delivery_charge: n('delivery_charge'),
    discount: n('discount'), advance: n('advance'), note: String(fd.get('note') || '') || null,
    address: String(fd.get('address') || '') || null,
  }).eq('id', id)
  revalidatePath(`/admin/orders/${id}`)
}

export async function createAdminOrder(o: NewOrder): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await requireAdmin()
  try {
    return { ok: true, id: await createOrder(o, { allowCustomPrice: true }) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

/* ---------- PRODUCTS ---------- */
export async function saveProduct(fd: FormData): Promise<{ ok: false; error: string } | void> {
  await requireAdmin()
  const supa = db()
  const id = Number(fd.get('id') || 0)
  const keep: string[] = JSON.parse(String(fd.get('images') || '[]'))
  const files = fd.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)

  const uploaded: string[] = []
  for (const f of files) {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${f.type === 'image/webp' ? 'webp' : 'jpg'}`
    const { error } = await supa.storage.from('products').upload(path, f, { contentType: f.type, cacheControl: '31536000' })
    if (error) return { ok: false, error: 'Photo upload failed: ' + error.message }
    uploaded.push(supa.storage.from('products').getPublicUrl(path).data.publicUrl)
  }

  const name = String(fd.get('name')).trim()
  const row = {
    name,
    category_id: Number(fd.get('category_id')) || null,
    description: String(fd.get('description') || '') || null,
    buy_price: Number(fd.get('buy_price') || 0),
    sell_price: Number(fd.get('sell_price') || 0),
    compare_price: Number(fd.get('compare_price') || 0) || null,
    reseller_price: Number(fd.get('reseller_price') || 0) || null,
    tag: String(fd.get('tag') || '') || null,
    is_active: fd.get('is_active') === 'on',
    stock: JSON.parse(String(fd.get('stock') || '{}')),
    images: [...keep, ...uploaded],
  }
  if (!name || !row.sell_price) return { ok: false, error: 'Name & selling price required' }

  const { error } = id
    ? await supa.from('products').update(row).eq('id', id)
    : await supa.from('products').insert({ ...row, slug: slugify(name) })
  if (error) return { ok: false, error: error.message }

  updateTag('products') // ⚡ website updates immediately
  revalidatePath('/admin/products')
  redirect('/admin/products')
}

/* ---------- EXPENSES ---------- */
export async function addExpense(fd: FormData) {
  await requireAdmin()
  await db().from('expenses').insert({ category: String(fd.get('category')), amount: Number(fd.get('amount')), date: String(fd.get('date')) || undefined, note: String(fd.get('note') || '') || null })
  revalidatePath('/admin', 'layout')
}
export async function deleteExpense(id: number) {
  await requireAdmin()
  await db().from('expenses').delete().eq('id', id)
  revalidatePath('/admin', 'layout')
}

/* ---------- RESELLERS ---------- */
export async function addReseller(_: unknown, fd: FormData) {
  await requireAdmin()
  const supa = db()
  const email = String(fd.get('email')), password = String(fd.get('password'))
  if (password.length < 6) return { error: 'Password min 6 characters' }
  const { data: u, error } = await supa.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) return { error: error.message }
  const { data: r } = await supa.from('resellers').insert({ user_id: u.user.id, name: String(fd.get('name')), phone: String(fd.get('phone') || '') || null, payment_info: String(fd.get('payment_info') || '') || null }).select('id').single()
  await supa.from('profiles').insert({ id: u.user.id, role: 'reseller', reseller_id: r!.id })
  revalidatePath('/admin/resellers')
  return { ok: `Reseller ready! Login: ${email}` }
}
export async function addPayout(resellerId: number, amount: number) {
  await requireAdmin()
  if (amount > 0) await db().from('reseller_payouts').insert({ reseller_id: resellerId, amount })
  revalidatePath('/admin/resellers')
}
