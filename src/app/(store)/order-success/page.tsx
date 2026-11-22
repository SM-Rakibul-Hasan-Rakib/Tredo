import Link from 'next/link'
import { Suspense } from 'react'
import { orderNo } from '@/lib/format'

export const metadata = { title: 'Order confirmed' }

async function Num({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  return id ? <p className="text-lg">Order number: <b>{orderNo(Number(id))}</b></p> : null
}

export default function Success({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl">✓</div>
      <h1 className="text-3xl font-semibold">অর্ডার কনফার্ম হয়েছে!</h1>
      <Suspense><Num searchParams={searchParams} /></Suspense>
      <p className="text-neutral-600">আমাদের টিম শীঘ্রই কল করে অর্ডার কনফার্ম করবে। প্রোডাক্ট হাতে পেয়ে টাকা দিবেন।</p>
      <Link href="/shop" className="btn-dark mt-2">Continue shopping</Link>
    </div>
  )
}
