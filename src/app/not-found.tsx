import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div><h1 className="text-6xl font-bold">404</h1><p className="my-4 text-neutral-500">Page ta pawa jayni</p><Link href="/" className="btn-dark">Go home</Link></div>
    </div>
  )
}
