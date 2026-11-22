import { requireAdmin } from '@/lib/auth'
import { listProducts, listResellers } from '@/lib/admin-data'
import { PageHead } from '@/components/admin/ui'
import { OrderForm } from '@/components/admin/order-form'

export default async function NewOrder() {
  await requireAdmin()
  const [products, resellers] = await Promise.all([listProducts(), listResellers()])
  return (
    <>
      <PageHead title="New Order" sub="Messenger / WhatsApp theke asha order ekhane submit koro" />
      <OrderForm products={products.filter((p) => p.is_active)} resellers={resellers} />
    </>
  )
}
