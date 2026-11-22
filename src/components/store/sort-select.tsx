'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function SortSelect({ value }: { value: string }) {
  const router = useRouter()
  const path = usePathname()
  const sp = useSearchParams()
  return (
    <select
      defaultValue={value}
      onChange={(e) => {
        const n = new URLSearchParams(sp.toString())
        n.set('sort', e.target.value)
        router.push(`${path}?${n}`)
      }}
      className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-ink"
    >
      <option value="pop">Sort by popularity</option>
      <option value="new">Sort by latest</option>
      <option value="lo">Price: low to high</option>
      <option value="hi">Price: high to low</option>
      <option value="sale">Biggest discount</option>
    </select>
  )
}
