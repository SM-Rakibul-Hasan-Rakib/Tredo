import { getCategories } from '@/lib/data'
import { CartProvider } from '@/components/store/cart'
import { Header } from '@/components/store/header'
import { CartDrawer } from '@/components/store/cart-drawer'
import { Footer } from '@/components/store/footer'
import { Floating } from '@/components/store/floating'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const cats = await getCategories()
  return (
    <CartProvider>
      <Header cats={cats} />
      <main>{children}</main>
      <Footer cats={cats} />
      <Floating />
      <CartDrawer />
    </CartProvider>
  )
}
