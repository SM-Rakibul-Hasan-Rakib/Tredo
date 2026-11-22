import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { authClient } from './supabase/server'
import { db } from './supabase/admin'

export type Me = { id: string; email: string; role: 'admin' | 'reseller'; resellerId: number | null }

/** Who is logged in? (cached per request) */
export const getMe = cache(async (): Promise<Me | null> => {
  const supa = await authClient()
  const { data } = await supa.auth.getUser()
  if (!data.user) return null
  const { data: p } = await db().from('profiles').select('role, reseller_id').eq('id', data.user.id).maybeSingle()
  if (!p) return null
  return { id: data.user.id, email: data.user.email ?? '', role: p.role, resellerId: p.reseller_id }
})

/** Call at the top of EVERY admin page & action. */
export async function requireAdmin() {
  const me = await getMe()
  if (!me) redirect('/login')
  if (me.role !== 'admin') redirect('/reseller')
  return me
}

/** Call at the top of EVERY reseller page & action. */
export async function requireReseller() {
  const me = await getMe()
  if (!me) redirect('/login')
  if (me.role !== 'reseller' || !me.resellerId) redirect('/admin')
  return me as Me & { resellerId: number }
}
