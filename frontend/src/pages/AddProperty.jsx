import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Building2, MapPin, DollarSign, Bed, Bath, Square, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { propertyService } from '../services/aiService'

const AddProperty = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    type: 'house',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    areaSqft: '',
    description: '',
    image: '',
    images: [],
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
    },
    nearbyPlaces: []
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const [newNearbyPlace, setNewNearbyPlace] = useState({ name: '', type: 'market', distance: '' })

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

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

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

  const handleAddNearbyPlace = () => {
    if (newNearbyPlace.name.trim() && newNearbyPlace.distance.trim()) {
      setFormData(prev => ({
        ...prev,
        nearbyPlaces: [...prev.nearbyPlaces, { ...newNearbyPlace }]
      }))
      setNewNearbyPlace({ name: '', type: 'market', distance: '' })
    }
  }

  const handleRemoveNearbyPlace = (index) => {
    setFormData(prev => ({
      ...prev,
      nearbyPlaces: prev.nearbyPlaces.filter((_, i) => i !== index)
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
    if (!formData.image.trim()) newErrors.image = 'Main image URL is required'

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
      const propertyData = {
        title: formData.title.trim(),
        type: formData.type,
        location: formData.location.trim(),
        price: parseInt(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        areaSqft: parseInt(formData.areaSqft),
        description: formData.description.trim(),
        image: formData.image.trim(),
        images: formData.images,
        amenities: formData.amenities,
        utilities: formData.utilities,
        houseRules: formData.houseRules,
        nearbyPlaces: formData.nearbyPlaces
      }

      const response = await propertyService.create(propertyData)

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
                  Location <span className="text-red-500">*</span>
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
                    placeholder="e.g., Kathmandu, Pokhara"
                  />
                </div>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
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
              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Main Image URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 bg-white ${
                      errors.image ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg border" />
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Additional Images (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 bg-white"
                    placeholder="Image URL"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Additional ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
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

          {/* Nearby Places */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Places (Optional)</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newNearbyPlace.name}
                  onChange={(e) => setNewNearbyPlace({ ...newNearbyPlace, name: e.target.value })}
                  className="md:col-span-2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="Place name"
                />
                <select
                  value={newNearbyPlace.type}
                  onChange={(e) => setNewNearbyPlace({ ...newNearbyPlace, type: e.target.value })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="market">Market</option>
                  <option value="school">School</option>
                  <option value="hospital">Hospital</option>
                  <option value="bus_stop">Bus Stop</option>
                  <option value="restaurant">Restaurant</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNearbyPlace.distance}
                    onChange={(e) => setNewNearbyPlace({ ...newNearbyPlace, distance: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 bg-white"
                    placeholder="Distance"
                  />
                  <button
                    type="button"
                    onClick={handleAddNearbyPlace}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              {formData.nearbyPlaces.length > 0 && (
                <div className="space-y-2">
                  {formData.nearbyPlaces.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">
                        {place.name} ({place.type}) - {place.distance}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNearbyPlace(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

