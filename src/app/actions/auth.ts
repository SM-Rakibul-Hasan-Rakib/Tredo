'use server'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/supabase/server'
import { db } from '@/lib/supabase/admin'

export async function signIn(_: unknown, fd: FormData) {
  const supa = await authClient()
  const { data, error } = await supa.auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) })
  if (error || !data.user) return { error: 'Email ba password vul' }
  const { data: p } = await db().from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  if (!p) {
    await supa.auth.signOut()
    return { error: 'Ei account e access nai (profiles table e role set koro)' }
  }
  redirect(p.role === 'admin' ? '/admin' : '/reseller')
}

export async function signOut() {
  const supa = await authClient()
  await supa.auth.signOut()
  redirect('/login')
}
