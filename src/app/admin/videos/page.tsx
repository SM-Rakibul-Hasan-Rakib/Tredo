import { requireAdmin } from '@/lib/auth'
import { listProducts, listVideos } from '@/lib/admin-data'
import { PageHead } from '@/components/admin/ui'
import { VideoManager } from '@/components/admin/content-managers'

export default async function Videos() {
  await requireAdmin()
  const [videos, products] = await Promise.all([listVideos(), listProducts()])
  return (<><PageHead title="Videos" sub="Footer er age 'Trending at TREDO' section — product er reel video" /><VideoManager videos={videos} products={products.map((p) => ({ id: p.id, name: p.name, sell_price: p.sell_price }))} /></>)
}
