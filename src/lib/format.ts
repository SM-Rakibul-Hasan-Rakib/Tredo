export const tk = (n: number) => (n < 0 ? '−' : '') + '৳' + Math.abs(Math.round(Number(n) || 0)).toLocaleString('en-IN')
export const price = (n: number) => Math.round(Number(n) || 0).toLocaleString('en-IN') + '৳'
export const orderNo = (id: number) => '#' + (1000 + id)
export const off = (sell: number, compare?: number | null) => (compare && compare > sell ? Math.round((1 - sell / compare) * 100) : 0)
export const totalStock = (stock: Record<string, number>) => Object.values(stock || {}).reduce((a, b) => a + (Number(b) || 0), 0)
export const sizesOf = (stock: Record<string, number>) => Object.keys(stock || {}).sort((a, b) => Number(a) - Number(b))
export const slugify = (s: string) =>
  s.toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)
export const shortDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
export const DELIVERY = { 'Inside Dhaka': { charge: 70, courier: 60 }, 'Outside Dhaka': { charge: 130, courier: 110 } } as const
export type Zone = keyof typeof DELIVERY
export const lastDays = (n: number) => [...Array(n)].map((_, i) => new Date(Date.now() - (n - 1 - i) * 864e5).toISOString().slice(0, 10))
