import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Check,
  Shield,
  Lock,
  Mail,
  Phone,
  User,
  AlertCircle,
  FileText,
  HelpCircle,
  CheckCircle2
} from 'lucide-react'
import { propertyService } from '../services/aiService'

// Booking Page - Professional, trustworthy, and human-centered booking experience
const Booking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Property from API
  const [property, setProperty] = useState(null)
  const [propertyLoading, setPropertyLoading] = useState(true)
  const [propertyError, setPropertyError] = useState(null)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setPropertyLoading(false)
        return
      }
      try {
        setPropertyLoading(true)
        setPropertyError(null)
        const response = await propertyService.getById(id)
        if (response.success && response.data) {
          setProperty({ ...response.data, id: response.data._id || response.data.id })
        } else {
          setPropertyError('Property not found')
        }
      } catch (err) {
        console.error('Error fetching property:', err)
        setPropertyError(err.response?.data?.message || 'Property not found')
      } finally {
        setPropertyLoading(false)
      }
    }
    fetchProperty()
  }, [id])
  
  // State for booking duration
  const [selectedDuration, setSelectedDuration] = useState(1)
  
  // Form state
  const [formData, setFormData] = useState({
    moveInDate: '',
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  })
  
  // Form validation state
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  // Terms and submission state
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Calculate FairFlex pricing based on duration
  const calculateFairFlexPrice = (basePrice, duration) => {
    const discounts = {
      1: 0,      // No discount for 1 month
      3: 0.05,   // 5% discount for 3 months
      6: 0.10,   // 10% discount for 6 months
    }
    const discount = discounts[duration] || 0
    return Math.round(basePrice * (1 - discount))
  }

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'moveInDate':
        if (!value) return 'Move-in date is required'
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selectedDate < today) return 'Move-in date must be today or later'
        return ''
      case 'fullName':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return ''
      case 'phone':
        if (!value.trim()) return 'Phone number is required'
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number'
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

  // Handle blur (for validation)
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  // Validate entire form
  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'specialRequests') {
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      moveInDate: true,
      fullName: true,
      email: true,
      phone: true
    })
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    // Check terms agreement
    if (!agreedToTerms) {
      return
    }
    
    // Simulate API call
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-4">{propertyError || 'This property may have been removed.'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const monthlyPrice = calculateFairFlexPrice(property.price, selectedDuration)
  const totalPrice = monthlyPrice * selectedDuration
  const savings = selectedDuration > 1 ? (property.price * selectedDuration) - totalPrice : 0
  const discount = selectedDuration === 1 ? 0 : selectedDuration === 3 ? 5 : 10
  
  // Check if form is valid
  const isFormValid = Object.keys(errors).length === 0 && 
    formData.moveInDate && 
    formData.fullName.trim() && 
    formData.email.trim() && 
    formData.phone.trim() &&
    agreedToTerms

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Booking Request Submitted!</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Your booking request has been sent successfully. The property owner will review your request and get back to you within 24 hours.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You'll receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>The property owner will review your request</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You'll be notified once your request is approved</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/my-bookings')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/houses')}
                className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Browse More Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Complete Your Booking</h1>
          <p className="text-sm text-gray-600 mt-1">Review your details and confirm your booking request</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Property Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-gray-400" />
                        <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Square className="w-4 h-4 text-gray-400" />
                        <span>{property.areaSqft} sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Stay Duration Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Stay Duration</h2>
                  <p className="text-sm text-gray-600">
                    Longer stays get better monthly rates with FairFlex pricing
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 3, 6].map((months) => {
                    const discountedPrice = calculateFairFlexPrice(property.price, months)
                    const isSelected = selectedDuration === months
                    const monthDiscount = months === 1 ? 0 : months === 3 ? 5 : 10
                    
                    return (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setSelectedDuration(months)}
                        className={`p-5 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-base font-semibold text-gray-900">
                            {months} {months === 1 ? 'Month' : 'Months'}
                          </div>
                          {monthDiscount > 0 && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-green-100 text-green-700'
                            }`}>
                              {monthDiscount}% off
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          Rs. {discountedPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">per month</div>
                        {monthDiscount > 0 && (
                          <div className="text-xs text-green-600 font-medium mt-2">
                            Save Rs. {(property.price - discountedPrice).toLocaleString()}/month
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 3: Guest & Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Guest & Contact Information</h2>
                <p className="text-sm text-gray-600 mb-6">We'll use this information to contact you about your booking</p>
                
                <div className="space-y-5">
                  {/* Move-in Date */}
                  <div>
                    <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-900 mb-2">
                      Move-in Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="moveInDate"
                        name="moveInDate"
                        value={formData.moveInDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.moveInDate && touched.moveInDate
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.moveInDate && touched.moveInDate && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.moveInDate}
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.fullName && touched.fullName
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.fullName && touched.fullName && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="john.doe@example.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.email && touched.email
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="+977 9841234567"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                          errors.phone && touched.phone
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-900 mb-2">
                      Special Requests or Notes <span className="text-gray-500 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Any special requirements, questions, or notes for the property owner..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      This information will be shared with the property owner
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Terms & Conditions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        I agree to the Terms & Conditions and Privacy Policy <span className="text-red-500">*</span>
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        By checking this box, you confirm that you have read and agree to RentNest's terms of service and privacy policy.
                      </p>
                    </div>
                  </label>
                  
                  {!agreedToTerms && touched.agreedToTerms && (
                    <p className="text-sm text-red-600 flex items-center gap-1 ml-8">
                      <AlertCircle className="w-4 h-4" />
                      You must agree to the terms to continue
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary & CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                {/* Booking Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">Booking Summary</h3>
                  
                  {/* Property Info */}
                  <div className="mb-5 pb-5 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Property</p>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{property.title}</p>
                    <p className="text-xs text-gray-600">{property.location}</p>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stay duration</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedDuration} {selectedDuration === 1 ? 'month' : 'months'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly rate</span>
                      <span className="text-sm font-semibold text-gray-900">Rs. {monthlyPrice.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Discount</span>
                          <span className="text-sm font-semibold text-green-600">{discount}%</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-900">FairFlex savings</span>
                          <span className="text-sm font-bold text-green-600">Rs. {savings.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Total */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-gray-900">Rs. {totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      For {selectedDuration} {selectedDuration === 1 ? 'month' : 'months'} stay
                    </p>
                  </div>

                  {/* Pricing Note */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      All prices are transparent. No hidden fees. Final amount may vary based on move-in date and additional services.
                    </p>
                  </div>
                </div>

                {/* Trust & Safety */}
                <div className="mb-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Trust & Safety
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Verified Property</p>
                        <p className="text-xs text-gray-600 mt-0.5">Property details verified by our team</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Secure Booking</p>
                        <p className="text-xs text-gray-600 mt-0.5">Your information is encrypted and protected</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Cancellation Policy</p>
                        <p className="text-xs text-gray-600 mt-0.5">Free cancellation up to 7 days before move-in</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="mb-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-gray-600" />
                    Need Help?
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span>support@rentnest.com</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+977 1-234-5678</span>
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-base mb-3 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Confirm Booking Request'
                    )}
                  </button>
                  <p className="text-xs text-gray-600 text-center leading-relaxed">
                    You'll receive a confirmation email and the property owner will review your request within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Booking
