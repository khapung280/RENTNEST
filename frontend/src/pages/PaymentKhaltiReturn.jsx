import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { paymentService } from '../services/aiService'

const PaymentKhaltiReturn = () => {
  const [searchParams] = useSearchParams()
  const pidx = searchParams.get('pidx')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState(null)

  useEffect(() => {
    if (!pidx) {
      setLoading(false)
      setError('Missing payment reference (pidx). Return to My Bookings to check status.')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await paymentService.khaltiVerify(pidx)
        if (cancelled) return
        if (res.success && res.booking?.property?.title) {
          setTitle(res.booking.property.title)
        }
        if (!res.bookingPaid && res.khaltiStatus && res.khaltiStatus !== 'Completed') {
          setError('Payment was not completed in Khalti. You can try again from My Bookings.')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Could not verify Khalti payment')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pidx])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
        ) : error ? (
          <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
        )}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {error ? 'Verification issue' : 'Khalti payment'}
        </h1>
        {error ? (
          <p className="text-gray-600 mb-6">{error}</p>
        ) : (
          <p className="text-gray-600 mb-6">
            {title
              ? `Payment for "${title}" has been recorded.`
              : 'Your Khalti payment was verified.'}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/my-bookings"
            className="inline-flex justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
          >
            My bookings
          </Link>
          <Link
            to="/"
            className="inline-flex justify-center px-5 py-2.5 border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentKhaltiReturn
