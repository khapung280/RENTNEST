import { useState, useMemo } from 'react'
import { Calendar, Search, Filter, X, ChevronDown } from 'lucide-react'
import BookingCard from '../components/BookingCard'
import BookingDetailsModal from '../components/BookingDetailsModal'

// My Bookings Page - Professional booking management with filters, search, and sorting
const MyBookings = () => {
  // Dummy booking data
  const [bookings, setBookings] = useState([
    {
      id: 1,
      property: {
        id: 1,
        title: 'Thamel Family House',
        location: 'Kathmandu',
        image: 'https://backend.lalpurjanepal.com.np/media/properties/properties/image_picker_E5F773DE-B4B0-4252-A7B6-CA3C96CF42E8-4492-00000128086E985F.jpg',
        price: 18000
      },
      duration: 3,
      monthlyRate: 17100,
      totalAmount: 51300,
      status: 'pending',
      requestedDate: '2024-01-15',
      moveInDate: '2024-02-01'
    },
    {
      id: 2,
      property: {
        id: 2,
        title: 'Lalitpur Modern Apartment',
        location: 'Lalitpur',
        image: 'https://www.sugamgharjagga.com/files/properties/thumb_2bhk-flat-on-rent-imadol-lalitpur.png',
        price: 15000
      },
      duration: 6,
      monthlyRate: 13500,
      totalAmount: 81000,
      status: 'approved',
      requestedDate: '2024-01-10',
      moveInDate: '2024-02-15'
    },
    {
      id: 3,
      property: {
        id: 3,
        title: 'Pokhara Lake View House',
        location: 'Pokhara',
        image: 'https://www.realtynepal.com/uploads/2024/01/409610771_395211956292705_8349237220876335740_n-750x750.jpg',
        price: 20000
      },
      duration: 1,
      monthlyRate: 20000,
      totalAmount: 20000,
      status: 'rejected',
      requestedDate: '2024-01-05',
      moveInDate: '2024-01-20'
    }
  ])

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(null)

  // Status filter tabs
  const statusTabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length
    }
  }, [bookings])

  // Filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(booking =>
        booking.property.title.toLowerCase().includes(query) ||
        booking.property.location.toLowerCase().includes(query)
      )
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.requestedDate) - new Date(b.requestedDate)
        case 'status':
          const statusOrder = { pending: 1, approved: 2, rejected: 3, cancelled: 4 }
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
        case 'newest':
        default:
          return new Date(b.requestedDate) - new Date(a.requestedDate)
      }
    })

    return filtered
  }, [bookings, statusFilter, searchQuery, sortBy])

  // Handle cancel booking
  const handleCancelBooking = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'cancelled' }
        : booking
    ))
    setShowCancelConfirm(null)
  }

  // Handle view details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">My Bookings</h1>
          <p className="text-base text-gray-600">
            View and manage your rental booking requests
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Filters and Search Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Status Filter Tabs */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusTabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === tab.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  {statusCounts[tab.value] > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                      statusFilter === tab.value
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                    }`}>
                      {statusCounts[tab.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
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
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
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

        {/* Results Count */}
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

        {/* Bookings List or Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {bookings.length === 0
                ? "You haven't made any bookings yet"
                : "No bookings found"}
            </h2>
            <p className="text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {bookings.length === 0
                ? "Start exploring available properties to find your next home. Browse houses and apartments that match your preferences."
                : "Try adjusting your filters or search query to find what you're looking for."}
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
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={() => handleViewDetails(booking)}
                onCancel={() => setShowCancelConfirm(booking.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
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
