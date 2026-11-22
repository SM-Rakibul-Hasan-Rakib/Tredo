'use server'
import { createOrder } from '@/lib/orders'
import type { Zone } from '@/lib/format'

export async function placeOrder(input: {
  name: string
  phone: string
  address: string
  zone: Zone
  note?: string
  items: { productId: number; size: string; qty: number }[]
}): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    const id = await createOrder({
      source: 'Website',
      customer_name: input.name,
      phone: input.phone,
      address: input.address,
      zone: input.zone,
      note: input.note,
      items: input.items.slice(0, 20).map((i) => ({ productId: Number(i.productId), size: String(i.size), qty: Math.max(1, Math.min(10, Number(i.qty))) })),
    })
    return { ok: true, id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong' }
  }
}
