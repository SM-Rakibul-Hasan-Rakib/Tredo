'use server'
import { requireReseller } from '@/lib/auth'
import { createOrder } from '@/lib/orders'
import type { Zone } from '@/lib/format'

export async function resellerOrder(input: { name: string; phone: string; address: string; zone: Zone; productId: number; size: string; qty: number; sellPrice: number; note?: string }) {
  const me = await requireReseller()
  try {
    const id = await createOrder(
      { source: 'Reseller', reseller_id: me.resellerId, customer_name: input.name, phone: input.phone, address: input.address, zone: input.zone, note: input.note,
        items: [{ productId: input.productId, size: input.size, qty: Math.max(1, input.qty), unitPrice: input.sellPrice }] },
      { allowCustomPrice: true },
    )
    return { ok: true as const, id }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Error' }
  }
}
