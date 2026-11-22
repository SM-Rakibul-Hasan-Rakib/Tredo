'use server'
import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/supabase/admin'
import { createOrder, type NewOrder } from '@/lib/orders'
import { counts } from '@/lib/profit'
import { slugify } from '@/lib/format'
import { SOURCES, type OrderStatus } from '@/lib/types'

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
  const supa = db()
  const n = (k: string) => Number(fd.get(k) || 0)
  const t = (k: string) => String(fd.get(k) ?? '').trim()
  const source = (SOURCES as string[]).includes(t('source')) ? t('source') : undefined
  const resellerId = source === 'Reseller' ? Number(fd.get('reseller_id') || 0) || null : null
  const name = t('customer_name'), phone = t('phone').replace(/[^\d+]/g, '')
  await supa.from('orders').update({
    ...(name ? { customer_name: name } : {}),
    ...(phone.length >= 11 ? { phone } : {}),
    ...(t('zone') ? { zone: t('zone') } : {}),
    ...(source ? { source, reseller_id: resellerId } : {}),
    courier_name: t('courier_name') || null,
    tracking_code: t('tracking_code') || null,
    courier_cost: n('courier_cost'), packaging_cost: n('packaging_cost'), delivery_charge: n('delivery_charge'),
    discount: n('discount'), advance: n('advance'), note: t('note') || null,
    address: t('address') || null,
    ...(fd.has('image_url') ? { image_url: t('image_url') || null } : {}),
  }).eq('id', id)
  // reseller order hole item e reseller price lagbe (commission er hisab)
  if (resellerId) {
    const { data: items } = await supa.from('order_items').select('id, product_id, unit_price, unit_reseller_price').eq('order_id', id)
    for (const it of items ?? []) {
      if (it.unit_reseller_price != null || !it.product_id) continue
      const { data: p } = await supa.from('products').select('reseller_price, sell_price').eq('id', it.product_id).maybeSingle()
      await supa.from('order_items').update({ unit_reseller_price: Number(p?.reseller_price ?? p?.sell_price ?? it.unit_price) }).eq('id', it.id)
    }
  }
  updateTag('orders-summary')
  revalidatePath('/admin', 'layout')
}

type ItemEdit = { id?: number; product_id: number | null; size: string; qty: number; unit_price: number; remove?: boolean }

