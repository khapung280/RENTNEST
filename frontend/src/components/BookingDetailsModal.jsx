import { X, MapPin, Calendar, Bed, Bath, Square, DollarSign, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'

// Booking Details Modal - Production-grade dark theme
const BookingDetailsModal = ({ booking, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
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
      case 'confirmed':
        return {
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20',
          label: status === 'confirmed' ? 'Confirmed' : 'Approved',
          borderColor: 'border-emerald-500/30'
        }
      case 'rejected':
      case 'cancelled':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-zinc-800',
          label: status === 'cancelled' ? 'Cancelled' : 'Rejected',
          borderColor: 'border-zinc-700'
        }
      case 'pending':
      default:
        return {
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          label: 'Pending',
          borderColor: 'border-amber-500/30'
        }
    }
  }

  const statusConfig = getStatusConfig(booking.status)
  const price = booking.property?.price || 0
  const duration = booking.duration || 1
  const totalAmount = booking.totalAmount ?? (price * duration)
  const savings = price * duration - totalAmount
  const hasSavings = savings > 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-white">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Property Information */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Property Information</h3>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-zinc-700">
                <img
                  src={booking.property?.image}
                  alt={booking.property?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">{booking.property?.title}</h4>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{booking.property?.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <span>{booking.property?.bedrooms} bed{booking.property?.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-gray-500" />
                    <span>{booking.property?.bathrooms} bath{booking.property?.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-gray-500" />
                    <span>{booking.property?.areaSqft} sqft</span>
                  </div>
                </div>
                <Link
                  to={`/property/${booking.property?.id || booking.property?._id}`}
                  className="inline-block mt-3 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  View Property Details →
                </Link>
              </div>
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Booking Status</h3>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}>
              <span className="text-sm font-semibold">{statusConfig.label}</span>
            </div>
          </div>

          {/* Booking Dates */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Important Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm mb-1">Requested Date</p>
                  <p className="text-sm font-semibold text-white">{formatDate(booking.requestedDate || booking.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm mb-1">Move-in Date</p>
                  <p className="text-sm font-semibold text-white">{formatDate(booking.moveInDate || booking.checkInDate || booking.checkIn)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Pricing Details</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Stay Duration</p>
                  <p className="text-gray-400 text-xs mt-0.5">{duration} {duration === 1 ? 'month' : 'months'}</p>
                </div>
                <span className="text-base font-semibold text-white">{duration} {duration === 1 ? 'month' : 'months'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                <div>
                  <p className="text-sm font-medium text-white">Monthly Rate</p>
                  <p className="text-gray-400 text-xs mt-0.5">After FairFlex discount</p>
                </div>
                <span className="text-base font-semibold text-white">Rs. {(booking.monthlyRate || price).toLocaleString()}/month</span>
              </div>

              {hasSavings && (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-400">FairFlex Savings</p>
                      <p className="text-gray-400 text-xs mt-0.5">Total savings on your stay</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-400">Rs. {savings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-600">
                <div>
                  <p className="text-base font-semibold text-white">Total Amount</p>
                  <p className="text-gray-400 text-xs mt-0.5">For entire stay duration</p>
                </div>
                <span className="text-2xl font-bold text-white">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 text-white border border-zinc-700 font-medium rounded-xl hover:bg-zinc-700 transition-all"
            >
              Close
            </button>
            <Link
              to={`/property/${booking.property?.id || booking.property?._id}`}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:scale-[1.02] transition-all text-center"
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
