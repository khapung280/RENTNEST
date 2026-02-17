import { MapPin, Calendar, Clock, CheckCircle, XCircle, DollarSign, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

// BookingCard Component - Production-grade dark theme
const BookingCard = ({ booking, onViewDetails, onCancel }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20',
          label: status === 'confirmed' ? 'Confirmed' : 'Approved',
          borderColor: 'border-emerald-500/30'
        }
      case 'rejected':
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-400',
          bgColor: 'bg-zinc-800',
          label: status === 'cancelled' ? 'Cancelled' : 'Rejected',
          borderColor: 'border-zinc-700'
        }
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          label: 'Pending',
          borderColor: 'border-amber-500/30'
        }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Property Thumbnail */}
        <div className="md:w-48 flex-shrink-0">
          <img
            src={booking.property?.image}
            alt={booking.property?.title}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>

        {/* Booking Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          {/* Header: Title, Location, Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-2">
                {booking.property?.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>{booking.property?.location}</span>
              </div>
            </div>
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor} ml-4 flex-shrink-0`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Stay Duration</p>
              <p className="text-sm font-semibold text-white">
                {booking.duration} {booking.duration === 1 ? 'month' : 'months'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Move-in Date</p>
              <p className="text-sm font-semibold text-white">
                {formatDate(booking.moveInDate || booking.checkInDate || booking.checkIn)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Booking Date</p>
              <p className="text-sm font-semibold text-white">
                {formatDate(booking.requestedDate || booking.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Amount</p>
              <p className="text-sm font-semibold text-white flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {(booking.totalAmount || booking.property?.price || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-auto pt-4 border-t border-zinc-800">
            {booking.status === 'pending' && onCancel && (
              <button
                onClick={onCancel}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Cancel Booking
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 text-white border border-zinc-700 rounded-xl hover:bg-zinc-700 text-sm font-medium transition-all"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            )}
            <Link
              to={`/property/${booking.property?.id || booking.property?._id}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg hover:scale-[1.02] transition-all"
            >
              View Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingCard
