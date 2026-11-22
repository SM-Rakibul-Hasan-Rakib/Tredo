import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/supabase/admin'
import type { Category } from '@/lib/types'
import { PageHead } from '@/components/admin/ui'
import { CategoryManager } from '@/components/admin/content-managers'

export default async function Categories() {
  await requireAdmin()
  const [{ data: cats }, { data: prods }] = await Promise.all([db().from('categories').select('*').order('sort_order'), db().from('products').select('category_id')])
  const counts: Record<number, number> = {}
  for (const p of prods ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1
  return (<><PageHead title="Categories / Brands" sub="Notun brand (jemon Travis Scott) add koro, photo dao — website er menu, filter ar 'Shop by Brand' e auto chole jabe" /><CategoryManager cats={(cats as Category[]) ?? []} counts={counts} /></>)
}
