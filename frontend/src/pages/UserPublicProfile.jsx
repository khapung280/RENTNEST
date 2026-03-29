import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  ArrowLeft,
  Loader2,
  Sparkles,
  MapPin,
  Home,
  ChevronRight,
  ImageOff,
  MessageSquare
} from 'lucide-react'
import { userService } from '../services/aiService'
import { getCurrentUserId } from '../utils/auth'
import { resolveMongoUserId } from '../utils/userDisplay'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80'

const UserPublicProfile = () => {
  const { id: rawId } = useParams()
  const id = resolveMongoUserId(rawId) || rawId
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [listingsLoading, setListingsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [avatarBroken, setAvatarBroken] = useState(false)
  const me = getCurrentUserId()

  useEffect(() => {
    setAvatarBroken(false)
  }, [id])

  useEffect(() => {
    let cancelled = false
    if (!id) {
      setError('Invalid profile link')
      setLoading(false)
      setListingsLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      setListingsLoading(true)
      setError(null)
      try {
        const [profileRes, listingsRes] = await Promise.all([
          userService.getById(id),
          userService.getPublicListings(id).catch(() => ({ success: false, data: [] }))
        ])
        if (cancelled) return
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data)
        } else {
          setError('User not found')
        }
        if (listingsRes?.success && Array.isArray(listingsRes.data)) {
          setListings(listingsRes.data)
        } else {
          setListings([])
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Could not load profile')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setListingsLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const isSelf = me && id && String(me) === String(id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-center px-4">
        <p className="text-gray-400 mb-4">{error || 'User not found'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-violet-400 hover:underline"
        >
          Go back
        </button>
        <Link to="/" className="mt-4 text-sm text-zinc-500 hover:text-zinc-300">
          Home
        </Link>
      </div>
    )
  }

  const roleLabel =
    user.accountType === 'owner'
      ? 'Property owner'
      : user.accountType === 'admin'
        ? 'Administrator'
        : 'Renter'

  const isOwner = user.accountType === 'owner'
  const initials = (user.name || '?')
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const showAvatar = user.profilePicture && !avatarBroken

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      <div className="relative overflow-hidden border-b border-violet-500/20 bg-gradient-to-br from-violet-950 via-neutral-950 to-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.3),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pb-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-12">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet-500/40 to-fuchsia-600/20 blur-md opacity-70" />
              <div className="relative h-36 w-36 sm:h-40 sm:w-40 rounded-2xl bg-zinc-900 ring-2 ring-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                {showAvatar ? (
                  <img
                    src={user.profilePicture}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-br from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left pb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Public profile
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight break-words">
                {user.name || 'Member'}
              </h1>
              <p className="text-zinc-400 mt-2 flex items-center justify-center md:justify-start gap-2">
                <User className="w-4 h-4 shrink-0" />
                {roleLabel}
              </p>
              {user.isVerified && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  Verified host
                </span>
              )}
              {user.createdAt && (
                <p className="text-sm text-zinc-500 mt-4">
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {isOwner && (
          <section className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-white">Listed properties</h2>
              {!listingsLoading && (
                <span className="text-sm text-zinc-500">
                  {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
                </span>
              )}
            </div>

            {listingsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
                <ImageOff className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">
                  No public listings yet, or they are still being reviewed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {listings.map((p) => (
                  <Link
                    key={p._id}
                    to={`/property/${p._id}`}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-violet-500/40 transition-all"
                  >
                    <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                      <img
                        src={p.image || PLACEHOLDER}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white capitalize backdrop-blur-sm">
                        {String(p.type || '').replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                        {p.title}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-zinc-500 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {p.location}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-violet-400 font-bold tabular-nums">
                          NPR {p.price?.toLocaleString?.() ?? p.price}
                        </span>
                        <span className="text-xs text-violet-400/90 flex items-center gap-0.5">
                          View
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {!isOwner && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <Home className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              This member is browsing RentNest as a renter. Start a conversation from a property
              listing to get in touch.
            </p>
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link
            to="/messages"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            <MessageSquare className="w-4 h-4" />
            Messages
          </Link>
          <Link
            to="/houses"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Browse homes
          </Link>
        </div>

        {isSelf && (
          <p className="text-center mt-8">
            <Link to="/profile" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
              Edit your full profile &amp; photo
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default UserPublicProfile
