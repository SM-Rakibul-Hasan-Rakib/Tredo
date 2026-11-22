import { requireReseller } from '@/lib/auth'
import { resellerCatalog } from '@/lib/reseller-data'
import { PageHead } from '@/components/admin/ui'
import { ResellerOrderForm } from '@/components/admin/reseller-order-form'

export default async function NewResellerOrder({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireReseller()
  const [list, sp] = await Promise.all([resellerCatalog(), searchParams])
  return (<><PageHead title="Place Order" sub="Tomar customer er order — amra deliver korbo" /><ResellerOrderForm products={list.filter((p) => totalOk(p.stock))} initial={Number(sp.p) || undefined} /></>)
}
const totalOk = (s: Record<string, number>) => Object.values(s).some((q) => q > 0)
