import type { Order } from './types'

/** Every number for one order. Buy price, courier, packaging, reseller commission are subtracted. */
export function orderMoney(o: Order) {
  const items = o.order_items || []
  const goods = items.reduce((a, i) => a + i.unit_price * i.qty, 0)
  const cogs = items.reduce((a, i) => a + i.unit_buy_price * i.qty, 0)
  const resellerCommission = o.reseller_id
    ? items.reduce((a, i) => a + Math.max(0, (i.unit_price - (i.unit_reseller_price ?? i.unit_price)) * i.qty), 0)
    : 0
  const revenue = goods - Number(o.discount) + Number(o.delivery_charge) // what customer pays (COD + advance)
  const profit = revenue - cogs - Number(o.courier_cost) - Number(o.packaging_cost) - resellerCommission
  const cod = revenue - Number(o.advance)
  return { goods, cogs, resellerCommission, revenue, profit, cod, pairs: items.reduce((a, i) => a + i.qty, 0) }
}

export const counts = (o: Pick<Order, 'status'>) => !['Cancelled', 'Returned'].includes(o.status)
