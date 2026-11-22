import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getProduct, listCategories } from '@/lib/admin-data'
import { PageHead } from '@/components/admin/ui'
import { ProductForm } from '@/components/admin/product-form'

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const [p, cats] = await Promise.all([getProduct(Number((await params).id)), listCategories()])
  if (!p) notFound()
  return (<><PageHead title="Edit Product" sub={p.name} /><ProductForm cats={cats} p={p} /></>)
}
