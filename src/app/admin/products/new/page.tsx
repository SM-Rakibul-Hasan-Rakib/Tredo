import { requireAdmin } from '@/lib/auth'
import { listCategories } from '@/lib/admin-data'
import { PageHead } from '@/components/admin/ui'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProduct() {
  await requireAdmin()
  return (<><PageHead title="Add Product" sub="Photo, dam, size-wise stock dao — save korle website e chole jabe" /><ProductForm cats={await listCategories()} /></>)
}
