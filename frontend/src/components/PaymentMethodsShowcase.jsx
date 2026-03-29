import { CreditCard, Smartphone, ShieldCheck, Building2 } from 'lucide-react'

/**
 * Visible payment options on the booking page (Nepal + international).
 * Actual charge happens after owner approval — from My Bookings.
 */
const PaymentMethodsShowcase = ({ compact = false }) => {
  const methods = [
    {
      id: 'khalti',
      name: 'Khalti',
      desc: 'Wallet, mobile banking & cards via Khalti',
      color: 'from-violet-700 to-purple-900',
      border: 'border-violet-500/40',
      badge: 'Popular in Nepal'
    },
    {
      id: 'esewa',
      name: 'eSewa',
      desc: 'Pay with eSewa wallet & linked banks',
      color: 'from-emerald-600 to-green-800',
      border: 'border-emerald-500/40',
      badge: 'Nepal'
    },
    {
      id: 'stripe',
      name: 'Cards (Stripe)',
      desc: 'Visa, Mastercard, Amex — international cards',
      color: 'from-indigo-600 to-slate-900',
      border: 'border-indigo-500/40',
      badge: 'Global'
    },
    {
      id: 'banks',
      name: 'Banks & more',
      desc: 'ConnectIPS, mobile banking where supported',
      color: 'from-slate-600 to-zinc-800',
      border: 'border-zinc-600/40',
      badge: 'Via gateways'
    }
  ]

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {methods.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-800 border border-gray-200"
          >
            <span className="font-semibold">{m.name}</span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payment options</h2>
          <p className="text-sm text-gray-600 mt-1">
            After the owner approves your request, you&apos;ll pay the total from{' '}
            <strong>My Bookings</strong> using Khalti, eSewa, or card — all processed securely.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`relative overflow-hidden rounded-xl border ${m.border} bg-gradient-to-br ${m.color} p-4 text-white shadow-md`}
          >
            <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-white/15 px-2 py-0.5 rounded">
              {m.badge}
            </span>
            <div className="flex items-center gap-2 mb-2">
              {m.id === 'khalti' || m.id === 'esewa' ? (
                <Smartphone className="w-5 h-5 opacity-90" />
              ) : m.id === 'stripe' ? (
                <CreditCard className="w-5 h-5 opacity-90" />
              ) : (
                <Building2 className="w-5 h-5 opacity-90" />
              )}
              <h3 className="font-bold text-lg">{m.name}</h3>
            </div>
            <p className="text-sm text-white/90 leading-snug">{m.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        You are not charged when submitting this request — only after approval, on the payment step.
      </p>
    </div>
  )
}

export default PaymentMethodsShowcase
