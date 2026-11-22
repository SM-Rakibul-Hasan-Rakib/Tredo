import { requireAdmin } from '@/lib/auth'
import { listExpenses, listOrders } from '@/lib/admin-data'
import { counts } from '@/lib/profit'
import { tk } from '@/lib/format'
import { EXPENSE_CATS, MARKETING_CATS } from '@/lib/types'
import { addExpense, deleteExpense } from '@/app/actions/admin'
import { Kpi, PageHead } from '@/components/admin/ui'

export default async function Expenses() {
  await requireAdmin()
  const [exps, orders] = await Promise.all([listExpenses(30), listOrders({ days: 30 })])
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
            <thead><tr><th className="th">Date</th><th className="th">Category</th><th className="th">Note</th><th className="th text-right">Amount</th><th className="th" /></tr></thead>
            <tbody>{exps.map((e) => (
              <tr key={e.id}><td className="td text-neutral-500">{e.date}</td><td className="td font-semibold">{e.category}</td><td className="td text-neutral-500">{e.note}</td><td className="td text-right">{tk(e.amount)}</td>
                <td className="td"><form action={deleteExpense.bind(null, e.id)}><button aria-label="Delete" className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600">✕</button></form></td></tr>
            ))}</tbody>
          </table>
          {!exps.length && <p className="p-8 text-center text-neutral-500">No expenses yet</p>}
        </div>
        <form action={addExpense} className="card grid gap-3">
          <h3 className="font-semibold">Add expense</h3>
          <label className="label">Category<select name="category" className="input">{EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="label">Amount (৳)<input name="amount" type="number" required className="input" /></label>
          <label className="label">Date<input name="date" type="date" className="input" /></label>
          <label className="label">Note<input name="note" className="input" placeholder="e.g. AF1 campaign day 3" /></label>
          <button className="btn bg-[#ff5a1f] text-white">Save expense</button>
        </form>
      </div>
    </>
  )
}
