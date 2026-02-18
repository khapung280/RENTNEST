import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ArrowLeft,
  Wifi, 
  Car, 
  Home,
  Phone,
  Mail,
  Check,
  Shield,
  Lock,
  UserCheck,
  Star,
  Info,
  TrendingDown,
  School,
  Building2,
  ShoppingBag,
  Bus,
  Utensils,
  Building,
  Droplets,
  Zap,
  Wrench,
  Ban,
  Users,
  Clock,
  Loader2
} from 'lucide-react'
import { propertyService, bookingService } from '../services/aiService'
import { calculateRentConfidence, getBestForLabel, calculateFairFlexSavings } from '../utils/propertyUtils'
import PropertyCardWithCompare from '../components/PropertyCardWithCompare'
import ContactOwnerButton from '../components/ContactOwnerButton'
import { getCurrentUserId, isAuthenticated } from '../utils/auth'

// Helper function to get property tags (same logic as Home/Houses pages)
function getPropertyTags(property) {
  const tags = []
  if (property.price <= 15000) tags.push('Best Value')
  if (property.bedrooms >= 3) tags.push('Family Home')
  if (property.price <= 18000 && property.bedrooms >= 2) tags.push('Long-Stay Friendly')
  if (property.id <= 10 || property.verified === true) tags.push('Verified')
  return tags.slice(0, 2) // Max 2 tags
}

