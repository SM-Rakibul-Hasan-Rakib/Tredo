'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

/**
 * One delete button for the whole admin panel.
 * Asks "sure?" first, runs the server action, then (optional) goes to another page.
 */
export function DeleteButton({
  action,
  confirmText,
  redirectTo,
  label,
  className = '',
}: {
  action: () => Promise<unknown>
  confirmText: string
  redirectTo?: string
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const run = () => {
    if (!confirm(confirmText)) return
    start(async () => {
      const r = (await action()) as { ok?: boolean; error?: string } | void
      if (r && r.ok === false) return alert(r.error ?? 'Delete hoy nai')
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    })
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={run}
      aria-label="Delete"
      title="Delete"
      className={
        label
          ? `btn border border-red-200 bg-white text-red-600 hover:bg-red-50 ${className}`
          : `grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 ${className}`
      }
    >
      <Trash2 size={15} />
      {label && (pending ? 'Deleting…' : label)}
    </button>
  )
}
