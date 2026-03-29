import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Calendar,
  Search,
  X,
  ChevronDown,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  LayoutGrid,
  List,
  Download,
  Home,
  Building2,
  Sparkles
} from 'lucide-react'
import BookingCard from '../components/BookingCard'
import BookingRow from '../components/BookingRow'
import BookingDetailsModal from '../components/BookingDetailsModal'
import { bookingService, paymentService } from '../services/aiService'

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'moveIn', label: 'Move-in date' },
  { value: 'status', label: 'Status' }
]

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-transform hover:-translate-y-0.5 ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <Icon className="w-6 h-6 text-white/90" />
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="h-48 md:w-48 rounded-xl bg-zinc-800" />
        <div className="flex-1 space-y-4">
          <div className="h-6 w-2/3 rounded bg-zinc-800" />
          <div className="h-4 w-1/3 rounded bg-zinc-800" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex gap-3">
      <div className="h-20 w-28 flex-shrink-0 rounded-lg bg-zinc-800" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/5 rounded bg-zinc-800" />
        <div className="h-3 w-2/5 rounded bg-zinc-800" />
        <div className="h-3 w-1/2 rounded bg-zinc-800" />
      </div>
    </div>
  )
}

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(null)
  const [payLoading, setPayLoading] = useState(null)

  const [layout, setLayout] = useState(() => {
    try {
      return localStorage.getItem('rentnest-mybookings-layout') === 'compact' ? 'compact' : 'cards'
    } catch {
      return 'cards'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('rentnest-mybookings-layout', layout)
    } catch {
      /* ignore */
    }
  }, [layout])

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
    { value: 'all', label: 'All', icon: LayoutGrid },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'confirmed', label: 'Approved', icon: CheckCircle2 },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle }
  ]

  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length
    }
  }, [bookings])

  const pendingPayCount = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === 'confirmed' && b.paymentStatus && b.paymentStatus !== 'paid'
      ).length,
    [bookings]
  )

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((b) => {
        const t = b.property?.type
        if (typeFilter === 'house') return t === 'house'
        if (typeFilter === 'flat_apartment') return t === 'flat_apartment'
        return true
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          (b.property?.title || '').toLowerCase().includes(q) ||
          (b.property?.location || '').toLowerCase().includes(q) ||
          (b.owner?.name || '').toLowerCase().includes(q)
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'moveIn':
          return new Date(a.checkIn || 0) - new Date(b.checkIn || 0)
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
  }, [bookings, statusFilter, typeFilter, searchQuery, sortBy])

  const exportCsv = () => {
    if (!filteredBookings.length) return
    const rows = [
      ['Property', 'Location', 'Status', 'Move-in', 'Check-out', 'Total NPR', 'Payment'].join(
        ','
      ),
      ...filteredBookings.map((b) =>
        [
          `"${(b.property?.title || '').replace(/"/g, '""')}"`,
          `"${(b.property?.location || '').replace(/"/g, '""')}"`,
          b.status,
          b.checkIn ? new Date(b.checkIn).toISOString().slice(0, 10) : '',
          b.checkOut ? new Date(b.checkOut).toISOString().slice(0, 10) : '',
          b.totalAmount ?? '',
          b.paymentStatus || ''
        ].join(',')
      )
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rentnest-bookings-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
    checkOutDate: b.checkOut || b.checkOutDate,
    requestedDate: b.createdAt,
    status:
      b.status === 'confirmed' ? 'approved' : b.status === 'cancelled' ? 'cancelled' : b.status,
    paymentStatus: b.paymentStatus || 'unpaid',
    paymentProvider: b.paymentProvider,
    owner: b.owner,
    property: b.property
      ? {
          ...b.property,
          id: b.property._id || b.property.id
        }
      : b.property
  })

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-violet-500/20 bg-gradient-to-br from-violet-950 via-neutral-950 to-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Renter dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                My Bookings
              </h1>
              <p className="mt-3 text-base text-gray-400 max-w-xl leading-relaxed">
                Track every request for houses and flats, follow approval and payment steps, and jump
                back to any listing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadBookings()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={exportCsv}
                disabled={!filteredBookings.length}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={LayoutGrid}
              label="Total"
              value={statusCounts.all}
              sub="All requests"
              accent="border-violet-500/30 bg-gradient-to-br from-violet-900/40 to-neutral-900/80"
            />
            <StatCard
              icon={Clock}
              label="Awaiting owner"
              value={statusCounts.pending}
              sub="Pending approval"
              accent="border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-neutral-900/80"
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved"
              value={statusCounts.confirmed}
              sub={pendingPayCount ? `${pendingPayCount} need payment` : 'All caught up'}
              accent="border-emerald-500/30 bg-gradient-to-br from-emerald-900/30 to-neutral-900/80"
            />
            <StatCard
              icon={Wallet}
              label="Payments due"
              value={pendingPayCount}
              sub="Unpaid confirmed stays"
              accent="border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-neutral-900/80"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {loadError && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200 text-sm">
            {loadError}
            <button type="button" onClick={loadBookings} className="ml-3 underline font-medium">
              Retry
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-8 backdrop-blur-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Filters</h2>
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      statusFilter === tab.value
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    <TabIcon className="w-4 h-4 opacity-80" />
                    {tab.label}
                    {statusCounts[tab.value] > 0 && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                          statusFilter === tab.value ? 'bg-white/20' : 'bg-zinc-600'
                        }`}
                      >
                        {statusCounts[tab.value]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-zinc-500 w-full sm:w-auto sm:mr-2 py-1">Property type</span>
            {[
              { value: 'all', label: 'All types', icon: LayoutGrid },
              { value: 'house', label: 'Houses', icon: Home },
              { value: 'flat_apartment', label: 'Flats', icon: Building2 }
            ].map((opt) => {
              const OIcon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTypeFilter(opt.value)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    typeFilter === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <OIcon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search property, city, or host name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-10 text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative lg:w-56">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-4 pr-10 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>
        </div>

        {loading && bookings.length === 0 ? (
          <div className="space-y-4">
            {layout === 'compact' ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
          </div>
        ) : (
          <>
            {filteredBookings.length > 0 && (
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500">
                  Showing{' '}
                  <span className="font-semibold text-zinc-300">{filteredBookings.length}</span>{' '}
                  {filteredBookings.length === 1 ? 'booking' : 'bookings'}
                  {statusFilter !== 'all' && ` · ${statusFilter}`}
                  {searchQuery && ` · matching “${searchQuery}”`}
                </p>
                <div
                  className="inline-flex rounded-xl border border-zinc-700 bg-zinc-950 p-1"
                  role="group"
                  aria-label="Layout"
                >
                  <button
                    type="button"
                    onClick={() => setLayout('cards')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      layout === 'cards'
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('compact')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      layout === 'compact'
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Compact
                  </button>
                </div>
              </div>
            )}

            {filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <Calendar className="h-10 w-10 text-violet-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {bookings.length === 0 ? 'No bookings yet' : 'No matches'}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-zinc-400">
                  {bookings.length === 0
                    ? 'Explore houses and flats, then submit a booking request. You’ll manage everything here.'
                    : 'Try adjusting filters or search.'}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {bookings.length === 0 ? (
                    <>
                      <a
                        href="/houses"
                        className="inline-flex rounded-xl bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-500"
                      >
                        Browse houses
                      </a>
                      <a
                        href="/flats-apartments"
                        className="inline-flex rounded-xl border border-zinc-600 px-6 py-3 font-medium text-zinc-200 hover:bg-zinc-800"
                      >
                        Browse flats
                      </a>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all')
                        setTypeFilter('all')
                        setSearchQuery('')
                      }}
                      className="rounded-xl border border-zinc-600 px-6 py-3 font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={layout === 'compact' ? 'space-y-3' : 'space-y-5'}>
                {filteredBookings.map((booking) => {
                  const bid = String(booking._id || booking.id)
                  const mapped = mapBookingForCard(booking)
                  if (layout === 'compact') {
                    return (
                      <BookingRow
                        key={booking._id}
                        booking={mapped}
                        payLoading={payLoading?.bid === bid ? payLoading.method : null}
                        onPayStripe={() => handlePayStripe(booking)}
                        onPayKhalti={() => handlePayKhalti(booking)}
                        onPayEsewa={() => handlePayEsewa(booking)}
                        onViewDetails={() => setSelectedBooking(mapped)}
                        onCancel={() => setShowCancelConfirm(booking._id)}
                      />
                    )
                  }
                  return (
                    <BookingCard
                      key={booking._id}
                      booking={mapped}
                      payLoading={payLoading?.bid === bid ? payLoading.method : null}
                      onPayStripe={() => handlePayStripe(booking)}
                      onPayKhalti={() => handlePayKhalti(booking)}
                      onPayEsewa={() => handlePayEsewa(booking)}
                      onViewDetails={() => setSelectedBooking(mapped)}
                      onCancel={() => setShowCancelConfirm(booking._id)}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Cancel booking?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This will withdraw your pending request. You can’t undo this action.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 rounded-xl border border-zinc-600 py-2.5 font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Keep request
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(showCancelConfirm)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 font-medium text-white hover:bg-red-500"
              >
                Cancel request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
