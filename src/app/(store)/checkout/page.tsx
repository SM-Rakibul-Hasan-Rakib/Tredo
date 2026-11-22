import { CheckoutForm } from '@/components/store/checkout-form'

export const metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
