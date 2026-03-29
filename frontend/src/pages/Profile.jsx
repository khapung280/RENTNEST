import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  LogOut,
  Save,
  CheckCircle2,
  Home,
  MapPin,
  Eye,
  Loader2,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Calendar,
  Clock,
  ArrowRight,
  LayoutDashboard,
  Bookmark,
  BadgeCheck,
  Camera
} from 'lucide-react'
import { authService } from '../services/authService'
import { userService, propertyService } from '../services/aiService'

function formatMemberSince(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const Profile = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const isOwner = userData?.accountType === 'owner' || userData?.role === 'owner'
  const isRenter = !isOwner && (userData?.accountType === 'renter' || userData?.role === 'renter')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }
      let profileData = null
      try {
        const profileRes = await userService.getProfile()
        if (profileRes?.success && profileRes?.data) profileData = profileRes.data
      } catch (_) {
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            profileData = JSON.parse(stored)
          } catch (__) {}
        }
      }

      if (profileData) {
        const d = profileData
        const role = d.accountType || d.role
        setUserData({
          id: d.id || d._id,
          name: d.name,
          email: d.email,
          phone: d.phone || '',
          accountType: role,
          role,
          profilePicture: d.profilePicture,
          isVerified: d.isVerified,
          createdAt: d.createdAt,
          initials: (d.name || '')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        })
        setFormData({ name: d.name, email: d.email, phone: d.phone || '' })

        if (role === 'owner') {
          try {
            const pRes = await propertyService.getMyProperties()
            if (pRes?.success) {
              const list = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []
              setProperties(list)
            }
          } catch (_) {}
        }
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value?.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'email':
        if (!value?.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
        return ''
      case 'phone':
        if (value?.trim()) {
          const digits = value.replace(/\D/g, '')
          if (digits.length !== 10) return 'Phone must be 10 digits'
        }
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({ name: userData.name, email: userData.email, phone: userData.phone || '' })
    setErrors({})
    setSuccessMessage(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({ name: userData.name, email: userData.email, phone: userData.phone || '' })
    setErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const newErrors = {}
    ;['name', 'email', 'phone'].forEach((key) => {
      const err = validateField(key, formData[key])
      if (err) newErrors[key] = err
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSaving(true)
    setError(null)
    try {
      const phone = formData.phone?.replace(/\D/g, '')
      const payload = { name: formData.name.trim(), email: formData.email.trim() }
      if (phone) payload.phone = phone.slice(-10)
      const res = await userService.updateProfile(payload)
      if (res?.success && res?.data) {
        const updated = {
          ...userData,
          ...res.data,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || '',
          initials: (res.data.name || '')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        }
        setUserData(updated)
        const stored = localStorage.getItem('user')
        const merged = stored
          ? { ...JSON.parse(stored), name: res.data.name, email: res.data.email, phone: res.data.phone || '' }
          : updated
        localStorage.setItem('user', JSON.stringify(merged))
        setIsEditing(false)
        setSuccessMessage('Profile updated successfully.')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setIsSaving(false)
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
        setUserData((prev) => ({ ...prev, profilePicture: url }))
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            const u = JSON.parse(stored)
            localStorage.setItem('user', JSON.stringify({ ...u, profilePicture: url }))
          } catch (_) {}
        }
        setSuccessMessage('Profile photo updated.')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload photo. Try a smaller file (max 2MB).')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="h-56 bg-zinc-900 animate-pulse border-b border-zinc-800" />
        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-72 space-y-4">
              <div className="h-40 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
              <div className="h-48 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            </div>
            <div className="flex-1 h-96 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-10 max-w-md">
          <p className="text-zinc-300 mb-6">Unable to load profile.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-500"
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const getDisplayImage = () => userData.profilePicture || null
  const approvedCount = properties.filter((p) => (p.status || '').toLowerCase() === 'approved').length
  const pendingCount = properties.filter((p) => (p.status || '').toLowerCase() === 'pending').length
  const memberSince = formatMemberSince(userData.createdAt)
  const roleLabel =
    String(userData.accountType || userData.role).charAt(0).toUpperCase() +
    String(userData.accountType || userData.role).slice(1)

  const inputClass = (hasErr) =>
    `w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-zinc-500 bg-zinc-950/80 border transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
      hasErr ? 'border-red-500/50' : 'border-zinc-700 focus:border-violet-500'
    }`
  const readClass =
    'flex items-center gap-3 py-3 px-4 rounded-xl border border-zinc-700/80 bg-zinc-950/50 text-zinc-200'

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="relative overflow-hidden border-b border-violet-500/20 bg-gradient-to-br from-violet-950 via-neutral-950 to-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.35),transparent)]" />
        <div className="pointer-events-none absolute top-20 right-0 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-32">
          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
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
                {getDisplayImage() ? (
                  <img src={getDisplayImage()} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-br from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                    {userData.initials || '?'}
                  </span>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 disabled:pointer-events-none"
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
                className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-500 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {getDisplayImage() ? 'Change photo' : 'Upload photo'}
              </button>
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your profile
                </span>
                {userData.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight truncate">
                {userData.name}
              </h1>
              <p className="mt-1 text-zinc-400 truncate">{userData.email}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white capitalize">
                  {roleLabel}
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1.5 text-zinc-500">
                    <Calendar className="w-4 h-4 text-zinc-600" />
                    Member since {memberSince}
                  </span>
                )}
                {isOwner && (
                  <Link
                    to="/owner-dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-violet-900 shadow-lg shadow-violet-950/50 hover:bg-zinc-100 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-sm font-medium text-red-300 hover:text-white shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-medium text-emerald-200">{successMessage}</p>
          </div>
        )}

        {isOwner && properties.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[
              {
                label: 'Listings',
                value: properties.length,
                sub: 'Total',
                icon: Home,
                accent: 'border-violet-500/30 from-violet-900/40 to-neutral-900/90'
              },
              {
                label: 'Approved',
                value: approvedCount,
                sub: 'Live on site',
                icon: CheckCircle2,
                accent: 'border-emerald-500/30 from-emerald-900/30 to-neutral-900/90'
              },
              {
                label: 'Pending',
                value: pendingCount,
                sub: 'Awaiting review',
                icon: Clock,
                accent: 'border-amber-500/30 from-amber-900/25 to-neutral-900/90'
              },
              {
                label: 'Active',
                value: approvedCount,
                sub: 'Approved listings',
                icon: Building2,
                accent: 'border-cyan-500/25 from-cyan-900/20 to-neutral-900/90'
              }
            ].map((s) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl border p-4 md:p-5 bg-gradient-to-br shadow-lg ${s.accent}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{s.label}</p>
                    <p className="mt-1 text-2xl md:text-3xl font-bold text-white tabular-nums">{s.value}</p>
                    <p className="mt-0.5 text-xs text-white/45">{s.sub}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <s.icon className="w-5 h-5 text-white/90" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-5 shadow-xl">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Shortcuts</h3>
              <nav className="space-y-2">
                <Link
                  to="/my-bookings"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-violet-400" />
                    My bookings
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    Messages
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                </Link>
                {isOwner ? (
                  <>
                    <Link
                      to="/owner-dashboard/add-property"
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <Home className="w-4 h-4 text-violet-400" />
                        Add property
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                    </Link>
                    <Link
                      to="/owner-dashboard/bookings"
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        Booking requests
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/houses"
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <Home className="w-4 h-4 text-violet-400" />
                        Browse houses
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                    </Link>
                    <Link
                      to="/flats-apartments"
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-violet-400" />
                        Browse flats
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {isRenter && (
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/50 to-zinc-900/80 p-5">
                <p className="text-sm font-semibold text-white mb-1">Find your next stay</p>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Explore verified listings and send booking requests in a few taps.
                </p>
                <Link
                  to="/houses"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
                >
                  Start exploring
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </aside>

          <div className="lg:col-span-8 space-y-6">
            {isOwner && (
              <div className="flex gap-1 p-1 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                  }`}
                >
                  Account
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'properties'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                  }`}
                >
                  My properties
                </button>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="p-6 md:p-8 border-b border-zinc-800 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Personal information</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Update how you appear across RentNest</p>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave} className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                      {isEditing ? (
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClass(!!errors.name)}
                            placeholder="Your name"
                          />
                        </div>
                      ) : (
                        <div className={readClass}>
                          <User className="w-5 h-5 text-zinc-500" />
                          <span>{userData.name}</span>
                        </div>
                      )}
                      {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                      {isEditing ? (
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClass(!!errors.email)}
                            placeholder="you@example.com"
                          />
                        </div>
                      ) : (
                        <div className={readClass}>
                          <Mail className="w-5 h-5 text-zinc-500" />
                          <span className="truncate">{userData.email}</span>
                        </div>
                      )}
                      {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Phone <span className="text-zinc-600 font-normal">(optional)</span>
                      </label>
                      {isEditing ? (
                        <div className="relative max-w-md">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClass(!!errors.phone)}
                            placeholder="10-digit number"
                          />
                        </div>
                      ) : (
                        <div className={`${readClass} max-w-md`}>
                          <Phone className="w-5 h-5 text-zinc-500" />
                          <span>{userData.phone || 'Not provided'}</span>
                        </div>
                      )}
                      {errors.phone && <p className="mt-1.5 text-sm text-red-400">{errors.phone}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Account role</label>
                      <div className="inline-flex items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 max-w-md">
                        <Shield className="w-5 h-5 text-violet-400" />
                        <span className="font-medium text-violet-100 capitalize">{roleLabel}</span>
                      </div>
                    </div>
                  </div>

                  {errors.general && <p className="mt-4 text-sm text-red-400">{errors.general}</p>}

                  {isEditing && (
                    <div className="flex flex-wrap gap-3 mt-8">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl border border-zinc-600 text-zinc-300 font-medium hover:bg-zinc-800 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save changes
                      </button>
                    </div>
                  )}
                </form>

                <div className="px-6 md:px-8 py-5 border-t border-zinc-800 bg-zinc-950/40">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'properties' && isOwner && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">My properties</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Manage listings and visibility</p>
                  </div>
                  <Link
                    to="/owner-dashboard/add-property"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/30"
                  >
                    <Home className="w-4 h-4" />
                    Add property
                  </Link>
                </div>

                {properties.length === 0 ? (
                  <div className="p-12 md:p-16 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                      <Building2 className="w-10 h-10 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No properties yet</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                      Create your first listing to appear in search and receive booking requests.
                    </p>
                    <Link
                      to="/owner-dashboard/add-property"
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Add your first property
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
                    {properties.map((p) => (
                      <div
                        key={p._id}
                        className="group rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-950/20 transition-all"
                      >
                        <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                              <Home className="w-12 h-12 text-zinc-600" />
                            </div>
                          )}
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                              (p.status || '').toLowerCase() === 'approved'
                                ? 'bg-emerald-600/90 text-white'
                                : (p.status || '').toLowerCase() === 'rejected'
                                  ? 'bg-red-600/90 text-white'
                                  : 'bg-amber-600/90 text-white'
                            }`}
                          >
                            {(p.status || 'pending').charAt(0).toUpperCase() + (p.status || 'pending').slice(1)}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-white truncate">{p.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{p.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                            <span className="text-lg font-bold text-violet-400 tabular-nums">
                              NPR {p.price?.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/property/${p._id}`}
                                className="p-2 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to="/owner-dashboard"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                              >
                                Manage
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
