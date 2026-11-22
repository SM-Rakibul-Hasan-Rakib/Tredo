'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { notify } from './swal'

/**
 * Server-action form with a sweet "✓ Saved!" popup (or red error popup).
 * After success: goes to redirectTo, or refreshes the page data.
 */
export function ActionForm({
  action,
  success = 'Saved!',
  successText,
  redirectTo,
  className,
  children,
}: {
  action: (fd: FormData) => Promise<unknown>
  success?: string
  successText?: string
  redirectTo?: string
  className?: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <form
      className={className}
      action={(fd) =>
        start(async () => {
          try {
            const r = (await action(fd)) as { ok?: boolean; error?: string } | void
            if (r && r.ok === false) { notify('Save hoy nai', { type: 'error', text: r.error }); return }
            notify(success, { text: successText })
            if (redirectTo) router.push(redirectTo)
            else router.refresh()
          } catch (e) {
            if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')) throw e // login expired → redirect
            notify('Save hoy nai', { type: 'error', text: e instanceof Error ? e.message : 'Abar try koro' })
          }
        })
      }
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
    </form>
  )
}