/** Edit products inside an order (size, qty, price, add, remove). Stock is adjusted automatically. */
export async function saveOrderItems(id: number, items: ItemEdit[]): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const supa = db()
  const { data: o } = await supa.from('orders').select('status, reseller_id, order_items(*)').eq('id', id).single()
  if (!o) return { ok: false, error: 'Order pawa jay nai' }
  const old = o.order_items as { id: number; product_id: number | null; size: string; qty: number }[]
  const keep = items.filter((i) => !i.remove && i.qty > 0)
  if (!keep.length) return { ok: false, error: 'Order e kompokkhe 1 ta product thakte hobe. Puro order muchte "Delete order" chapo.' }

  // stock change per product+size:  + = stock e ferot, − = stock theke nibe
  const active = counts(o)
  const delta = new Map<string, number>()
  const add = (pid: number | null, size: string, d: number) => { if (!pid || !active) return; const k = `${pid}|${size}`; delta.set(k, (delta.get(k) ?? 0) + d) }
  for (const it of old) add(it.product_id, it.size, it.qty)
  for (const it of keep) add(it.product_id, it.size, -it.qty)

  const pids = [...new Set(keep.map((i) => i.product_id).filter((x): x is number => !!x))]
  const { data: prods } = pids.length ? await supa.from('products').select('id,name,stock,buy_price,reseller_price,sell_price').in('id', pids) : { data: [] }
  for (const [k, d] of delta) {
    if (d >= 0) continue
    const [pid, size] = k.split('|')
    const p = prods?.find((x) => x.id === Number(pid))
    const left = Number(p?.stock?.[size] ?? 0)
    if (left < -d) return { ok: false, error: `${p?.name ?? 'Product'} — size ${size} e stock e ache ${left} ta, lagbe ${-d} ta` }
  }

  for (const it of old) {
    const e = items.find((x) => x.id === it.id)
    if (!e || e.remove || e.qty <= 0) await supa.from('order_items').delete().eq('id', it.id)
    else await supa.from('order_items').update({ size: e.size, qty: e.qty, unit_price: e.unit_price }).eq('id', it.id)
  }
  const fresh = keep.filter((i) => !i.id)
  if (fresh.length) {
    const rows = fresh.map((i) => {
      const p = prods?.find((x) => x.id === i.product_id)
      if (!p) throw new Error('Product not found')
      return { order_id: id, product_id: p.id, product_name: p.name, size: i.size, qty: i.qty, unit_price: i.unit_price || Number(p.sell_price), unit_buy_price: Number(p.buy_price), unit_reseller_price: o.reseller_id ? Number(p.reseller_price ?? p.sell_price) : null }
    })
    await supa.from('order_items').insert(rows)
  }
  for (const [k, d] of delta) if (d) { const [pid, size] = k.split('|'); await supa.rpc('change_stock', { p_id: Number(pid), p_size: size, p_delta: d }) }

  updateTag('products')
  updateTag('orders-summary')
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/** Delete an order. If it was still active (not Cancelled/Returned), its pairs go back to stock. */
export async function deleteOrder(id: number) {
  await requireAdmin()
  const supa = db()
  const { data: o } = await supa.from('orders').select('status, order_items(product_id,size,qty)').eq('id', id).maybeSingle()
  if (!o) return
  if (counts(o))
    for (const it of o.order_items as { product_id: number | null; size: string; qty: number }[])
      if (it.product_id) await supa.rpc('change_stock', { p_id: it.product_id, p_size: it.size, p_delta: it.qty })
  await supa.from('orders').delete().eq('id', id) // order_items auto delete (cascade)
  updateTag('products')
  updateTag('orders-summary')
  revalidatePath('/admin', 'layout')
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
export async function saveProduct(fd: FormData): Promise<{ ok: false; error: string } | { ok: true }> {
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
  return { ok: true as const }
}

/** Delete a product. Old orders keep the product name & prices (they were copied into the order). */
export async function deleteProduct(id: number) {
  await requireAdmin()
  const supa = db()
  const { data: p } = await supa.from('products').select('images').eq('id', id).maybeSingle()
  const { error } = await supa.from('products').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  // photo gulo storage theke o muche dao (jayga bachate)
  const marker = '/storage/v1/object/public/products/'
  const paths = ((p?.images as string[] | null) ?? []).map((u) => u.split(marker)[1]).filter(Boolean)
  if (paths.length) await supa.storage.from('products').remove(paths)
  updateTag('products')
  updateTag('home')
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/* ---------- EXPENSES ---------- */
/** Add a new expense, or edit one (when the form has an id). */
export async function addExpense(fd: FormData) {
  await requireAdmin()
  if (!Number(fd.get('amount'))) return { ok: false, error: 'Amount dao' }
  const id = Number(fd.get('id') || 0)
  const row = { category: String(fd.get('category')), amount: Number(fd.get('amount')), date: String(fd.get('date')) || undefined, note: String(fd.get('note') || '') || null }
  if (id) await db().from('expenses').update(row).eq('id', id)
  else await db().from('expenses').insert(row)
  revalidatePath('/admin', 'layout')
  return { ok: true }
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
/** Edit reseller info. New password optional (blank = same password). */
export async function updateReseller(_: unknown, fd: FormData) {
  await requireAdmin()
  const supa = db()
  const id = Number(fd.get('id'))
  const name = String(fd.get('name') || '').trim()
  if (!name) return { error: 'Name dao' }
  const { data: r } = await supa.from('resellers').select('user_id').eq('id', id).maybeSingle()
  if (!r) return { error: 'Reseller pawa jay nai' }
  const email = String(fd.get('email') || '').trim(), password = String(fd.get('password') || '')
  if (password && password.length < 6) return { error: 'Password min 6 characters' }
  if (r.user_id && (email || password)) {
    const { error } = await supa.auth.admin.updateUserById(r.user_id, { ...(email ? { email, email_confirm: true } : {}), ...(password ? { password } : {}) })
    if (error) return { error: error.message }
  }
  await supa.from('resellers').update({ name, phone: String(fd.get('phone') || '') || null, payment_info: String(fd.get('payment_info') || '') || null }).eq('id', id)
  revalidatePath('/admin', 'layout')
  return { ok: 'Saved ✓' }
}

/** Delete reseller + their login. Their orders stay (without reseller); payout history is removed. */
export async function deleteReseller(id: number) {
  await requireAdmin()
  const supa = db()
  const { data: r } = await supa.from('resellers').select('user_id').eq('id', id).maybeSingle()
  if (!r) return
  const { error } = await supa.from('resellers').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  if (r.user_id) await supa.auth.admin.deleteUser(r.user_id) // login band
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function deletePayout(id: number) {
  await requireAdmin()
  await db().from('reseller_payouts').delete().eq('id', id)
  revalidatePath('/admin', 'layout')
}

export async function addPayout(resellerId: number, amount: number) {
  await requireAdmin()
  if (amount > 0) await db().from('reseller_payouts').insert({ reseller_id: resellerId, amount })
  revalidatePath('/admin/resellers')
}
