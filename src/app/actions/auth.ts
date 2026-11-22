'use server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/supabase/server'
import { db } from '@/lib/supabase/admin'
import { ADMIN_COOKIE, checkSession, cookieOptions, signSession } from '@/lib/admin-session'
import { getMe } from '@/lib/auth'

// Simple brute-force brake (per server instance). Supabase Auth also rate-limits sign-ins on its side.
const fails = new Map<string, { n: number; until: number }>()
const WINDOW = 15 * 60_000, MAX_FAILS = 5
const GENERIC = 'Email ba password vul'
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function signIn(_: unknown, fd: FormData) {
  const email = String(fd.get('email') ?? '').trim().toLowerCase()
  const password = String(fd.get('password') ?? '')
  const ip = ((await headers()).get('x-forwarded-for') ?? 'local').split(',')[0].trim()
  const k = `${ip}|${email}`
  const now = Date.now()
  const f = fails.get(k)
  if (f && f.n >= MAX_FAILS && f.until > now) return { error: 'Onek bar vul hoyeche. 15 minute por abar try koro.' }

  const fail = async () => {
    const cur = fails.get(k)
    fails.set(k, { n: cur && cur.until > now ? cur.n + 1 : 1, until: now + WINDOW })
    await wait(700) // slows down password guessing
    return { error: GENERIC } // same message for every failure → doesn't reveal which emails exist
  }
  if (!email || !password) return fail()

  const supa = await authClient()
  const { data, error } = await supa.auth.signInWithPassword({ email, password })
  if (error || !data.user) return fail()

  const { data: p } = await db().from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  if (!p || (p.role !== 'admin' && p.role !== 'reseller')) {
    await supa.auth.signOut({ scope: 'local' }) // a valid account without a role gets nothing
    return fail()
  }
  fails.delete(k)
  const token = await signSession({ uid: data.user.id, iat: now, last: now })
  if (!token) {
    await supa.auth.signOut({ scope: 'local' })
    return { error: 'Server setup incomplete (secret key missing)' }
  }
  ;(await cookies()).set(ADMIN_COOKIE, token, cookieOptions())
  redirect(p.role === 'admin' ? '/admin' : '/reseller')
}

export async function signOut() {
  const supa = await authClient()
  await supa.auth.signOut({ scope: 'local' }) // revokes this device's refresh token at Supabase
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  redirect('/login?out=1')
}

/** Called by the page when the admin is actively using it (typing/clicking) — keeps the idle timer fresh. */
export async function touchSession(): Promise<boolean> {
  const me = await getMe() // fails if already expired → no extension
  if (!me) return false
  const jar = await cookies()
  const s = await checkSession(jar.get(ADMIN_COOKIE)?.value, me.id)
  if (!s.ok) return false
  const token = await signSession({ ...s.p, last: Date.now() }) // iat unchanged → 8h max never extends
  if (token) jar.set(ADMIN_COOKIE, token, cookieOptions())
  return true
}
