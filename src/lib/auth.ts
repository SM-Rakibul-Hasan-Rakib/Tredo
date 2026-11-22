import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { authClient } from './supabase/server'
import { db } from './supabase/admin'
import { ADMIN_COOKIE, checkSession } from './admin-session'

export type Me = { id: string; email: string; role: 'admin' | 'reseller'; resellerId: number | null }

/**
 * Who is logged in? Everything must pass, otherwise null (fail closed):
 *  1. Supabase verifies the token with its Auth server (getUser, not just reading the cookie)
 *  2. the role comes from our own `profiles` table (server-only, users can't edit it)
 *  3. our signed admin-session cookie exists, belongs to this user, and is not idle/expired
 */
export const getMe = cache(async (): Promise<Me | null> => {
  await connection() // always checked per request, never prerendered/cached
  try {
    const supa = await authClient()
    const { data, error } = await supa.auth.getUser()
    if (error || !data.user) return null
    const jar = await cookies()
    const s = await checkSession(jar.get(ADMIN_COOKIE)?.value, data.user.id)
    if (!s.ok) return null
    const { data: p, error: pe } = await db().from('profiles').select('role, reseller_id').eq('id', data.user.id).maybeSingle()
    if (pe || !p || (p.role !== 'admin' && p.role !== 'reseller')) return null
    return { id: data.user.id, email: data.user.email ?? '', role: p.role, resellerId: p.reseller_id }
  } catch {
    return null
  }
})

/** Call at the top of EVERY admin page & action. */
export async function requireAdmin() {
  const me = await getMe()
  if (!me) redirect('/login?expired=1')
  if (me.role !== 'admin') redirect('/reseller')
  return me
}

/** Call at the top of EVERY reseller page & action. */
export async function requireReseller() {
  const me = await getMe()
  if (!me) redirect('/login?expired=1')
  if (me.role !== 'reseller' || !me.resellerId) redirect('/admin')
  return me as Me & { resellerId: number }
}
