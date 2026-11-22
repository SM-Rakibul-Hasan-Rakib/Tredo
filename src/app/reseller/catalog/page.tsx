import Link from 'next/link'
import Image from 'next/image'
import { requireReseller } from '@/lib/auth'
import { resellerCatalog } from '@/lib/reseller-data'
import { tk, totalStock } from '@/lib/format'
import { PageHead, Row } from '@/components/admin/ui'

export default async function Catalog() {
  await requireReseller()
  const list = await resellerCatalog()
  return (
    <>
      <PageHead title="Catalog" sub="Reseller price-e kino, nijer price-e becho — difference tomar profit" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {list.map((p) => {
            const rp = p.reseller_price ?? p.sell_price
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="relative aspect-square bg-neutral-100">{p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="25vw" className="object-cover" />}</div>
                <div className="p-3.5">
                  <b className="font-semibold">{p.name}</b>
                  <Row l="Your price" v={<b>{tk(rp)}</b>} /><Row l="Suggested sell" v={tk(p.sell_price)} /><Row l="Your profit" v={<b className="text-green-600">{tk(p.sell_price - rp)}</b>} />
                  <p className="mb-2 text-xs text-neutral-500">Stock: {Object.entries(p.stock).filter(([, q]) => q > 0).map(([s]) => s).join(', ') || 'Out'} ({totalStock(p.stock)})</p>
                  <Link href={`/reseller/new-order?p=${p.id}`} className="btn-dark w-full py-2">Order this</Link>
                </div>
              </div>
            )
        })}
      </div>
    </>
  )
}
