'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Boxes, Clapperboard, Image as ImageIcon, LogOut, Package, PlusCircle, Receipt, Store, Tags, TrendingUp, Users } from 'lucide-react'
import { InstallApp } from '@/components/install-app'
import { signOut } from '@/app/actions/auth'

const ADMIN = [
  ['Overview', [['/admin', 'Dashboard', BarChart3]]],
  ['Sales', [['/admin/orders/new', 'New Order', PlusCircle], ['/admin/orders', 'Orders', Package]]],
  ['Catalog & Costs', [['/admin/products', 'Products & Stock', Boxes], ['/admin/expenses', 'Marketing & Expenses', Receipt]]],
  ['Website', [['/admin/categories', 'Categories / Brands', Tags], ['/admin/banners', 'Banners', ImageIcon], ['/admin/videos', 'Videos', Clapperboard]]],
  ['Partners', [['/admin/resellers', 'Resellers', Users]]],
  ['Insights', [['/admin/reports', 'Profit Report', TrendingUp]]],
] as const
const RESELLER = [['Menu', [['/reseller', 'My Dashboard', BarChart3], ['/reseller/catalog', 'Catalog', Boxes], ['/reseller/new-order', 'Place Order', PlusCircle], ['/reseller/orders', 'My Orders', Package]]]] as const

export function SideNav({ kind }: { kind: 'admin' | 'reseller' }) {
  const path = usePathname()
  const groups = kind === 'admin' ? ADMIN : RESELLER
  const active = (h: string) => (h === '/admin' || h === '/reseller' ? path === h : path === h || (path.startsWith(h + '/') && !path.startsWith(h + '/new')))
  return (
    <aside className="no-scrollbar sticky top-0 z-20 flex gap-1 overflow-x-auto bg-[#0f1115] p-2 text-neutral-300 md:h-screen md:w-60 md:shrink-0 md:flex-col md:overflow-visible md:p-3">
      <Link href="/" className="hidden px-2.5 pb-4 pt-1 text-lg font-bold tracking-[.14em] text-white md:block">TREDO <span className="text-[11px] font-normal tracking-normal text-neutral-500">{kind}</span></Link>
      {groups.map(([g, links]) => (
        <div key={g} className="contents md:block">
          <p className="hidden px-2.5 pb-1.5 pt-3 text-[11px] uppercase tracking-widest text-neutral-500 md:block">{g}</p>
          {links.map(([h, l, Icon]) => (
            <Link key={h} href={h} className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium ${active(h) ? 'bg-[#ff5a1f] text-white' : 'hover:bg-white/5'}`}>
              <Icon size={17} />{l}
            </Link>
          ))}
        </div>
      ))}
      <div className="md:mt-auto">
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm hover:bg-white/5"><Store size={17} />View website</Link>
        <form action={signOut}><button className="flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm hover:bg-white/5"><LogOut size={17} />Logout</button></form>
        <div className="md:mt-2"><InstallApp variant="nav" /></div>
      </div>
    </aside>
  )
}