'use client'
import { useActionState, useTransition } from 'react'
import Link from 'next/link'
import { addPayout, addReseller, updateReseller } from '@/app/actions/admin'
import type { Reseller } from '@/lib/types'

export function AddResellerForm() {
  const [state, action, pending] = useActionState(addReseller, null)
  return (
    <form action={action} className="card grid gap-3">
      <h3 className="font-semibold">Add reseller (login toiri hobe)</h3>
      <label className="label">Name / Page name<input name="name" required className="input" /></label>
      <label className="label">Phone<input name="phone" className="input" /></label>
      <label className="label">Payment (bKash / Nagad)<input name="payment_info" className="input" /></label>
      <label className="label">Login email<input name="email" type="email" required className="input" /></label>
      <label className="label">Password<input name="password" required minLength={6} className="input" /></label>
      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{state.ok}</p>}
      <button disabled={pending} className="btn bg-[#ff5a1f] text-white">{pending ? 'Creating…' : 'Create reseller'}</button>
    </form>
  )
}

export function EditResellerForm({ r, email }: { r: Reseller; email: string }) {
  const [state, action, pending] = useActionState(updateReseller, null)
  return (
    <form action={action} className="card grid gap-3 ring-2 ring-blue-300">
      <h3 className="font-semibold">✏️ Edit reseller</h3>
      <input type="hidden" name="id" value={r.id} />
      <label className="label">Name / Page name<input name="name" required defaultValue={r.name} className="input" /></label>
      <label className="label">Phone<input name="phone" defaultValue={r.phone ?? ''} className="input" /></label>
      <label className="label">Payment (bKash / Nagad)<input name="payment_info" defaultValue={r.payment_info ?? ''} className="input" /></label>
      {r.user_id && <>
        <label className="label">Login email<input name="email" type="email" defaultValue={email} className="input" /></label>
        <label className="label">New password <span className="font-normal text-neutral-500">(khali rakhle ager tai thakbe)</span><input name="password" minLength={6} className="input" autoComplete="new-password" /></label>
      </>}
      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{state.ok}</p>}
      <div className="flex gap-2">
        <button disabled={pending} className="btn flex-1 bg-[#ff5a1f] text-white">{pending ? 'Saving…' : '💾 Save changes'}</button>
        <Link href="/admin/resellers" className="btn-light">Close</Link>
      </div>
    </form>
  )
}

export function PayButton({ id, due }: { id: number; due: number }) {
  const [pending, start] = useTransition()
  if (due <= 0) return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Settled</span>
  return <button disabled={pending} onClick={() => start(() => addPayout(id, due))} className="btn-dark px-3 py-1.5 text-xs">{pending ? '…' : 'Mark paid'}</button>
}
