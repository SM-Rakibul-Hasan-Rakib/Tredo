import 'server-only'
import { updateTag } from 'next/cache'
import { db } from './supabase/admin'
import { DELIVERY, type Zone } from './format'
import type { OrderSource, OrderStatus } from './types'

export type NewOrder = {
  source: OrderSource
  status?: OrderStatus
  customer_name: string
  phone: string
  address?: string
  zone: Zone
  delivery_charge?: number
  courier_cost?: number
  courier_name?: string
  packaging_cost?: number
  discount?: number
  advance?: number
  reseller_id?: number | null
  note?: string
  items: { productId: number; size: string; qty: number; unitPrice?: number }[]
}

/**
 * ONE place that creates every order (website, admin, reseller).
 * Prices & buy prices are always read from the database — never trusted from the browser.
 */
export async function createOrder(o: NewOrder, opts: { allowCustomPrice?: boolean } = {}) {
  const phone = o.phone.replace(/[^\d+]/g, '')
  if (!o.customer_name.trim() || phone.length < 11) throw new Error('নাম ও সঠিক মোবাইল নম্বর দিন')
  if (!o.items.length) throw new Error('No items')

  const supa = db()
  const ids = [...new Set(o.items.map((i) => i.productId))]
  const { data: prods, error } = await supa.from('products').select('id,name,sell_price,buy_price,reseller_price,stock,is_active').in('id', ids)
  if (error) throw new Error(error.message)

  const rows = o.items.map((i) => {
    const p = prods!.find((x) => x.id === i.productId)
    if (!p || !p.is_active) throw new Error('Product not available')
    const left = Number(p.stock?.[i.size] ?? 0)
    if (left < i.qty) throw new Error(`${p.name} — size ${i.size} এ মাত্র ${left} টা আছে`)
    if (o.reseller_id && i.unitPrice && i.unitPrice < Number(p.reseller_price ?? p.sell_price)) throw new Error(`${p.name}: selling price reseller price er cheye kom hote parbe na`)
    return {
      product_id: p.id,
      product_name: p.name,
      size: i.size,
      qty: i.qty,
      unit_price: opts.allowCustomPrice && i.unitPrice ? i.unitPrice : Number(p.sell_price),
      unit_buy_price: Number(p.buy_price),
      unit_reseller_price: o.reseller_id ? Number(p.reseller_price ?? p.sell_price) : null,
    }
  })

  const d = DELIVERY[o.zone] ?? DELIVERY['Inside Dhaka']
  const { data: order, error: e2 } = await supa
    .from('orders')
    .insert({
      source: o.source,
      status: o.status ?? 'Pending',
      customer_name: o.customer_name.trim(),
      phone,
      address: o.address?.trim() || null,
      zone: o.zone,
      delivery_charge: o.delivery_charge ?? d.charge,
      courier_cost: o.courier_cost ?? d.courier,
      courier_name: o.courier_name || null,
      packaging_cost: o.packaging_cost ?? 25,
      discount: o.discount ?? 0,
      advance: o.advance ?? 0,
      reseller_id: o.reseller_id ?? null,
      note: o.note || null,
    })
    .select('id')
    .single()
  if (e2) throw new Error(e2.message)

  await supa.from('order_items').insert(rows.map((r) => ({ ...r, order_id: order.id })))
  for (const r of rows) await supa.rpc('change_stock', { p_id: r.product_id, p_size: r.size, p_delta: -r.qty })

  updateTag('products') // website shows new stock instantly
  updateTag('orders-summary')
  return order.id as number
}
