import 'server-only'
import { db } from './supabase/admin'
import { listOrders, listPayouts } from './admin-data'
import { counts, orderMoney } from './profit'

/** Products for resellers — NO buy price */
export async function resellerCatalog() {
  const { data } = await db().from('products').select('id,name,sell_price,reseller_price,stock,images').eq('is_active', true).order('created_at', { ascending: false })
  return (data ?? []) as { id: number; name: string; sell_price: number; reseller_price: number | null; stock: Record<string, number>; images: string[] }[]
}

export async function resellerSummary(resellerId: number) {
  const [orders, payouts, r] = await Promise.all([listOrders({ resellerId }), listPayouts(resellerId), db().from('resellers').select('*').eq('id', resellerId).single()])
  const earned = orders.filter((o) => o.status === 'Delivered').reduce((a, o) => a + orderMoney(o).resellerCommission, 0)
  const pending = orders.filter((o) => ['Pending', 'Confirmed', 'Shipped'].includes(o.status)).reduce((a, o) => a + orderMoney(o).resellerCommission, 0)
  const paid = payouts.reduce((a, p) => a + Number(p.amount), 0)
  const sales = orders.filter(counts).reduce((a, o) => a + orderMoney(o).goods, 0)
  // strip hidden numbers before sending to the page
  const safe = orders.map((o) => ({
    id: o.id, created_at: o.created_at, status: o.status, customer_name: o.customer_name, phone: o.phone,
    items: o.order_items.map((i) => ({ id: i.id, name: i.product_name, size: i.size, qty: i.qty, img: i.product?.images?.[0] ?? null })),
    cod: orderMoney(o).cod, commission: orderMoney(o).resellerCommission,
  }))
  return { reseller: r.data, orders: safe, earned, pending, paid, due: earned - paid, sales, payouts }
}
