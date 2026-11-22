'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { askConfirm, notify } from './swal'

/**
 * One delete button for the whole admin panel.
 * Sundor "sure?" popup → server action → ✓ Deleted popup → (optional) onno page e jay.
 * confirmText: first line = title, baki line = details.
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
  const run = async () => {
    const [title, ...rest] = confirmText.split('\n')
    if (!(await askConfirm({ title, text: rest.join('\n').trim() || 'Eta ar ferot ana jabe na.' }))) return
    start(async () => {
      try {
        const r = (await action()) as { ok?: boolean; error?: string } | void
        if (r && r.ok === false) { notify('Delete hoy nai', { type: 'error', text: r.error }); return }
        notify('Deleted!', { text: 'Successfully muche fela hoyeche' })
        if (redirectTo) router.push(redirectTo)
        else router.refresh()
      } catch (e) {
        if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')) throw e // login expired → redirect
        notify('Delete hoy nai', { type: 'error', text: e instanceof Error ? e.message : 'Abar try koro' })
      }
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
