import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Shield, Edit, LogOut, Save, CheckCircle2, Home, MapPin, Eye, Loader2 } from 'lucide-react'
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
            if (pRes?.success && pRes?.data?.data) setProperties(pRes.data.data)
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim()
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-sm font-medium">Dismiss</button>
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">Profile updated successfully!</p>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 overflow-hidden">
                {getDisplayImage() ? (
                  <img src={getDisplayImage()} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{userData.initials || '?'}</span>
                )}
              </div>
              <h1 className="text-xl font-bold">{userData.name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 mt-2">
                {userData.accountType || userData.role}
              </span>
            </div>
            <div className="md:w-2/3 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-5">
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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Your name"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-lg">
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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="you@example.com"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{userData.email}</span>
                    </div>
                  )}
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="9841234567"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium">{userData.phone || 'Not provided'}</span>
                    </div>
                  )}
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account role</label>
                  <div className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium capitalize">{userData.accountType || userData.role}</span>
                  </div>
                </div>

                {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My Properties - Owner only */}
        {isOwner && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
                <p className="text-sm text-gray-500 mt-1">Properties you&apos;ve created</p>
              </div>
              <Link
                to="/owner-dashboard/add-property"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Add Property
              </Link>
            </div>
            {properties.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-gray-600 mb-4">You haven&apos;t added any properties yet.</p>
                <Link
                  to="/owner-dashboard/add-property"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Add Your First Property
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {properties.map((p) => (
                  <div key={p._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    {p.image && (
                      <img src={p.image} alt={p.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </div>
                      <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                        (p.status || '').toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        (p.status || '').toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {(p.status || 'pending').charAt(0).toUpperCase() + (p.status || '').slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">NPR {p.price?.toLocaleString()}</span>
                      <Link
                        to={`/property/${p._id}`}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        to="/owner-dashboard"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Manage
                      </Link>
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
