import { X, MapPin, Calendar, Bed, Bath, Square, DollarSign, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

// Booking Details Modal - Shows full booking information
const BookingDetailsModal = ({ booking, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          label: 'Approved',
          borderColor: 'border-green-200'
        }
      case 'rejected':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          label: 'Rejected',
          borderColor: 'border-red-200'
        }
      case 'cancelled':
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          label: 'Cancelled',
          borderColor: 'border-gray-200'
        }
      case 'pending':
      default:
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          label: 'Pending',
          borderColor: 'border-yellow-200'
        }
    }
  }

  const statusConfig = getStatusConfig(booking.status)
  const savings = booking.property.price * booking.duration - booking.totalAmount
  const hasSavings = savings > 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Property Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Property Information</h3>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={booking.property.image}
                  alt={booking.property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{booking.property.title}</h4>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{booking.property.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span>{booking.property.bedrooms} bed{booking.property.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-gray-400" />
                    <span>{booking.property.bathrooms} bath{booking.property.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-gray-400" />
                    <span>{booking.property.areaSqft} sqft</span>
                  </div>
                </div>
                <Link
                  to={`/property/${booking.property.id}`}
                  className="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Property Details →
                </Link>
              </div>
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Booking Status</h3>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}>
              <span className="text-sm font-semibold">{statusConfig.label}</span>
            </div>
          </div>

          {/* Booking Dates */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Important Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Requested Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(booking.requestedDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Move-in Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(booking.moveInDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Pricing Details</h3>
            <div className="bg-gray-50 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Stay Duration</p>
                  <p className="text-xs text-gray-500 mt-0.5">{booking.duration} {booking.duration === 1 ? 'month' : 'months'}</p>
                </div>
                <span className="text-base font-semibold text-gray-900">{booking.duration} {booking.duration === 1 ? 'month' : 'months'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Rate</p>
                  <p className="text-xs text-gray-500 mt-0.5">After FairFlex discount</p>
                </div>
                <span className="text-base font-semibold text-gray-900">Rs. {booking.monthlyRate.toLocaleString()}/month</span>
              </div>

              {hasSavings && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">FairFlex Savings</p>
                      <p className="text-xs text-gray-500 mt-0.5">Total savings on your stay</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-green-600">Rs. {savings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                <div>
                  <p className="text-base font-semibold text-gray-900">Total Amount</p>
                  <p className="text-xs text-gray-500 mt-0.5">For entire stay duration</p>
                </div>
                <span className="text-2xl font-bold text-gray-900">Rs. {booking.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <Link
              to={`/property/${booking.property.id}`}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              View Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsModal

