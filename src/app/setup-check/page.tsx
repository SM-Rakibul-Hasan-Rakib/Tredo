import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Setup check' }

type Check = { name: string; ok: boolean; info: string; fix?: string }

async function runChecks(): Promise<Check[]> {
  await connection() // always fresh, never cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  const out: Check[] = [
    { name: '1. NEXT_PUBLIC_SUPABASE_URL', ok: !!url && url.startsWith('https://') && url.includes('.supabase.co') && !url.includes('YOUR-PROJECT') && !url.includes('example'), info: url ? url.replace(/^https:\/\/(.{4}).*(\.supabase\.co).*$/, 'https://$1…$2') : 'missing', fix: '.env.local e Project URL dao (https://xxxx.supabase.co), tarpor npm run dev abar chalao' },
    { name: '2. NEXT_PUBLIC_SUPABASE_ANON_KEY', ok: !!anon && anon.length > 30, info: anon ? `${anon.length} characters` : 'missing', fix: 'Supabase → Project Settings → API Keys → anon / publishable key copy koro' },
    { name: '3. SUPABASE_SERVICE_ROLE_KEY', ok: !!secret && secret.length > 30 && secret !== anon, info: secret ? (secret === anon ? 'same as anon key ✗' : `${secret.length} characters`) : 'missing', fix: 'service_role / secret key dao (anon key na!)' },
  ]
  if (!out.every((c) => c.ok)) return out

  const db = createClient(url!, secret!, { auth: { persistSession: false } })
  const count = async (t: string) => {
    const { count, error } = await db.from(t).select('*', { count: 'exact', head: true })
    return { count: count ?? 0, error: error?.message }
  }
  const cats = await count('categories')
  out.push({ name: '4. Database connection + tables', ok: !cats.error, info: cats.error ?? 'connected ✓', fix: cats.error?.includes('Invalid API key') ? 'Key vul — secret key abar copy koro' : 'SQL Editor e supabase/schema.sql puro ta Run koro' })
  if (cats.error) return out
  out.push({ name: '5. Categories', ok: cats.count > 0, info: `${cats.count} categories`, fix: 'schema.sql er shesh part (Starter categories) run hoy nai' })
  const prods = await count('products')
  const { count: active } = await db.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
  out.push({ name: '6. Products', ok: (active ?? 0) > 0, info: `${prods.count} total, ${active ?? 0} visible on website`, fix: 'Admin → Products → + Add Product (ba supabase/sample-data.sql run koro). "Show on website" tick thakte hobe' })
  const { data: buckets, error: be } = await db.storage.listBuckets()
  out.push({ name: '7. Photo storage bucket "products"', ok: !!buckets?.some((b) => b.id === 'products' && b.public), info: be?.message ?? (buckets?.map((b) => `${b.id}${b.public ? ' (public)' : ' (private!)'}`).join(', ') || 'none'), fix: 'Storage → New bucket → name: products → Public ON' })
  const { count: admins } = await db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin')
  out.push({ name: '8. Admin user', ok: (admins ?? 0) > 0, info: `${admins ?? 0} admin`, fix: "Authentication → Add user → UID copy → SQL: insert into profiles (id, role) values ('UID', 'admin');" })
  return out
}

async function Results() {
  const checks = await runChecks()
  const allOk = checks.length === 8 && checks.every((c) => c.ok)
  return (
    <>
      <div className={`mb-5 rounded-2xl p-4 font-semibold ${allOk ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>
        {allOk ? '✅ Shob thik ache! Website e data dekhabe.' : '⚠️ Niche lal (✗) gula thik koro, tarpor page refresh koro'}
      </div>
      <div className="flex flex-col gap-2">
        {checks.map((c) => (
          <div key={c.name} className={`rounded-xl border p-3.5 ${c.ok ? 'border-green-200 bg-white' : 'border-red-200 bg-red-50'}`}>
            <div className="flex justify-between gap-3"><b>{c.ok ? '✓' : '✗'} {c.name}</b><span className="text-right text-sm text-neutral-500">{c.info}</span></div>
            {!c.ok && c.fix && <p className="mt-1.5 text-sm text-red-700">👉 {c.fix}</p>}
          </div>
        ))}
      </div>
    </>
  )
}

export default function SetupCheck() {
  // only on your computer (npm run dev) — hidden on the live site unless SETUP_CHECK=1
  if (process.env.NODE_ENV === 'production' && process.env.SETUP_CHECK !== '1') notFound()
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">Setup check</h1>
      <p className="mb-5 text-sm text-neutral-500">Supabase thik moto connect hoyeche kina dekhay. Kono secret key ekhane dekhano hoy na.</p>
      <Suspense fallback={<p>Checking…</p>}><Results /></Suspense>
      <Link href="/" className="btn-dark mt-6">← Website</Link>
    </div>
  )
}
