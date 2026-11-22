/**
 * Admin/reseller session timer — enforced on the SERVER (proxy + every page/action).
 *
 * Supabase keeps users logged in forever by default (free plan has no session time-box),
 * so we add our own signed, httpOnly cookie that is created ONLY by a real password login:
 *   - idle timeout:  ADMIN_IDLE_TIMEOUT_MINUTES (default 15)
 *   - max lifetime:  ADMIN_MAX_SESSION_HOURS   (default 8, never extended by activity)
 * No valid cookie → access denied (fail closed), Supabase session is signed out.
 */
export const ADMIN_COOKIE = 'tredo_admin_session'
const num = (v: string | undefined, d: number) => (Number(v) > 0 ? Number(v) : d)
export const IDLE_MS = num(process.env.ADMIN_IDLE_TIMEOUT_MINUTES, 15) * 60_000
export const MAX_MS = num(process.env.ADMIN_MAX_SESSION_HOURS, 8) * 3_600_000

type Payload = { uid: string; iat: number; last: number }
export type Check = { ok: true; p: Payload } | { ok: false; reason: 'missing' | 'invalid' | 'user' | 'idle' | 'max' | 'nokey' }

const enc = new TextEncoder()
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function key(): Promise<CryptoKey | null> {
  // dedicated secret if set, otherwise derived from the server-only Supabase secret (never sent to browsers)
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) return null
  const raw = await crypto.subtle.digest('SHA-256', enc.encode('tredo-admin-session:v1:' + secret))
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signSession(p: Payload): Promise<string | null> {
  const k = await key()
  if (!k) return null
  const body = b64(enc.encode(JSON.stringify(p)))
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(body))
  return `${body}.${b64(sig)}`
}

export async function checkSession(token: string | undefined, uid: string, now = Date.now()): Promise<Check> {
  if (!token) return { ok: false, reason: 'missing' }
  const k = await key()
  if (!k) return { ok: false, reason: 'nokey' }
  const [body, sig] = token.split('.')
  if (!body || !sig) return { ok: false, reason: 'invalid' }
  let valid = false
  try { valid = await crypto.subtle.verify('HMAC', k, unb64(sig), enc.encode(body)) } catch { valid = false }
  if (!valid) return { ok: false, reason: 'invalid' }
  let p: Payload
  try { p = JSON.parse(new TextDecoder().decode(unb64(body))) } catch { return { ok: false, reason: 'invalid' } }
  if (p.uid !== uid) return { ok: false, reason: 'user' }
  if (!(p.iat <= now) || now - p.iat > MAX_MS) return { ok: false, reason: 'max' }
  if (!(p.last <= now + 60_000) || now - p.last > IDLE_MS) return { ok: false, reason: 'idle' }
  return { ok: true, p }
}

export const cookieOptions = () => ({
  httpOnly: true, // JavaScript can't read it
  secure: process.env.NODE_ENV === 'production', // HTTPS only on the live site
  sameSite: 'lax' as const,
  path: '/',
  maxAge: Math.ceil(MAX_MS / 1000),
})
