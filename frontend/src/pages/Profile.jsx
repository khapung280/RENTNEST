import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Shield, Edit, LogOut, Save, CheckCircle2, Home, MapPin, Eye, Loader2, Building2, ExternalLink, ChevronRight } from 'lucide-react'
import { authService } from '../services/authService'
import { userService, propertyService } from '../services/aiService'

const Profile = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const isOwner = userData?.accountType === 'owner' || userData?.role === 'owner'

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
          initials: (d.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        })
        setFormData({ name: d.name, email: d.email, phone: d.phone || '' })

        if (role === 'owner') {
          try {
            const pRes = await propertyService.getMyProperties()
            if (pRes?.success) {
              const list = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.data || [])
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
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({ name: userData.name, email: userData.email, phone: userData.phone || '' })
    setErrors({})
    setShowSuccess(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({ name: userData.name, email: userData.email, phone: userData.phone || '' })
    setErrors({})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const newErrors = {}
    ;['name', 'email', 'phone'].forEach(key => {
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
        const updated = { ...userData, ...res.data, name: res.data.name, email: res.data.email, phone: res.data.phone || '', initials: (res.data.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
        setUserData(updated)
        const stored = localStorage.getItem('user')
        const merged = stored ? { ...JSON.parse(stored), name: res.data.name, email: res.data.email, phone: res.data.phone || '' } : updated
        localStorage.setItem('user', JSON.stringify(merged))
        setIsEditing(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load profile.</p>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Go to Login</Link>
        </div>
      </div>
    )
  }

  const getDisplayImage = () => userData.profilePicture || null
  const approvedCount = properties.filter(p => (p.status || '').toLowerCase() === 'approved').length
  const pendingCount = properties.filter(p => (p.status || '').toLowerCase() === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-8">
            <div className="relative -mb-16 sm:mb-0">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white/50">
                {getDisplayImage() ? (
                  <img src={getDisplayImage()} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-indigo-600">{userData.initials || '?'}</span>
                )}
              </div>
            </div>
            <div className="sm:pb-2 sm:pl-36">
              <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
              <p className="text-indigo-200 mt-1">{userData.email}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                  {String(userData.accountType || userData.role).charAt(0).toUpperCase() + String(userData.accountType || userData.role).slice(1)}
                </span>
                {isOwner && (
                  <Link
                    to="/owner-dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-lg"
                  >
                    <Building2 className="w-4 h-4" />
                    Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-sm font-medium">Dismiss</button>
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">Profile updated successfully!</p>
          </div>
        )}

        {/* Stats - Owner only */}
        {isOwner && properties.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Home className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                  <p className="text-xs font-medium text-gray-500">Total Properties</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                  <p className="text-xs font-medium text-gray-500">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                  <p className="text-xs font-medium text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 col-span-2 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{properties.filter(p => (p.status || '').toLowerCase() === 'approved').length} active</p>
                  <p className="text-xs font-medium text-gray-500">Listed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Owner only */}
        {isOwner && (
          <div className="flex gap-1 p-1 bg-white rounded-xl shadow-md border border-gray-100 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'properties' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              My Properties
            </button>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : null}
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Your name"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{userData.name}</span>
                    </div>
                  )}
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="you@example.com"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{userData.email}</span>
                    </div>
                  )}
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                  {isEditing ? (
                    <div className="relative max-w-xs">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="9841234567"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100 max-w-xs">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{userData.phone || 'Not provided'}</span>
                    </div>
                  )}
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account role</label>
                  <div className="flex items-center gap-3 py-2.5 px-4 bg-indigo-50 rounded-xl border border-indigo-100 max-w-xs">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-900 font-medium capitalize">{userData.accountType || userData.role}</span>
                  </div>
                </div>
              </div>

              {errors.general && <p className="mt-4 text-sm text-red-600">{errors.general}</p>}

              {isEditing && (
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </form>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && isOwner && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your listings</p>
              </div>
              <Link
                to="/owner-dashboard/add-property"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow"
              >
                <Home className="w-4 h-4" />
                Add Property
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first property listing to start receiving bookings.</p>
                <Link
                  to="/owner-dashboard/add-property"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Add Your First Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {properties.map((p) => (
                  <div
                    key={p._id}
                    className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                          <Home className="w-12 h-12 text-indigo-300" />
                        </div>
                      )}
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        (p.status || '').toLowerCase() === 'approved' ? 'bg-emerald-500/90 text-white' :
                        (p.status || '').toLowerCase() === 'rejected' ? 'bg-red-500/90 text-white' : 'bg-amber-500/90 text-white'
                      }`}>
                        {(p.status || 'pending').charAt(0).toUpperCase() + (p.status || '').slice(1)}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold text-indigo-600">NPR {p.price?.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/property/${p._id}`}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to="/owner-dashboard"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
  )
}

export default Profile
