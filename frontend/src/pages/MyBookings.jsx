import { useState, useMemo, useEffect, useCallback } from 'react'
import { Calendar, Search, X, ChevronDown, Loader2 } from 'lucide-react'
import BookingCard from '../components/BookingCard'
import BookingDetailsModal from '../components/BookingDetailsModal'
import { bookingService, paymentService } from '../services/aiService'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(null)
  /** { bid: string, method: 'stripe' | 'khalti' | 'esewa' } | null */
  const [payLoading, setPayLoading] = useState(null)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await bookingService.getMyBookings()
      const list = Array.isArray(res.data) ? res.data : []
      setBookings(list)
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const statusTabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Approved' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          (b.property?.title || '').toLowerCase().includes(q) ||
          (b.property?.location || '').toLowerCase().includes(q)
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'status': {
          const order = { pending: 1, confirmed: 2, cancelled: 3 }
          return (order[a.status] || 99) - (order[b.status] || 99)
        }
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return filtered
  }, [bookings, statusFilter, searchQuery, sortBy])

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancel(bookingId)
      setShowCancelConfirm(null)
      loadBookings()
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not cancel booking')
    }
  }

  const handlePayStripe = async (booking) => {
    const id = String(booking._id || booking.id)
    setPayLoading({ bid: id, method: 'stripe' })
    try {
      const res = await paymentService.createCheckoutSession(id)
      if (res.url) {
        window.location.href = res.url
        return
      }
      window.alert(res.message || 'No checkout URL returned')
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not start payment')
    } finally {
      setPayLoading(null)
    }
  }

  const handlePayKhalti = async (booking) => {
    const id = String(booking._id || booking.id)
    setPayLoading({ bid: id, method: 'khalti' })
    try {
      const res = await paymentService.khaltiInitiate(id)
      if (res.url) {
        window.location.href = res.url
        return
      }
      window.alert(res.message || 'No Khalti payment URL returned')
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not start Khalti payment')
    } finally {
      setPayLoading(null)
    }
  }

  const handlePayEsewa = async (booking) => {
    const id = String(booking._id || booking.id)
    setPayLoading({ bid: id, method: 'esewa' })
    try {
      const res = await paymentService.esewaInitiate(id)
      if (res.url) {
        window.location.href = res.url
        return
      }
      window.alert(res.message || 'eSewa response had no redirect URL')
    } catch (err) {
      const d = err.response?.data
      window.alert(d?.message || 'eSewa is not fully configured. Add merchant keys on the server.')
    } finally {
      setPayLoading(null)
    }
  }

  const mapBookingForCard = (b) => ({
    ...b,
    id: b._id,
    duration: b.durationMonths ?? b.duration,
    moveInDate: b.checkIn || b.moveInDate,
    requestedDate: b.createdAt,
    status:
      b.status === 'confirmed' ? 'approved' : b.status === 'cancelled' ? 'cancelled' : b.status,
    paymentStatus: b.paymentStatus || 'unpaid',
    paymentProvider: b.paymentProvider,
    property: b.property
      ? {
          ...b.property,
          id: b.property._id || b.property.id
        }
      : b.property
  })

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">My Bookings</h1>
          <p className="text-base text-gray-600 max-w-2xl">
            All your rental requests for <strong>houses</strong> and <strong>flats</strong> in one place. Track
            pending, approved, and cancelled stays. After the owner approves, pay with card (Stripe), Khalti,
            or eSewa from this page.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {loadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {loadError}
            <button type="button" onClick={loadBookings} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  {statusCounts[tab.value] > 0 && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                        statusFilter === tab.value ? 'bg-white/20' : 'bg-gray-200'
                      }`}
                    >
                      {statusCounts[tab.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">By Status</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {filteredBookings.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredBookings.length}</span>{' '}
              {filteredBookings.length === 1 ? 'booking' : 'bookings'}
              {statusFilter !== 'all' && ` (${statusFilter})`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {bookings.length === 0 ? "You haven't made any bookings yet" : 'No bookings found'}
            </h2>
            <p className="text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {bookings.length === 0
                ? 'Browse properties and submit a booking request. After the owner approves, pay with Khalti, eSewa, or card (Stripe).'
                : 'Try adjusting your filters or search.'}
            </p>
            {bookings.length === 0 ? (
              <a
                href="/houses"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Browse Properties
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all')
                  setSearchQuery('')
                }}
                className="inline-flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const bid = String(booking._id || booking.id)
              return (
              <BookingCard
                key={booking._id}
                booking={mapBookingForCard(booking)}
                payLoading={payLoading?.bid === bid ? payLoading.method : null}
                onPayStripe={() => handlePayStripe(booking)}
                onPayKhalti={() => handlePayKhalti(booking)}
                onPayEsewa={() => handlePayEsewa(booking)}
                onViewDetails={() => setSelectedBooking(mapBookingForCard(booking))}
                onCancel={() => setShowCancelConfirm(booking._id)}
              />
            )})}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this pending booking? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(showCancelConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
