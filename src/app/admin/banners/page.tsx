import { requireAdmin } from '@/lib/auth'
import { listBanners } from '@/lib/admin-data'
import { PageHead } from '@/components/admin/ui'
import { BannerManager } from '@/components/admin/content-managers'

export default async function Banners() {
  await requireAdmin()
  return (<><PageHead title="Banners" sub="Homepage er slider ar promo banner — nijer photo, lekha ar link" /><BannerManager banners={await listBanners()} /></>)
}
