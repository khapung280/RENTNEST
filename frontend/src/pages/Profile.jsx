import { useState } from 'react'
import { User, Mail, Phone, Shield, Edit, LogOut, Save, X, Camera, CheckCircle2, AlertCircle } from 'lucide-react'

// User Profile Page - Professional profile with edit functionality
const Profile = () => {
  // Initial user data
  const initialUserData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+977 9841234567',
    accountType: 'Renter',
    initials: 'JD',
    profilePicture: null
  }

  // State
  const [userData, setUserData] = useState(initialUserData)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(initialUserData)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [profileImagePreview, setProfileImagePreview] = useState(null)

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return ''
      case 'phone':
        if (value.trim()) {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
          if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number'
        }
        return ''
      default:
        return ''
    }
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle profile picture change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please select an image file' }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'Image size must be less than 5MB' }))
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result)
        setFormData(prev => ({ ...prev, profilePicture: file }))
        setErrors(prev => ({ ...prev, profilePicture: '' }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle edit toggle
  const handleEdit = () => {
    setIsEditing(true)
    setFormData(userData)
    setProfileImagePreview(userData.profilePicture || null)
    setErrors({})
    setShowSuccess(false)
  }

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false)
    setFormData(userData)
    setProfileImagePreview(userData.profilePicture || null)
    setErrors({})
    setShowSuccess(false)
  }

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'accountType' && key !== 'initials' && key !== 'profilePicture') {
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      }
    })
    
    setErrors(newErrors)
    
    // If there are errors, don't save
    if (Object.keys(newErrors).length > 0) {
      return
    }

    // Simulate API call
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update user data
    const updatedData = {
      ...formData,
      initials: formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    setUserData(updatedData)
    setIsEditing(false)
    setIsSaving(false)
    setShowSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Get display image
  const getDisplayImage = () => {
    if (isEditing && profileImagePreview) return profileImagePreview
    if (userData.profilePicture) return userData.profilePicture
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Profile</h1>
          <p className="text-base text-gray-600">
            {isEditing ? 'Edit your account information' : 'Your account information and settings'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md">
          {/* Avatar Section */}
          <div className="flex flex-col items-center pt-14 pb-12 border-b border-gray-200 relative">
            {/* Profile Picture */}
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center shadow-lg">
                {getDisplayImage() ? (
                  <img
                    src={getDisplayImage()}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-white">
                    {userData.initials}
                  </span>
                )}
              </div>
              
              {/* Edit Picture Button (only in edit mode) */}
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {isEditing ? formData.name : userData.name}
            </h2>
            <p className="text-sm font-medium text-gray-600">
              {userData.accountType}
            </p>
            
            {errors.profilePicture && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.profilePicture}
              </p>
            )}
          </div>

          {/* User Information Section */}
          <div className="p-8 md:p-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <form onSubmit={handleSave}>
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.name
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-base font-medium text-gray-900">{userData.name}</span>
                    </div>
                  )}
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.email
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-base font-medium text-gray-900">{userData.email}</span>
                    </div>
                  )}
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                    Phone <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.phone
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        placeholder="+977 9841234567"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-base font-medium text-gray-900">{userData.phone || 'Not provided'}</span>
                    </div>
                  )}
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Account Type (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Account role
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-base font-medium text-gray-900">{userData.accountType}</span>
                    <span className="text-xs text-gray-500 ml-auto">(Cannot be changed)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 mt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit profile</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-900 font-medium rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
