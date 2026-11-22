import { requireAdmin } from '@/lib/auth'
import { listOrders, listPayouts, listResellers } from '@/lib/admin-data'
import { counts, orderMoney } from '@/lib/profit'
import { tk } from '@/lib/format'
import { Kpi, PageHead } from '@/components/admin/ui'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { AddResellerForm, EditResellerForm, PayButton } from '@/components/admin/reseller-forms'
import { DeleteButton } from '@/components/admin/delete-button'
import { deletePayout, deleteReseller } from '@/app/actions/admin'
import { db } from '@/lib/supabase/admin'

export default async function Resellers({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdmin()
  const { edit } = await searchParams
  const [rs, orders, payouts] = await Promise.all([listResellers(), listOrders(), listPayouts()])
  const ed = rs.find((r) => r.id === Number(edit))
  const edEmail = ed?.user_id ? (await db().auth.admin.getUserById(ed.user_id)).data.user?.email ?? '' : ''
  const edPayouts = ed ? payouts.filter((p) => p.reseller_id === ed.id) : []
  const stats = rs.map((r) => {
    const os = orders.filter((o) => o.reseller_id === r.id)
    const earned = os.filter((o) => o.status === 'Delivered').reduce((a, o) => a + orderMoney(o).resellerCommission, 0)
    const paid = payouts.filter((p) => p.reseller_id === r.id).reduce((a, p) => a + Number(p.amount), 0)
    return { r, os, earned, paid, due: earned - paid, sales: os.filter(counts).reduce((a, o) => a + orderMoney(o).goods, 0), mine: os.filter(counts).reduce((a, o) => a + orderMoney(o).profit, 0) }
  })
  return (
    <>
      <PageHead title="Resellers" sub="Reseller der order, sales ar payable commission" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi k="Resellers" v={rs.length} /><Kpi k="Reseller orders" v={stats.reduce((a, s) => a + s.os.length, 0)} />
        <Kpi k="Reseller sales" v={tk(stats.reduce((a, s) => a + s.sales, 0))} /><Kpi k="Commission due" v={tk(stats.reduce((a, s) => a + Math.max(0, s.due), 0))} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className="th">Reseller</th><th className="th text-right">Orders</th><th className="th text-right">Sales</th><th className="th text-right">Your profit</th><th className="th text-right">Earned</th><th className="th text-right">Paid</th><th className="th text-right">Due</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>{stats.map((s) => (
              <tr key={s.r.id} className={ed?.id === s.r.id ? 'bg-blue-50' : ''}>
                <td className="td"><b className="font-semibold">{s.r.name}</b><div className="text-xs text-neutral-500">{s.r.phone} • {s.r.payment_info}</div></td>
                <td className="td text-right">{s.os.length}</td><td className="td text-right">{tk(s.sales)}</td><td className="td text-right text-green-600">{tk(s.mine)}</td>
                <td className="td text-right">{tk(s.earned)}</td><td className="td text-right">{tk(s.paid)}</td><td className="td text-right font-bold">{tk(s.due)}</td>
                <td className="td"><div className="flex items-center justify-end gap-1.5">
                  <PayButton id={s.r.id} due={s.due} />
                  <Link href={`/admin/resellers?edit=${s.r.id}`} scroll={false} aria-label="Edit" title="Edit" className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Pencil size={15} /></Link>
                  <DeleteButton action={deleteReseller.bind(null, s.r.id)} redirectTo={ed?.id === s.r.id ? '/admin/resellers' : undefined}
                    confirmText={`"${s.r.name}" reseller delete korbe?\n• Login bondho hoye jabe\n• ${s.os.length} ta order thakbe, kintu reseller chara\n• Payout history muche jabe${s.due > 0 ? `\n⚠️ Ekhono ${tk(s.due)} commission due ache!` : ''}`} />
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          {!rs.length && <p className="p-8 text-center text-neutral-500">No resellers yet</p>}
        </div>
        {ed ? (
          <div className="grid gap-4 lg:sticky lg:top-6">
            <EditResellerForm key={ed.id} r={ed} email={edEmail} />
            <div className="card">
              <h3 className="mb-2 font-semibold">Payout history — {ed.name}</h3>
              {edPayouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 border-b border-dashed border-line py-2 text-sm last:border-0">
                  <span>{new Date(p.created_at).toLocaleDateString('en-GB')}{p.note && <span className="text-neutral-500"> • {p.note}</span>}</span>
                  <span className="flex items-center gap-2"><b>{tk(p.amount)}</b><DeleteButton action={deletePayout.bind(null, p.id)} confirmText={`${tk(p.amount)} payout entry delete korbe? (Due abar bere jabe)`} /></span>
                </div>
              ))}
              {!edPayouts.length && <p className="text-sm text-neutral-500">Ekhono kono payout nai</p>}
            </div>
          </div>
        ) : (
          <AddResellerForm />
        )}
      </div>
    </>
  )
}
