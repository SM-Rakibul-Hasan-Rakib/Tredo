'use client'
import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'

export default function Login() {
  const [state, action, pending] = useActionState(signIn, null)
  return (
    <div className="grid min-h-screen place-items-center bg-soft px-4">
      <form action={action} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <Link href="/" className="mb-1 block text-2xl font-bold tracking-[.18em]">{process.env.NEXT_PUBLIC_SHOP_NAME ?? 'TREDO'}</Link>
        <p className="mb-6 text-sm text-neutral-500">Admin / Reseller login</p>
        <div className="flex flex-col gap-3.5">
          <label className="label">Email<input name="email" type="email" required className="input" /></label>
          <label className="label">Password<input name="password" type="password" required className="input" /></label>
          {state?.error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-sale">{state.error}</p>}
          <button disabled={pending} className="btn-dark mt-1 py-3">{pending ? 'Logging in…' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
