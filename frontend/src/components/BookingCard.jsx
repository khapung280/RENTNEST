import { MapPin, Calendar, Clock, CheckCircle, XCircle, DollarSign, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

// BookingCard Component - Enhanced booking card with more details
const BookingCard = ({ booking, onViewDetails, onCancel }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          label: 'Approved',
          borderColor: 'border-green-200'
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          label: 'Rejected',
          borderColor: 'border-red-200'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          label: 'Cancelled',
          borderColor: 'border-gray-200'
        }
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          label: 'Pending',
          borderColor: 'border-yellow-200'
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Property Thumbnail */}
        <div className="md:w-48 flex-shrink-0">
          <img
            src={booking.property.image}
            alt={booking.property.title}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>

        {/* Booking Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Header: Title, Location, Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {booking.property.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{booking.property.location}</span>
              </div>
            </div>
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ml-4 flex-shrink-0`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Stay Duration</p>
              <p className="text-sm font-semibold text-gray-900">
                {booking.duration} {booking.duration === 1 ? 'month' : 'months'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Move-in Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(booking.moveInDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Booking Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(booking.requestedDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-auto pt-4 border-t border-gray-100">
            {booking.status === 'pending' && onCancel && (
              <button
                onClick={onCancel}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Cancel Booking
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            )}
            <Link
              to={`/property/${booking.property.id}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
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
