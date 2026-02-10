import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, CheckCircle2, XCircle, MessageCircle, User, Home, DollarSign, MapPin, Loader2 } from 'lucide-react'
import { bookingService } from '../services/aiService'
import { conversationService } from '../services/aiService'
import ChatWindow from '../components/ChatWindow'
import { getCurrentUserId } from '../utils/auth'

const OwnerBookings = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const userId = getCurrentUserId()
    setCurrentUserId(userId)
    loadBookings()
  }, [statusFilter])

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookingService.getOwnerBookings()
      if (response.success) {
        let filteredBookings = response.data.data || []
        
        // Filter by status
        if (statusFilter !== 'all') {
          filteredBookings = filteredBookings.filter(b => b.status === statusFilter)
        }
        
        setBookings(filteredBookings)
      } else {
        setError('Failed to load bookings')
      }
    } catch (err) {
      console.error('Error loading bookings:', err)
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleMessageRenter = async (booking) => {
    try {
      setSelectedBooking(booking)
      
      // Create or get conversation with renter
      const response = await conversationService.create(
        booking.renter._id || booking.renter,
        booking.property._id || booking.property,
        'renter_owner'
      )

      if (response.success) {
        setConversationId(response.data.data._id)
        setShowChat(true)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('Failed to start conversation. Please try again.')
    }
  }

  const handleApprove = async (bookingId) => {
    if (!window.confirm('Are you sure you want to approve this booking?')) {
      return
    }

    try {
      const response = await bookingService.approve(bookingId)
      if (response.success) {
        loadBookings()
      }
    } catch (error) {
      console.error('Error approving booking:', error)
      alert(error.response?.data?.message || 'Failed to approve booking')
    }
  }

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return
    }

    try {
      const response = await bookingService.reject(bookingId)
      if (response.success) {
        loadBookings()
      }
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert(error.response?.data?.message || 'Failed to reject booking')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-600 mt-2">Manage booking requests for your properties</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadBookings}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} bookings found.`
                : 'You don\'t have any booking requests yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left: Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Property Image */}
                      {booking.property?.image && (
                        <img
                          src={booking.property.image}
                          alt={booking.property.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      
                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {booking.property?.title || 'Property'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.property?.location || 'N/A'}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        {/* Renter Info */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">Renter Information</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Name: </span>
                              <span className="text-gray-900 font-medium">{booking.renterName || booking.renter?.name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Email: </span>
                              <span className="text-gray-900">{booking.renterEmail || booking.renter?.email || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone: </span>
                              <span className="text-gray-900">{booking.renterPhone || booking.renter?.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 mb-1">Duration</div>
                            <div className="font-medium text-gray-900">{booking.duration} {booking.duration === 1 ? 'month' : 'months'}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Move-in Date</div>
                            <div className="font-medium text-gray-900">{formatDate(booking.moveInDate)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Monthly Rate</div>
                            <div className="font-medium text-gray-900">NPR {booking.monthlyRate?.toLocaleString() || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Total Amount</div>
                            <div className="font-medium text-gray-900">NPR {booking.totalAmount?.toLocaleString() || 'N/A'}</div>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-900 mb-1">Special Requests:</div>
                            <div className="text-sm text-gray-700">{booking.specialRequests}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 md:w-48">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(booking._id)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking._id)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleMessageRenter(booking)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message Renter
                    </button>
                    <Link
                      to={`/property/${booking.property?._id || booking.property}`}
                      className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      View Property
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      {showChat && conversationId && selectedBooking && (
        <ChatWindow
          isOpen={showChat}
          onClose={() => {
            setShowChat(false)
            setSelectedBooking(null)
            setConversationId(null)
          }}
          conversationId={conversationId}
          otherUser={selectedBooking.renter}
          property={selectedBooking.property}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}

export default OwnerBookings

