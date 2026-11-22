'use client'
import { useTransition } from 'react'
import { updateStatus } from '@/app/actions/admin'
import { STATUSES, type OrderStatus } from '@/lib/types'
import { toast } from './swal'

export function StatusSelect({ id, value }: { id: number; value: OrderStatus }) {
  const [pending, start] = useTransition()
  return (
    <select disabled={pending} defaultValue={value} onChange={(e) => { const v = e.target.value as OrderStatus; start(async () => { await updateStatus(id, v); toast(`Status → ${v}`) }) }} className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm disabled:opacity-50">
      {STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  )
}
