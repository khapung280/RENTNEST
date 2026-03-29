import { Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  Loader2,
  Home,
  Building2,
  Calendar
} from 'lucide-react'

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'

const BookingRow = ({
  booking,
  onViewDetails,
  onCancel,
  onPayStripe,
  onPayKhalti,
  onPayEsewa,
  payLoading
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/15',
          label: status === 'confirmed' ? 'Confirmed' : 'Approved',
          borderColor: 'border-emerald-500/25'
        }
      case 'cancelled':
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-zinc-400',
          bgColor: 'bg-zinc-800/80',
          label: status === 'cancelled' ? 'Cancelled' : 'Rejected',
          borderColor: 'border-zinc-700'
        }
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/15',
          label: 'Pending',
          borderColor: 'border-amber-500/25'
        }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon
  const propType = booking.property?.type
  const TypeIcon = propType === 'house' ? Home : propType === 'flat_apartment' ? Building2 : null

  const showPay =
    (booking.status === 'approved' || booking.status === 'confirmed') &&
    booking.paymentStatus &&
    booking.paymentStatus !== 'paid'

  const pid = booking.property?.id || booking.property?._id

  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 p-3 sm:p-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="relative h-20 w-24 sm:h-[5.5rem] sm:w-28 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800">
            <img
              src={booking.property?.image || PLACEHOLDER_IMG}
              alt=""
              className="h-full w-full object-cover"
            />
            {TypeIcon && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5">
                <TypeIcon className="h-3 w-3 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                {booking.property?.title || 'Listing'}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}
              >
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {booking.property?.location}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-zinc-500" />
                Move-in{' '}
                <span className="text-zinc-200 font-medium">
                  {formatDate(booking.moveInDate || booking.checkIn)}
                </span>
              </span>
              <span>
                Total{' '}
                <span className="text-zinc-200 font-medium tabular-nums">
                  NPR {(booking.totalAmount ?? booking.property?.price ?? 0).toLocaleString()}
                </span>
              </span>
              {showPay && (
                <span
                  className={
                    booking.paymentStatus === 'paid'
                      ? 'text-emerald-400'
                      : booking.paymentStatus === 'processing'
                        ? 'text-amber-400'
                        : 'text-amber-200/90'
                  }
                >
                  {booking.paymentStatus === 'paid'
                    ? 'Paid'
                    : booking.paymentStatus === 'processing'
                      ? 'Payment started…'
                      : 'Payment due'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:border-l sm:border-zinc-800 sm:pl-4 sm:min-w-[200px] sm:flex-col sm:items-stretch sm:justify-center">
          {showPay && (
            <div className="flex flex-wrap justify-end gap-1.5 w-full">
              {onPayStripe && (
                <button
                  type="button"
                  onClick={onPayStripe}
                  disabled={!!payLoading}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {payLoading === 'stripe' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5" />
                  )}
                  Card
                </button>
              )}
              {onPayKhalti && (
                <button
                  type="button"
                  onClick={onPayKhalti}
                  disabled={!!payLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-violet-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-60"
                >
                  {payLoading === 'khalti' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Khalti
                </button>
              )}
              {onPayEsewa && (
                <button
                  type="button"
                  onClick={onPayEsewa}
                  disabled={!!payLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {payLoading === 'esewa' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  eSewa
                </button>
              )}
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2 w-full">
            {booking.status === 'pending' && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1.5"
              >
                Cancel
              </button>
            )}
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
              >
                <Eye className="h-3.5 w-3.5" />
                Details
              </button>
            )}
            {pid && (
              <Link
                to={`/property/${pid}`}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-95"
              >
                Property
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingRow
