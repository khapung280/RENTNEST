import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { paymentService } from '../services/aiService'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingTitle, setBookingTitle] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      setError('Missing payment session. If you completed a payment, check My Bookings.')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await paymentService.verifySession(sessionId)
        if (cancelled) return
        if (res.success && res.booking?.property?.title) {
          setBookingTitle(res.booking.property.title)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Could not verify payment')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
        )}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment received</h1>
        {error ? (
          <p className="text-gray-600 mb-6">{error}</p>
        ) : (
          <p className="text-gray-600 mb-6">
            {bookingTitle
              ? `Your payment for "${bookingTitle}" was processed successfully.`
              : 'Thank you. Your card payment was submitted successfully.'}
            {' '}Stripe will confirm the charge; your booking is updated in RentNest.
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

export default PaymentSuccess
