import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE, checkSession, cookieOptions, signSession } from '@/lib/admin-session'

/**
 * Runs before every admin/reseller request:
 *  1. separate admin link (ADMIN_HOST) handling
 *  2. Supabase login check (token verified with Supabase Auth)
 *  3. our admin session timer: 15 min idle / 8 h max → otherwise sign out + back to /login
 *  4. "no-store" so the browser never caches admin pages (Back button after logout shows nothing)
 * Pages & server actions check everything AGAIN on their own (defence in depth).
 */
export async function proxy(request: NextRequest) {
  const adminHost = process.env.ADMIN_HOST?.trim().toLowerCase()
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').toLowerCase()
  const path = request.nextUrl.pathname
  const onAdminHost = !!adminHost && host === adminHost

  // Admin link: its home page opens the dashboard.
  // /admin also works on the shop link — we never jump between links, because an installed app
  // that is sent to another link opens it in the browser and loses its login. Security is the same on both.
  if (onAdminHost && path === '/') return NextResponse.redirect(new URL('/admin', request.url))
  if (path === '/') return NextResponse.next()
  if (path === '/login') return noStore(NextResponse.next())

  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const toLogin = async (reason: string, signOut: boolean) => {
    if (signOut) await supabase.auth.signOut({ scope: 'local' }).catch(() => {}) // kill the stale Supabase session too
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    if (reason) url.searchParams.set('expired', '1')
    const r = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => r.cookies.set(c)) // carry over cleared Supabase cookies
    r.cookies.delete(ADMIN_COOKIE)
    return noStore(r)
  }

  let user: { id: string } | null = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) user = data.user
  } catch {
    user = null // Auth service down → fail closed
  }
  if (!user) return toLogin('', false)

  const s = await checkSession(request.cookies.get(ADMIN_COOKIE)?.value, user.id)
  if (!s.ok) return toLogin(s.reason, true)

  // role from our own profiles table (server key, never from the browser)
  const role = await getRole(user.id)
  if (role !== 'admin' && role !== 'reseller') return toLogin('role', true)
  if (path.startsWith('/admin') && role !== 'admin') return noStore(NextResponse.redirect(new URL('/reseller', request.url)))
  if (path.startsWith('/reseller') && role !== 'reseller') return noStore(NextResponse.redirect(new URL('/admin', request.url)))

  // page navigation = activity → refresh the idle timer (the 8h max never moves)
  const token = await signSession({ ...s.p, last: Date.now() })
  if (token) response.cookies.set(ADMIN_COOKIE, token, cookieOptions())
  return noStore(response)
}

async function getRole(uid: string): Promise<string | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(uid)}`
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const headers: Record<string, string> = { apikey: key }
    if (!key.startsWith('sb_')) headers.Authorization = `Bearer ${key}` // old JWT-style keys need both
    const r = await fetch(url, { headers, cache: 'no-store' })
    if (!r.ok) return null
    const rows = (await r.json()) as { role: string }[]
    return rows[0]?.role ?? null
  } catch {
    return null // fail closed
  }
}

function noStore(r: NextResponse) {
  r.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  r.headers.set('Pragma', 'no-cache')
  r.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return r
}

// Only these paths — every other shop page stays fully static & fast
export const config = { matcher: ['/', '/login', '/admin/:path*', '/reseller/:path*'] }
