'use client'
import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { signIn } from '@/app/actions/auth'

export default function Login() {
  const [state, action, pending] = useActionState(signIn, null)
  const [note, setNote] = useState('')
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q.get('expired')) setNote('Session shesh hoye geche. Nirapottar jonno abar login koro.')
    else if (q.get('out')) setNote('Logout hoyeche ✓')
  }, [])
  return (
    <div className="grid min-h-screen place-items-center bg-soft px-4">
      <form action={action} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-1 block text-2xl font-bold tracking-[.18em]">{process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'}</Link>
        <p className="mb-6 text-sm text-neutral-500">Admin / Reseller login</p>
        {note && !state?.error && <p className="mb-4 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800">{note}</p>}
        <div className="flex flex-col gap-3.5">
          <label className="label">Email<input name="email" type="email" required autoComplete="username" className="input" /></label>
          <label className="label">Password<input name="password" type="password" required autoComplete="current-password" className="input" /></label>
          {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-2.5 text-sm text-sale">{state.error}</p>}
          <button disabled={pending} className="btn-dark mt-1 py-3">{pending ? 'Checking…' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
