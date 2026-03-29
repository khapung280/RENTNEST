import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home,
  Calendar,
  Clock,
  Building2,
  Loader2,
  DollarSign,
  Bell,
  User,
  Sparkles,
  Camera,
  RefreshCw,
  ChevronRight,
  Bookmark,
  MessageSquare,
  ArrowRight,
  LayoutDashboard,
  BadgeCheck
} from 'lucide-react'
import { propertyService, bookingService, userService } from '../services/aiService'
import BookingTrendChart from '../components/dashboard/BookingTrendChart'
import PropertiesTable from '../components/dashboard/PropertiesTable'

function formatMemberSince(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function OwnerStatTile({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 md:p-5 bg-gradient-to-br shadow-lg ${accent}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{label}</p>
          <p className="mt-1 text-2xl md:text-3xl font-bold text-white tabular-nums break-words">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-white/45">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/10 p-2.5 shrink-0">
          <Icon className="w-5 h-5 text-white/90" />
        </div>
      </div>
    </div>
  )
}

const OwnerDashboard = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ownerProfile, setOwnerProfile] = useState({
    name: 'Owner',
    email: '',
    profilePicture: null,
    isVerified: false,
    createdAt: null
  })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  const initials = useMemo(() => {
    return (ownerProfile.name || 'O')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [ownerProfile.name])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setOwnerProfile((p) => ({
          ...p,
          name: parsed?.name || p.name,
          email: parsed?.email || '',
          profilePicture: parsed?.profilePicture || null
        }))
      }
    } catch (_) {}
  }, [])

  const loadProfile = async () => {
    try {
      const res = await userService.getProfile()
      if (res?.success && res?.data) {
        const d = res.data
        setOwnerProfile({
          name: d.name || 'Owner',
          email: d.email || '',
          profilePicture: d.profilePicture || null,
          isVerified: !!d.isVerified,
          createdAt: d.createdAt
        })
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            const u = JSON.parse(stored)
            localStorage.setItem(
              'user',
              JSON.stringify({
                ...u,
                name: d.name,
                email: d.email,
                profilePicture: d.profilePicture
              })
            )
          } catch (_) {}
        }
      }
    } catch (_) {
      /* keep localStorage fallback */
    }
  }

  useEffect(() => {
    loadData()
    loadProfile()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [propertiesResult, bookingsResult] = await Promise.allSettled([
        propertyService.getMyProperties(),
        bookingService.getOwnerBookings()
      ])

      const propertiesResponse = propertiesResult.status === 'fulfilled' ? propertiesResult.value : null
      const bookingsResponse = bookingsResult.status === 'fulfilled' ? bookingsResult.value : null

      if (propertiesResponse?.success) {
        const list = Array.isArray(propertiesResponse.data)
          ? propertiesResponse.data
          : propertiesResponse.data?.data || []
        setProperties(list)
      } else if (propertiesResult.status === 'rejected') {
        setError(propertiesResult.reason?.response?.data?.message || 'Failed to load properties')
      }

      if (bookingsResponse?.success) {
        const list = Array.isArray(bookingsResponse.data)
          ? bookingsResponse.data
          : Array.isArray(bookingsResponse.data?.data)
            ? bookingsResponse.data.data
            : []
        setBookings(list)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const activeBookings = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'approved'
    ).length
    const pendingRequests = bookings.filter((b) => b.status === 'pending').length
    const monthlyRevenue = properties.reduce((sum, p) => {
      const count = bookings.filter((b) => {
        const propId = b.property?._id ?? b.property
        return String(propId) === String(p._id) && (b.status === 'confirmed' || b.status === 'approved')
      }).length
      return sum + (p.price ?? 0) * count
    }, 0)
    return {
      totalProperties: properties.length,
      activeBookings,
      pendingRequests,
      monthlyRevenue
    }
  }, [properties, bookings])

  const bookingsByProperty = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      const propId = b.property?._id ?? b.property
      if (!propId) return
      const key = String(propId)
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return map
  }, [bookings])

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const m = (now.getMonth() - 5 + i + 12) % 12
      const month = months[m]
      const count = bookings.filter((b) => {
        const d = b.checkIn ?? b.checkInDate ?? b.createdAt
        if (!d) return false
        const date = new Date(d)
        return date.getMonth() === m
      }).length
      return { month, bookings: count }
    })
  }, [bookings])

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }
    try {
      const response = await propertyService.delete(propertyId)
      if (response.success) loadData()
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to delete property')
    }
  }

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
      setError('Please choose a JPEG, PNG, WebP, or GIF image.')
      return
    }
    setAvatarUploading(true)
    setError(null)
    try {
      const res = await userService.uploadAvatar(file)
      if (res?.success && res?.data?.profilePicture) {
        const url = res.data.profilePicture
        setOwnerProfile((prev) => ({ ...prev, profilePicture: url }))
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            const u = JSON.parse(stored)
            localStorage.setItem('user', JSON.stringify({ ...u, profilePicture: url }))
          } catch (_) {}
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not upload photo. Try a smaller image or a different format.'
      )
    } finally {
      setAvatarUploading(false)
    }
  }

  const memberSince = formatMemberSince(ownerProfile.createdAt)

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
        <p className="text-zinc-400 text-sm font-medium">Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-violet-500/20 bg-gradient-to-br from-violet-950 via-neutral-950 to-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.35),transparent)]" />
        <div className="pointer-events-none absolute top-20 right-0 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pb-20">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-10">
              <div className="relative shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet-500/40 to-fuchsia-600/20 blur-md opacity-70" />
                <div className="relative h-36 w-36 sm:h-40 sm:w-40 rounded-2xl bg-zinc-900 ring-2 ring-white/10 shadow-2xl overflow-hidden flex items-center justify-center group">
                  {ownerProfile.profilePicture ? (
                    <img src={ownerProfile.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold bg-gradient-to-br from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                      {initials}
                    </span>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 z-[5]"
                    aria-label="Change profile photo"
                  >
                    <span className="rounded-full bg-violet-600 p-3 shadow-lg ring-2 ring-white/20">
                      <Camera className="w-6 h-6 text-white" />
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  {ownerProfile.profilePicture ? 'Change photo' : 'Upload photo'}
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    Owner hub
                  </span>
                  {ownerProfile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight truncate">
                  Welcome back, {ownerProfile.name}
                </h1>
                {ownerProfile.email && <p className="mt-1 text-zinc-400 truncate">{ownerProfile.email}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                  {memberSince && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-zinc-600" />
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  loadData()
                  loadProfile()
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh data
              </button>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-900 shadow-lg hover:bg-zinc-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Full profile &amp; account
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null)
                loadData()
              }}
              className="text-sm font-medium text-red-300 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <aside className="lg:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">Quick links</p>
            <Link
              to="/owner-dashboard/bookings"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-violet-400" />
                Booking requests
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400" />
            </Link>
            <Link
              to="/owner-dashboard/add-property"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Home className="w-4 h-4 text-violet-400" />
                Add property
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400" />
            </Link>
            <Link
              to="/messages"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                Messages
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400" />
            </Link>
            <Link
              to="/my-bookings"
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-violet-400" />
                My bookings (as renter)
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400" />
            </Link>
          </aside>

          <div className="lg:col-span-9 space-y-8">
            <section>
              <p className="text-sm text-zinc-500 mb-4">Performance overview</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <OwnerStatTile
                  icon={Home}
                  label="Total properties"
                  value={stats.totalProperties}
                  sub="Your listings"
                  accent="border-violet-500/30 from-violet-900/40 to-neutral-900/90"
                />
                <OwnerStatTile
                  icon={Calendar}
                  label="Active bookings"
                  value={stats.activeBookings}
                  sub="Confirmed stays"
                  accent="border-emerald-500/30 from-emerald-900/30 to-neutral-900/90"
                />
                <OwnerStatTile
                  icon={Clock}
                  label="Pending requests"
                  value={stats.pendingRequests}
                  sub="Need your review"
                  accent="border-amber-500/30 from-amber-900/25 to-neutral-900/90"
                />
                <OwnerStatTile
                  icon={DollarSign}
                  label="Est. revenue"
                  value={`NPR ${stats.monthlyRevenue.toLocaleString()}`}
                  sub="From active bookings × rate"
                  accent="border-cyan-500/25 from-cyan-900/20 to-neutral-900/90"
                />
              </div>
            </section>

            {stats.pendingRequests > 0 && (
              <section>
                <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-6">
                  <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <h3 className="font-semibold text-amber-100 flex items-center gap-2">
                      <Bell size={20} className="text-amber-400" />
                      New booking requests
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigate('/owner-dashboard/bookings')}
                      className="text-sm font-medium text-amber-300 hover:text-amber-200"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {bookings
                      .filter((b) => b.status === 'pending')
                      .slice(0, 5)
                      .map((b) => (
                        <div
                          key={b._id}
                          className="flex items-center justify-between bg-zinc-900/80 rounded-xl p-4 border border-zinc-800 hover:border-amber-500/20 transition-colors gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                              <User size={18} className="text-amber-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate">{b.renter?.name || 'Renter'}</p>
                              <p className="text-sm text-zinc-500 truncate">
                                {b.property?.title || 'Property'} • {b.renter?.email || ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate('/owner-dashboard/bookings')}
                            className="flex-shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            )}

            <section>
              <BookingTrendChart data={chartData} darkMode />
            </section>

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">My properties</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">Manage listings and earnings</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/owner-dashboard/add-property')}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-900/30 transition-all"
                  >
                    Add property
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/owner-dashboard/bookings')}
                    className="px-4 py-2.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium rounded-xl transition-all"
                  >
                    View bookings
                  </button>
                </div>
              </div>

              {properties.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 md:p-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl mb-6">
                    <Building2 className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No properties yet</h3>
                  <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8">
                    Add your first listing to appear in search and receive booking requests.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/owner-dashboard/add-property')}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all"
                  >
                    Add your first property
                  </button>
                </div>
              ) : (
                <PropertiesTable
                  properties={properties}
                  bookingsByProperty={bookingsByProperty}
                  onDelete={handleDeleteProperty}
                  darkMode
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
