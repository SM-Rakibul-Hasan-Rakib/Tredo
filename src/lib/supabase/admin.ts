import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client with the SERVICE ROLE key.
 * It bypasses RLS, so only use it on the server after checking who the user is.
 */
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env missing — copy .env.example to .env.local and fill it')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
