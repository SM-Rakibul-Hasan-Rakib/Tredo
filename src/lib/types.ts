export type OrderSource = 'Website' | 'Messenger' | 'WhatsApp' | 'Reseller' | 'Other'
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled'
export const STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Returned', 'Cancelled']
export const SOURCES: OrderSource[] = ['Messenger', 'WhatsApp', 'Website', 'Reseller', 'Other']
export const EXPENSE_CATS = ['Facebook Ads', 'Boost Post', 'Influencer', 'Packaging', 'Photoshoot', 'Rent / Office', 'Salary', 'Return loss', 'Hidden / Misc']
export const MARKETING_CATS = ['Facebook Ads', 'Boost Post', 'Influencer']

export type Category = { id: number; name: string; slug: string; sort_order: number; image_url: string | null; is_active: boolean }

/** Public product — safe to send to the browser (NO buy_price) */
export type PublicProduct = {
  id: number
  name: string
  slug: string
  category_id: number | null
  description: string | null
  sell_price: number
  compare_price: number | null
  stock: Record<string, number>
  images: string[]
  tag: 'HOT' | 'NEW' | null
  created_at: string
}

/** Full product — admin only */
export type Product = PublicProduct & { buy_price: number; reseller_price: number | null; is_active: boolean }

export type OrderItem = {
  id: number
  order_id: number
  product_id: number | null
  product_name: string
  size: string
  qty: number
  unit_price: number
  unit_buy_price: number
  unit_reseller_price: number | null
}

export type Order = {
  id: number
  created_at: string
  source: OrderSource
  status: OrderStatus
  customer_name: string
  phone: string
  address: string | null
  zone: string
  delivery_charge: number
  courier_cost: number
  courier_name: string | null
  tracking_code: string | null
  packaging_cost: number
  discount: number
  advance: number
  reseller_id: number | null
  note: string | null
  order_items: OrderItem[]
}

export type Reseller = { id: number; user_id: string | null; name: string; phone: string | null; payment_info: string | null }
export type Expense = { id: number; date: string; category: string; amount: number; note: string | null }
export type Payout = { id: number; reseller_id: number; amount: number; note: string | null; created_at: string }

export type Banner = {
  id: number
  placement: 'hero' | 'promo'
  title: string | null
  subtitle: string | null
  button_text: string | null
  link: string | null
  image_url: string | null
  mobile_image_url: string | null
  dark_text: boolean
  sort_order: number
  is_active: boolean
}
export type VideoItem = {
  id: number
  video_url: string
  poster_url: string | null
  title: string | null
  product_id: number | null
  sort_order: number
  is_active: boolean
  product?: { name: string; slug: string; sell_price: number; images: string[] } | null
}
