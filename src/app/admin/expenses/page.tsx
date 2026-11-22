import { requireAdmin } from '@/lib/auth'
import { listExpenses, listOrders } from '@/lib/admin-data'
import { counts } from '@/lib/profit'
import { tk } from '@/lib/format'
import { EXPENSE_CATS, MARKETING_CATS } from '@/lib/types'
import { addExpense, deleteExpense } from '@/app/actions/admin'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Kpi, PageHead } from '@/components/admin/ui'
import { DeleteButton } from '@/components/admin/delete-button'
import { ActionForm } from '@/components/admin/action-form'

export default async function Expenses({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdmin()
  const { edit } = await searchParams
  const [exps, orders] = await Promise.all([listExpenses(30), listOrders({ days: 30 })])
  const ed = exps.find((e) => e.id === Number(edit))
  const tot = exps.reduce((a, e) => a + Number(e.amount), 0)
  const mkt = exps.filter((e) => MARKETING_CATS.includes(e.category)).reduce((a, e) => a + Number(e.amount), 0)
  const ok = orders.filter(counts).length
  return (
    <>
      <PageHead title="Marketing & Expenses" sub="Last 30 days — FB ads, boost, packaging, hidden cost shob ekhane" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi k="Total expense" v={tk(tot)} /><Kpi k="Marketing (Ads + Boost + Influencer)" v={tk(mkt)} /><Kpi k="Cost per order" v={tk(ok ? mkt / ok : 0)} d={`${ok} orders`} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className="th">Date</th><th className="th">Category</th><th className="th">Note</th><th className="th text-right">Amount</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>{exps.map((e) => (
              <tr key={e.id} className={ed?.id === e.id ? 'bg-blue-50' : ''}><td className="td text-neutral-500">{e.date}</td><td className="td font-semibold">{e.category}</td><td className="td text-neutral-500">{e.note}</td><td className="td text-right">{tk(e.amount)}</td>
                <td className="td"><div className="flex justify-end gap-1.5">
                  <Link href={`/admin/expenses?edit=${e.id}`} scroll={false} aria-label="Edit" title="Edit" className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Pencil size={15} /></Link>
                  <DeleteButton action={deleteExpense.bind(null, e.id)} confirmText={`${e.category} — ${tk(e.amount)} (${e.date}) expense delete korbe?`} redirectTo={ed?.id === e.id ? '/admin/expenses' : undefined} />
                </div></td></tr>
            ))}</tbody>
          </table>
          {!exps.length && <p className="p-8 text-center text-neutral-500">No expenses yet</p>}
        </div>
        <ActionForm key={ed?.id ?? 'new'} action={addExpense} success={ed ? 'Expense updated!' : 'Expense saved!'} redirectTo={ed ? '/admin/expenses' : undefined} className={`card grid gap-3 lg:sticky lg:top-6 ${ed ? 'ring-2 ring-blue-300' : ''}`}>
          <h3 className="font-semibold">{ed ? '✏️ Edit expense' : 'Add expense'}</h3>
          {ed && <input type="hidden" name="id" value={ed.id} />}
          <label className="label">Category<select name="category" defaultValue={ed?.category} className="input">{[...new Set([...EXPENSE_CATS, ...(ed ? [ed.category] : [])])].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="label">Amount (৳)<input name="amount" type="number" required defaultValue={ed?.amount} className="input" /></label>
          <label className="label">Date<input name="date" type="date" defaultValue={ed?.date} className="input" /></label>
          <label className="label">Note<input name="note" defaultValue={ed?.note ?? ''} className="input" placeholder="e.g. AF1 campaign day 3" /></label>
          <div className="flex gap-2">
            <button className="btn flex-1 bg-[#ff5a1f] text-white">{ed ? '💾 Update expense' : 'Save expense'}</button>
            {ed && <Link href="/admin/expenses" className="btn-light">Cancel</Link>}
          </div>
        </ActionForm>
      </div>
    </>
  )
}
