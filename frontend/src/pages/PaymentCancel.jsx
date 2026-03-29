import { Link, useSearchParams } from 'react-router-dom'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-gray-600 mb-6">
          You left the checkout before completing payment.
          {bookingId ? ' You can try again from My Bookings when you are ready.' : ''}
        </p>
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

export default PaymentCancel
