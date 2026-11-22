import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getProduct, listCategories } from '@/lib/admin-data'
import { PageHead } from '@/components/admin/ui'
import { ProductForm } from '@/components/admin/product-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { deleteProduct } from '@/app/actions/admin'

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const [p, cats] = await Promise.all([getProduct(Number((await params).id)), listCategories()])
  if (!p) notFound()
  return (<><PageHead title="Edit Product" sub={p.name}><DeleteButton action={deleteProduct.bind(null, p.id)} confirmText={`"${p.name}" product delete korbe?\nWebsite theke chole jabe, photo gulo o muche jabe.\nPurono order er hishab thik thakbe.`} redirectTo="/admin/products" label="Delete product" /></PageHead><ProductForm cats={cats} p={p} /></>)
}
