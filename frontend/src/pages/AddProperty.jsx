import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Building2, MapPin, DollarSign, Bed, Bath, Square, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { propertyService } from '../services/aiService'

const PropertyMapPicker = lazy(() => import('../components/PropertyMapPicker'))

const AddProperty = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    type: 'house',
    location: '',
    latitude: null,
    longitude: null,
    price: '',
    bedrooms: '',
    bathrooms: '',
    areaSqft: '',
    description: '',
    amenities: [],
    utilities: {
      water: false,
      electricity: false,
      internet: false,
      maintenance: false
    },
    houseRules: {
      petsAllowed: false,
      smokingAllowed: false,
      guestsAllowed: true,
      quietHours: ''
    }
  })

  const [selectedFiles, setSelectedFiles] = useState([]) // File[]
  const [imagePreviews, setImagePreviews] = useState([]) // object URLs for preview
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newAmenity, setNewAmenity] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const valid = []
    const newErrors = []
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        newErrors.push(`${f.name}: exceeds 5MB limit`)
        continue
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        newErrors.push(`${f.name}: only jpeg, png, webp, gif allowed`)
        continue
      }
      valid.push(f)
    }
    setSelectedFiles(prev => [...prev, ...valid])
    setErrors(prev => ({ ...prev, image: newErrors.length ? newErrors.join('; ') : '' }))
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Create preview URLs and revoke on cleanup
  useEffect(() => {
    const urls = selectedFiles.map(f => URL.createObjectURL(f))
    setImagePreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u))
  }, [selectedFiles])

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }))
      setNewAmenity('')
    }
  }

  const handleRemoveAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.bedrooms || formData.bedrooms < 0) newErrors.bedrooms = 'Bedrooms is required'
    if (!formData.bathrooms || formData.bathrooms < 0) newErrors.bathrooms = 'Bathrooms is required'
    if (!formData.areaSqft || formData.areaSqft <= 0) newErrors.areaSqft = 'Area is required'
    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    if (selectedFiles.length === 0) newErrors.image = 'At least one image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      const fd = new FormData()
      fd.append('title', formData.title.trim())
      fd.append('type', formData.type)
      fd.append('location', formData.location.trim())
      fd.append('price', formData.price)
      fd.append('bedrooms', formData.bedrooms)
      fd.append('bathrooms', formData.bathrooms)
      fd.append('areaSqft', formData.areaSqft)
      fd.append('description', formData.description.trim())
      fd.append('amenities', JSON.stringify(formData.amenities))
      fd.append('utilities', JSON.stringify(formData.utilities))
      fd.append('houseRules', JSON.stringify(formData.houseRules))

      if (formData.latitude != null && formData.latitude !== '' && formData.longitude != null && formData.longitude !== '') {
        fd.append('latitude', formData.latitude)
        fd.append('longitude', formData.longitude)
      }

      selectedFiles.forEach((file) => {
        fd.append('images', file)
      })

      const response = await propertyService.createWithFormData(fd)

      if (response.success) {
        setShowSuccess(true)
        setTimeout(() => {
          navigate('/owner-dashboard')
        }, 2000)
      } else {
        setErrors({ general: response.message || 'Failed to create property' })
      }
    } catch (error) {
      console.error('Error creating property:', error)
      if (error.response?.data?.errors) {
        const validationErrors = {}
        error.response.data.errors.forEach(err => {
          validationErrors[err.path] = err.msg
        })
        setErrors(validationErrors)
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create property. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-2">Create a new property listing for rent</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">
              Property created successfully! Waiting for admin approval. Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                    errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="e.g., Modern 3 BHK House in Thamel"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="house">House</option>
                  <option value="flat_apartment">Flat/Apartment</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Location (address/area) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                      errors.location ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="e.g., Jhapa Modan House, Damak"
                  />
                </div>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>

              {/* Map Picker - Select Property Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Property Location
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Search an address or click on the map to set your property&apos;s exact location.
                </p>
                <Suspense fallback={<div className="w-full h-[400px] rounded-[10px] bg-gray-100 border border-gray-300 animate-pulse flex items-center justify-center text-gray-500">Loading map...</div>}>
                  <PropertyMapPicker
                    lat={formData.latitude}
                    lng={formData.longitude}
                    onLocationSelect={(lat, lng) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                      }))
                    }}
                  />
                </Suspense>
                {formData.latitude != null && formData.longitude != null && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Monthly Rent (NPR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                      errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="25000"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                      errors.bedrooms ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="3"
                  />
                </div>
                {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>}
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bathrooms <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                      errors.bathrooms ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="2"
                  />
                </div>
                {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>}
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Area (sqft) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="areaSqft"
                    value={formData.areaSqft}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                      errors.areaSqft ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="2000"
                  />
                </div>
                {errors.areaSqft && <p className="mt-1 text-sm text-red-600">{errors.areaSqft}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                    errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="Describe your property in detail (minimum 20 characters)..."
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/2000 characters
              </p>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Images <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload images (jpeg, png, webp, gif). Max 5MB per image. First image will be the main/cover image.
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleFileSelect}
                  className={`block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer ${
                    errors.image ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        {index === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          {selectedFiles[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {selectedFiles.length === 0 && (
                  <div className="mt-4 p-6 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500 text-sm">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p>No images selected. Click &quot;Choose File&quot; above to add images.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 bg-white"
                placeholder="e.g., Parking, WiFi, Garden"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="text-indigo-700 hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Utilities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Utilities Included</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="utilities.water"
                  checked={formData.utilities.water}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Water</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="utilities.electricity"
                  checked={formData.utilities.electricity}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Electricity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="utilities.internet"
                  checked={formData.utilities.internet}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Internet</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="utilities.maintenance"
                  checked={formData.utilities.maintenance}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Maintenance</span>
              </label>
            </div>
          </div>

          {/* House Rules */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="houseRules.petsAllowed"
                  checked={formData.houseRules.petsAllowed}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Pets Allowed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="houseRules.smokingAllowed"
                  checked={formData.houseRules.smokingAllowed}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Smoking Allowed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="houseRules.guestsAllowed"
                  checked={formData.houseRules.guestsAllowed}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Guests Allowed</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quiet Hours (Optional)
                </label>
                <input
                  type="text"
                  name="houseRules.quietHours"
                  value={formData.houseRules.quietHours}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="e.g., 10 PM - 7 AM"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/owner-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Property...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProperty

