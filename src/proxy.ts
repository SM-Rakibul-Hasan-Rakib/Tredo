import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 1) Separate admin link: if ADMIN_HOST is set (e.g. tredo-admin.vercel.app),
 *    that link opens the admin panel, and /admin on the shop link moves there.
 * 2) Keeps the login session fresh and sends logged-out users to /login.
 */
export async function proxy(request: NextRequest) {
  const adminHost = process.env.ADMIN_HOST?.trim().toLowerCase()
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').toLowerCase()
  const path = request.nextUrl.pathname
  const onAdminHost = !!adminHost && host === adminHost

  if (adminHost && !host.startsWith('localhost')) {
    // admin link → "/" opens the dashboard
    if (onAdminHost && path === '/') return NextResponse.redirect(new URL('/admin', request.url))
    // shop link → /admin, /login, /reseller move to the admin link
    if (!onAdminHost && (path.startsWith('/admin') || path.startsWith('/reseller') || path === '/login')) {
      const url = request.nextUrl.clone()
      url.host = adminHost
      url.port = ''
      url.protocol = 'https'
      return NextResponse.redirect(url)
    }
  }
  if (path === '/' || path === '/login') return NextResponse.next()

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
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }
  return response
}

// Only these paths — every other shop page stays fully static & fast
export const config = { matcher: ['/', '/login', '/admin/:path*', '/reseller/:path*'] }