// Property Detail Page - Clean, professional real estate marketplace style
const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Get current user ID for messaging
  const currentUserId = getCurrentUserId()
  const loggedIn = isAuthenticated()

  // Book Now state
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  // Fetch property from backend API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await propertyService.getById(id)
        if (response.success && response.data) {
          setProperty(response.data)
        } else {
          setError('Property not found')
        }
      } catch (err) {
        console.error('Error fetching property:', err)
        setError(err.response?.data?.message || 'Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProperty()
    }
  }, [id])
  
  // Generate additional images for gallery
  const generateImages = (mainImage) => {
    const imageUrls = [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    ]
    return [mainImage, ...imageUrls.filter(img => img !== mainImage).slice(0, 3)]
  }

  // Generate amenities based on property type and data
  const generateAmenities = (property) => {
    if (property.amenities && property.amenities.length > 0) {
      return property.amenities
    }
    // Fallback to generated amenities
    const baseAmenities = ['WiFi', 'Air Conditioning', 'Heating', 'Water Supply']
    if (property.bedrooms > 0) {
      baseAmenities.push('Washer/Dryer', 'Dishwasher', 'Kitchen')
    }
    if (property.type === 'house') {
      baseAmenities.push('Parking', 'Garden', 'Security')
    } else {
      baseAmenities.push('Parking', 'Security')
    }
    if (property.bedrooms >= 3) {
      baseAmenities.push('Balcony', 'Storage')
    }
    return baseAmenities
  }

  // Generate nearby places from property data or fallback
  const generateNearbyPlaces = (property) => {
    if (property.nearbyPlaces && property.nearbyPlaces.length > 0) {
      const iconMap = {
        'market': ShoppingBag,
        'bus_stop': Bus,
        'restaurant': Utensils,
        'school': School,
        'hospital': Building2,
        'shopping': Building
      }
      return property.nearbyPlaces.map(place => ({
        name: place.name,
        icon: iconMap[place.type] || Building,
        distance: place.distance
      }))
    }
    // Fallback to generated places
    const locationLower = property.location.toLowerCase()
    const basePlaces = [
      { name: 'Local Market', icon: ShoppingBag, distance: '0.5 km' },
      { name: 'Bus Stop', icon: Bus, distance: '0.3 km' },
      { name: 'Restaurant', icon: Utensils, distance: '0.4 km' },
    ]
    
    if (locationLower.includes('kathmandu') || locationLower.includes('thamel') || locationLower.includes('baneshwor')) {
      return [
        ...basePlaces,
        { name: 'School', icon: School, distance: '0.8 km' },
        { name: 'Hospital', icon: Building2, distance: '1.2 km' },
        { name: 'Shopping Center', icon: Building, distance: '0.6 km' },
      ]
    } else if (locationLower.includes('pokhara')) {
      return [
        ...basePlaces,
        { name: 'School', icon: School, distance: '1.0 km' },
        { name: 'Hospital', icon: Building2, distance: '1.5 km' },
        { name: 'Tourist Area', icon: Building, distance: '0.7 km' },
      ]
    } else {
      return [
        ...basePlaces,
        { name: 'School', icon: School, distance: '0.9 km' },
        { name: 'Hospital', icon: Building2, distance: '1.3 km' },
        { name: 'Community Center', icon: Building, distance: '0.5 km' },
      ]
    }
  }

  // Generate utilities included
  const generateUtilities = () => {
    return [
      { name: 'Water', icon: Droplets, included: true },
      { name: 'Electricity', icon: Zap, included: true },
      { name: 'Internet/WiFi', icon: Wifi, included: true },
      { name: 'Maintenance', icon: Wrench, included: true },
    ]
  }

  // Generate house rules and policies
  const generateHouseRules = (property) => {
    const rules = []
    
    // Pet policy - based on property type and size
    if (property.type === 'house' && property.areaSqft >= 2000) {
      rules.push({ 
        title: 'Pets', 
        description: 'Pets allowed (with owner approval)', 
        icon: Check,
        allowed: true 
      })
    } else {
      rules.push({ 
        title: 'Pets', 
        description: 'Pets not allowed', 
        icon: Ban,
        allowed: false 
      })
    }
    
    // Smoking policy
    rules.push({ 
      title: 'Smoking', 
      description: 'No smoking inside the property', 
      icon: Ban,
      allowed: false 
    })
    
    // Guest policy
    if (property.bedrooms >= 3) {
      rules.push({ 
        title: 'Guests', 
        description: 'Overnight guests allowed (max 2)', 
        icon: Users,
        allowed: true 
      })
    } else {
      rules.push({ 
        title: 'Guests', 
        description: 'Day guests only', 
        icon: Users,
        allowed: true 
      })
    }
    
    // Quiet hours
    rules.push({ 
      title: 'Quiet Hours', 
      description: '10 PM - 7 AM (please be considerate)', 
      icon: Clock,
      allowed: true 
    })
    
    return rules
  }

  // Create property detail object with advanced features
  const propertyDetail = property ? {
    ...property,
    id: property._id || property.id, // Support both MongoDB _id and numeric id
    rating: property.rating || 4.5,
    confidenceScore: calculateRentConfidence(property),
    bestFor: getBestForLabel(property),
    tags: getPropertyTags(property),
    images: property.images && property.images.length > 0 
      ? [property.image, ...property.images.filter(img => img !== property.image).slice(0, 3)]
      : generateImages(property.image),
    description: property.description || `Well-maintained ${property.title.toLowerCase()} located in ${property.location}. This property features ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and ${property.areaSqft} square feet of living space. Perfect for ${property.bedrooms === 0 ? 'solo travelers or couples' : property.bedrooms <= 2 ? 'couples or small families' : 'families'} looking for a comfortable rental experience in Nepal.`,
    amenities: generateAmenities(property),
  } : null
  
  // FairFlex savings calculation
  const fairFlexSavings = propertyDetail ? calculateFairFlexSavings(propertyDetail) : null
  
  // Get owner data from property (populated from backend)
  const owner = propertyDetail?.owner ? {
    _id: propertyDetail.owner._id || propertyDetail.owner,
    name: propertyDetail.owner.name || propertyDetail.ownerName || 'Property Owner',
    email: propertyDetail.owner.email || `owner@rentnest.com`,
    phone: propertyDetail.owner.phone || '+977-98XXXXXXXX',
    profilePicture: propertyDetail.owner.profilePicture || null
  } : null

  // Find similar properties (same location or same type) - fetch from API
  const [similarProperties, setSimilarProperties] = useState([])
  
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!propertyDetail) return
      
      try {
        const response = await propertyService.getAll({
          location: propertyDetail.location,
          limit: 5
        })
        if (response.success && response.data) {
          const similar = response.data
            .filter(p => (p._id || p.id) !== propertyDetail.id)
            .slice(0, 4)
            .map(p => ({
              ...p,
              id: p._id || p.id,
              rating: p.rating || 4.5,
              confidenceScore: calculateRentConfidence(p),
              bestFor: getBestForLabel(p),
              tags: getPropertyTags(p),
            }))
          setSimilarProperties(similar)
        }
      } catch (err) {
        console.error('Error fetching similar properties:', err)
        setSimilarProperties([])
      }
    }
    
    fetchSimilarProperties()
  }, [propertyDetail])

  // Generate "Why this house?" reasons based on property characteristics and advanced features
  const generateWhyThisHouse = (property) => {
    const reasons = []
    
    // Based on Rent Confidence Score
    if (property.confidenceScore >= 80) {
      reasons.push('High confidence score - excellent value and verified')
    } else if (property.confidenceScore >= 60) {
      reasons.push('Good confidence score - reliable and well-priced')
    }
    
    // Based on Best For label
    if (property.bestFor === 'Family') {
      reasons.push('Perfect for families with spacious layout')
    } else if (property.bestFor === 'Students') {
      reasons.push('Ideal for students with budget-friendly pricing')
    } else if (property.bestFor === 'Professionals') {
      reasons.push('Great for professionals in prime location')
    }
    
    // Based on tags
    if (property.tags && property.tags.includes('Best Value')) {
      reasons.push('Best value option in this area')
    }
    if (property.tags && property.tags.includes('Long-Stay Friendly')) {
      reasons.push('Long-stay friendly with FairFlex savings')
    }
    
    // Based on FairFlex availability
    if (fairFlexSavings && fairFlexSavings.hasFairFlex) {
      reasons.push(`Save up to NPR ${fairFlexSavings.savings6Months.toLocaleString()} on 6-month stay`)
    }
    
    // Fallback reasons if not enough
    if (reasons.length < 3) {
      if (property.bedrooms >= 3) {
        reasons.push('Great for families needing extra space')
      } else if (property.bedrooms === 2) {
        reasons.push('Perfect for couples or small families')
      }
      
      const locationLower = property.location.toLowerCase()
      if (locationLower.includes('kathmandu') || locationLower.includes('thamel')) {
        reasons.push('Close to city center and amenities')
      } else if (locationLower.includes('pokhara')) {
        reasons.push('Peaceful location with scenic views')
      }
    }
    
    return reasons.slice(0, 4) // Return max 4 reasons
  }
  
  // Get confidence color
  const getConfidenceColor = (score) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-orange-600'
  }
  
  // Get best for color
  const getBestForColor = (label) => {
    const colors = {
      'Family': 'bg-blue-600',
      'Students': 'bg-purple-600',
      'Professionals': 'bg-indigo-600',
      'Quiet Living': 'bg-teal-600'
    }
    return colors[label] || 'bg-gray-600'
  }

  // State for selected main image
  const [selectedImage, setSelectedImage] = useState('')

  // Update selectedImage when propertyDetail loads
  useEffect(() => {
    if (propertyDetail) {
      if (propertyDetail.images && propertyDetail.images.length > 0) {
        setSelectedImage(propertyDetail.images[0])
      } else if (propertyDetail.image) {
        setSelectedImage(propertyDetail.image)
      } else {
        // Fallback to default image
        setSelectedImage('https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop')
      }
    }
  }, [propertyDetail])
  
  // State for FairFlex pricing duration
  const [selectedDuration, setSelectedDuration] = useState(1)
  
  // State for confidence tooltip
  const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false)
  
  // Calculate FairFlex pricing based on duration
  const calculateFairFlexPrice = (basePrice, duration) => {
    // Simple discount logic: longer stays get better pricing
    const discounts = {
      1: 0,      // No discount for 1 month
      3: 0.05,   // 5% discount for 3 months
      6: 0.10,   // 10% discount for 6 months
    }
    const discount = discounts[duration] || 0
    return Math.round(basePrice * (1 - discount))
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-neutral-950 flex items-center justify-center py-32 min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading property...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !propertyDetail) {
    return (
      <div className="bg-neutral-950 flex items-center justify-center py-32 min-h-screen">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {error || 'Property Not Found'}
          </h2>
          <button
            onClick={() => navigate('/houses')}
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Back to Houses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-100">
      {/* Header with Back Button */}
      <div className="bg-neutral-900/80 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="bg-neutral-900/50 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Main Large Image */}
            <div className="mb-4">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={propertyDetail.title}
                  className="w-full h-[500px] md:h-[600px] object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop'
                  }}
                />
              ) : (
                <div className="w-full h-[500px] md:h-[600px] bg-neutral-800 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {propertyDetail.images && propertyDetail.images.length > 0 ? (
                propertyDetail.images.slice(0, 4).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img
                      ? 'border-violet-500 ring-2 ring-violet-500/30'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${propertyDetail.title} ${index + 1}`}
                    className="w-full h-24 md:h-28 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'
                    }}
                  />
                </button>
                ))
              ) : (
                <div className="col-span-4 text-center py-4 text-gray-500 text-sm">
                  No additional images available
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Property Header Section */}
      <section className="bg-neutral-900/50 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: Title and Location */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-semibold text-white">
                  {propertyDetail.title}
                </h1>
                
                {/* Rent Confidence Score Badge */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowConfidenceTooltip(true)}
                    onMouseLeave={() => setShowConfidenceTooltip(false)}
                    className={`${getConfidenceColor(propertyDetail.confidenceScore)} text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md`}
                  >
                    <span className="font-bold text-sm">{propertyDetail.confidenceScore}</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  {showConfidenceTooltip && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-800 text-white text-xs p-3 rounded-xl shadow-xl z-30 border border-neutral-700">
                      <div className="font-semibold mb-2">Rent Confidence Score</div>
                        <div className="space-y-1 text-gray-300">
                        <div>• Verified listing: {propertyDetail.verified ? 'Yes (+30)' : 'No'}</div>
                        <div>• Price fairness: {propertyDetail.price / propertyDetail.areaSqft <= 12 ? 'Good value' : 'Standard'}</div>
                        <div>• FairFlex: {fairFlexSavings?.hasFairFlex ? 'Available (+20)' : 'Not available'}</div>
                        <div>• Amenities: Based on size & features</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Rating Badge */}
                {propertyDetail.rating && (
                  <div className="bg-neutral-800 border border-neutral-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-white">
                      {propertyDetail.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                
                {/* Verified Badge */}
                {propertyDetail.verified && (
                  <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2.5 py-1 rounded-md border border-green-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
              </div>
              
              {/* Location and Best For */}
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-medium">{propertyDetail.location}</span>
                </div>
                
                {/* Best For Label */}
                {propertyDetail.bestFor && (
                  <span className={`${getBestForColor(propertyDetail.bestFor)} text-white text-xs font-semibold px-3 py-1 rounded-md`}>
                    Best for {propertyDetail.bestFor}
                  </span>
                )}
              </div>
              
              {/* Property Tags */}
              {propertyDetail.tags && propertyDetail.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {propertyDetail.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        tag === 'Verified'
                          ? 'bg-green-600 text-white'
                          : tag === 'Best Value'
                          ? 'bg-indigo-600 text-white'
                          : tag === 'Family Home'
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right: Price */}
            <div className="md:text-right">
              <div className="flex items-baseline gap-2 md:justify-end mb-1">
                <span className="text-4xl md:text-5xl font-semibold text-white">
                  Rs. {propertyDetail.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-400 font-medium">/month</span>
              </div>
              <p className="text-sm text-gray-500">
                FairFlex pricing available for longer stays
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FairFlex Pricing Preview */}
            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 p-6 md:p-8">
            <div className="border-b border-neutral-800 pb-8">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-white mb-1">FairFlex Pricing</h3>
                <p className="text-sm text-gray-400">
                  Save more when you commit to longer stays. Choose your preferred duration below.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[1, 3, 6].map((months) => {
                  const discountedPrice = calculateFairFlexPrice(propertyDetail.price, months)
                  const isSelected = selectedDuration === months
                  
                  return (
                    <button
                      key={months}
                      onClick={() => setSelectedDuration(months)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-violet-500 bg-neutral-800'
                          : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {months} {months === 1 ? 'Month' : 'Months'}
                      </div>
                      <div className="text-xl font-semibold text-white">
                        Rs. {discountedPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">/month</div>
                      {months > 1 && (
                        <div className="text-xs text-gray-400 font-medium mt-1">
                          Save {Math.round((propertyDetail.price - discountedPrice) * months).toLocaleString()}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 font-medium">
                    Selected: {selectedDuration} {selectedDuration === 1 ? 'month' : 'months'}
                  </span>
                  <span className="text-lg font-semibold text-white">
                    Rs. {(calculateFairFlexPrice(propertyDetail.price, selectedDuration) * selectedDuration).toLocaleString()}
                  </span>
                </div>
                
                {/* Enhanced Savings Display */}
                {selectedDuration > 1 && fairFlexSavings && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-300">
                        You save NPR {Math.round((propertyDetail.price - calculateFairFlexPrice(propertyDetail.price, selectedDuration)) * selectedDuration).toLocaleString()} on {selectedDuration}-month stay
                      </span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">
                      {selectedDuration === 3 
                        ? `Save NPR ${fairFlexSavings.monthlySavings3.toLocaleString()}/month with FairFlex`
                        : `Save NPR ${fairFlexSavings.monthlySavings6.toLocaleString()}/month with FairFlex`}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Total for {selectedDuration} {selectedDuration === 1 ? 'month' : 'months'}
                </p>
              </div>
            </div>
            </div>

            {/* Key Property Facts */}
            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 p-6 md:p-8">
            <div className="grid grid-cols-3 gap-6 py-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-400">Bedrooms</p>
                  <p className="text-lg font-semibold text-white">{propertyDetail.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-400">Bathrooms</p>
                  <p className="text-lg font-semibold text-white">{propertyDetail.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-400">Area</p>
                  <p className="text-lg font-semibold text-white">{propertyDetail.areaSqft} sqft</p>
                </div>
              </div>
            </div>

            {/* Property Description */}
            <div className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">About this property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">{propertyDetail.description}</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                This property offers a comfortable living experience with modern amenities and a convenient location. 
                Whether you're looking for a short-term stay or a longer commitment, this home provides everything you need 
                for a pleasant rental experience in Nepal.
              </p>
            </div>

            {/* Why This House */}
            <div className="pt-8 border-t border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-4">Why this house?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generateWhyThisHouse(propertyDetail).map((reason, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="pt-8 border-t border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-5">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {propertyDetail.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Nearby */}
            <div className="pt-8 border-t border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-5">What's nearby</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generateNearbyPlaces(propertyDetail).map((place, index) => {
                  const IconComponent = place.icon
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
                      <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{place.name}</p>
                        <p className="text-xs text-gray-400">{place.distance}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Utilities Included */}
            <div className="pt-8 border-t border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-5">Utilities included</h2>
              <p className="text-sm text-gray-400 mb-4">
                The following utilities are included in your monthly rent:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generateUtilities().map((utility, index) => {
                  const IconComponent = utility.icon
                  return (
                    <div key={index} className="flex items-center gap-2.5 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
                      <IconComponent className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-white">{utility.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* House Rules & Policies */}
            <div className="pt-8 border-t border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-5">House rules & policies</h2>
              <p className="text-sm text-gray-400 mb-4">
                Please review these rules before booking:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generateHouseRules(propertyDetail).map((rule, index) => {
                  const IconComponent = rule.icon
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                      <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        rule.allowed ? 'text-green-400' : 'text-gray-500'
                      }`} />
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">{rule.title}</h3>
                        <p className="text-sm text-gray-400">{rule.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trust and Safety */}
            <div className="pt-8 border-t border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-5">Trust & Safety</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Verified Property</h3>
                    <p className="text-sm text-gray-400">
                      This property has been verified by our team for accuracy and availability.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Verified Owner</h3>
                    <p className="text-sm text-gray-400">
                      The property owner has been verified and is responsive to inquiries.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Secure Booking</h3>
                    <p className="text-sm text-gray-400">
                      All bookings are processed securely. Your payment information is protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Column - CTA */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 md:p-8 sticky top-24">
              {/* Book Now */}
              <div className="mb-6">
                {bookingSuccess ? (
                  <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                    <p className="text-sm font-medium text-emerald-200">Booking request sent.</p>
                    <p className="text-xs text-emerald-300/90 mt-1">We&apos;ll confirm your stay soon.</p>
                  </div>
                ) : !loggedIn ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/property/${propertyDetail._id || propertyDetail.id}`)}`)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center"
                  >
                    Book Now
                  </button>
                ) : (() => {
                  const ownerId = propertyDetail.owner?._id || propertyDetail.owner
                  const isOwnProperty = ownerId && currentUserId && String(ownerId) === String(currentUserId)
                  if (isOwnProperty) {
                    return (
                      <p className="text-sm text-gray-400 py-2 text-center">You can&apos;t book your own property.</p>
                    )
                  }
                  const today = new Date().toISOString().slice(0, 10)
                  const checkInMin = today
                  const checkOutMin = checkInDate || today
                  return (
                    <>
                      <p className="text-white font-semibold text-lg mb-4">Select dates</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Check-in</label>
                          <input
                            type="date"
                            value={checkInDate}
                            min={checkInMin}
                            onChange={(e) => {
                              setCheckInDate(e.target.value)
                              if (checkOutDate && e.target.value && checkOutDate <= e.target.value) setCheckOutDate('')
                              setBookingError('')
                            }}
                            className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder:text-gray-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Check-out</label>
                          <input
                            type="date"
                            value={checkOutDate}
                            min={checkOutMin}
                            onChange={(e) => { setCheckOutDate(e.target.value); setBookingError('') }}
                            className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder:text-gray-500 transition-all"
                          />
                        </div>
                        {bookingError && <p className="text-xs text-red-400">{bookingError}</p>}
                        <button
                          type="button"
                          disabled={!checkInDate || !checkOutDate || bookingLoading}
                          onClick={async () => {
                            if (!checkInDate || !checkOutDate) return
                            setBookingError('')
                            setBookingLoading(true)
                            try {
                              const res = await bookingService.create({
                                property: propertyDetail._id || propertyDetail.id,
                                checkInDate: new Date(checkInDate).toISOString(),
                                checkOutDate: new Date(checkOutDate).toISOString()
                              })
                              if (res.success) {
                                setBookingSuccess(true)
                                setCheckInDate('')
                                setCheckOutDate('')
                              } else {
                                setBookingError(res.message || 'Request failed')
                              }
                            } catch (err) {
                              setBookingError(err.response?.data?.message || 'Failed to send booking request')
                            } finally {
                              setBookingLoading(false)
                            }
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                          {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Send booking request
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Secondary CTA - Contact Owner */}
              <div className="mb-6">
                {owner ? (
                  <ContactOwnerButton 
                    property={propertyDetail}
                    owner={owner}
                    currentUserId={currentUserId}
                  />
                ) : (
                  <button 
                    onClick={() => {
                      if (!currentUserId) {
                        navigate('/login')
                      } else {
                        alert('Owner information not available. Please try again later.')
                      }
                    }}
                    className="w-full bg-neutral-800 text-white border border-neutral-700 font-medium py-3 rounded-xl hover:bg-neutral-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contact owner
                  </button>
                )}
              </div>

              {/* Secure Booking Note */}
              <div className="pt-6 border-t border-neutral-800">
                <div className="flex items-start gap-2.5 mb-4">
                  <Lock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Your booking request will be sent to the property owner. They&apos;ll respond within 24 hours.
                  </p>
                </div>
                <p className="text-gray-400 text-xs text-center leading-relaxed">
                  All bookings are subject to availability and owner approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <section className="bg-neutral-900/50 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">You might also like</h2>
              <p className="text-gray-400">
                Similar properties in {propertyDetail.location} that might interest you
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((similarProperty) => (
                <PropertyCardWithCompare
                  key={similarProperty.id}
                  property={similarProperty}
                  isSelected={false}
                  onToggleCompare={() => {}}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default PropertyDetail
