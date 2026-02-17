import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Shield, 
  Star, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  CheckCircle, 
  ArrowRight,
  Home as HomeIcon,
  Building2,
  MessageCircle,
  Lock,
  DollarSign,
  TrendingUp,
  Lightbulb,
  Calculator,
  Info
} from 'lucide-react'
import { propertyService } from '../services/aiService'
import PropertyCardWithCompare from '../components/PropertyCardWithCompare'
import CompareBar from '../components/CompareBar'
import CompareModal from '../components/CompareModal'
import Loader from '../components/Loader'
import { calculateRentConfidence, getBestForLabel, getCityLivingCost, getCityInsights } from '../utils/propertyUtils'
import { isAuthenticated } from '../utils/auth'

const Home = () => {
  // Get user data for role-based content
  const [user, setUser] = useState(null)
  // Properties from API
  const [propertiesList, setPropertiesList] = useState([])
  const [propertiesLoading, setPropertiesLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setPropertiesLoading(true)
        const response = await propertyService.getAll()
        if (response.success && response.data) {
          setPropertiesList(response.data)
        }
      } catch (err) {
        console.error('Error fetching properties:', err)
      } finally {
        setPropertiesLoading(false)
      }
    }
    fetchProperties()
  }, [])

  // Search state
  const [searchLocation, setSearchLocation] = useState('')
  const [propertyType, setPropertyType] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [bedrooms, setBedrooms] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [showLocationError, setShowLocationError] = useState(false)
  const [locationTouched, setLocationTouched] = useState(false)
  
  // Compare state
  const [compareProperties, setCompareProperties] = useState([])
  const [showCompareModal, setShowCompareModal] = useState(false)
  
  // Decision Helper Mode
  const [decisionHelperMode, setDecisionHelperMode] = useState(false)
  
  // Living Cost Estimator
  const [selectedCity, setSelectedCity] = useState('Kathmandu')
  
  const navigate = useNavigate()

  // Transform properties with ratings, confidence scores, and best for labels
  const allProperties = useMemo(() => propertiesList.map(prop => ({
    ...prop,
    id: prop._id || prop.id,
    rating: prop.rating || 4.5,
    type: prop.type === 'house' ? 'House' : prop.type === 'flat_apartment' ? 'Apartment' : prop.type,
    confidenceScore: calculateRentConfidence(prop),
    bestFor: getBestForLabel(prop),
  })), [propertiesList])

  // Load last search from localStorage
  useEffect(() => {
    const lastSearch = localStorage.getItem('rentnest_last_search')
    if (lastSearch) {
      try {
        const parsed = JSON.parse(lastSearch)
        if (parsed.location) setSearchLocation(parsed.location)
        if (parsed.type) setPropertyType(parsed.type)
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save search to localStorage
  const saveSearch = (location, type) => {
    if (location || type !== 'all') {
      localStorage.setItem('rentnest_last_search', JSON.stringify({ location, type }))
    }
  }

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault()
    const location = searchLocation.trim()
    
    setLocationTouched(true)
    
    if (!location) {
      setShowLocationError(true)
      return
    }

    setShowLocationError(false)
    saveSearch(location, propertyType)
    
    // Build query params
    const params = new URLSearchParams()
    params.set('location', location)
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-')
      if (min) params.set('min', min)
      if (max) params.set('max', max)
    }
    if (bedrooms !== 'all') params.set('beds', bedrooms)
    
    // Determine route
    let route = '/houses'
    if (propertyType === 'flats') {
      route = '/flats-apartments'
    }
    
    navigate(`${route}?${params.toString()}`)
  }

  // Live Results Preview - Filter properties as user types (exact location match)
  const liveResults = useMemo(() => {
    let filtered = [...allProperties]
    const cleanedLocation = searchLocation.trim()

    // Filter by location if typed - exact match only, case-insensitive
    if (cleanedLocation) {
      const locLower = cleanedLocation.toLowerCase()
      filtered = filtered.filter(p => p.location.toLowerCase() === locLower)
    }
    
    // Filter by property type
    if (propertyType === 'houses') {
      filtered = filtered.filter(p => p.type === 'house')
    } else if (propertyType === 'flats') {
      filtered = filtered.filter(p => p.type === 'flat_apartment')
    }
    
    // Filter by budget range
    if (priceRange !== 'all') {
      const [minStr, maxStr] = priceRange.split('-')
      const min = minStr ? parseInt(minStr) : null
      const max = maxStr ? parseInt(maxStr) : null
      
      filtered = filtered.filter(p => {
        if (min !== null && p.price < min) return false
        if (max !== null && p.price > max) return false
        return true
      })
    }
    
    // Filter by bedrooms
    if (bedrooms !== 'all') {
      const beds = parseInt(bedrooms)
      filtered = filtered.filter(p => p.bedrooms >= beds)
    }
    
    // Sort
    if (decisionHelperMode) {
      // Decision Helper Mode: Sort by Rent Confidence Score
      filtered.sort((a, b) => {
        const scoreA = a.confidenceScore || calculateRentConfidence(a)
        const scoreB = b.confidenceScore || calculateRentConfidence(b)
        return scoreB - scoreA
      })
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    }
    // 'recommended' keeps original order
    
    return filtered.slice(0, 4)
  }, [searchLocation, propertyType, priceRange, bedrooms, sortBy, decisionHelperMode, allProperties])

  // Trending properties (when no search input)
  const trendingProperties = useMemo(() => {
    let sorted = [...allProperties]
    
    if (decisionHelperMode) {
      sorted.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
    } else {
      sorted.sort((a, b) => b.rating - a.rating)
    }
    
    return sorted
      .slice(0, 4)
      .map(prop => ({
        ...prop,
        tags: decisionHelperMode && (prop.confidenceScore || 0) >= 80 
          ? ['Best Value'] 
          : prop.price <= 15000 
            ? ['Best Value'] 
            : ['Trending']
      }))
  }, [allProperties, decisionHelperMode])

  // Personalized Recommendations (from localStorage or best value)
  const personalizedRecommendations = useMemo(() => {
    const lastSearch = localStorage.getItem('rentnest_last_search')
    
    if (lastSearch) {
      try {
        const parsed = JSON.parse(lastSearch)
        let filtered = [...allProperties]
        
        if (parsed.location) {
          const cleanedLocation = (parsed.location || '').trim().toLowerCase()
          if (cleanedLocation) {
            filtered = filtered.filter(p => p.location.toLowerCase() === cleanedLocation)
          }
        }
        
        if (parsed.type === 'houses') {
          filtered = filtered.filter(p => p.type === 'house')
        } else if (parsed.type === 'flats') {
          filtered = filtered.filter(p => p.type === 'flat_apartment')
        }
        
        if (filtered.length > 0) {
          // Sort by confidence if Decision Helper is on
          if (decisionHelperMode) {
            filtered.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
          } else {
            filtered.sort((a, b) => a.price - b.price)
          }
          
          return filtered.slice(0, 4).map(prop => ({
            ...prop,
            tags: decisionHelperMode && (prop.confidenceScore || 0) >= 80
              ? ['Best Value']
              : prop.price <= 15000
                ? ['Best Value']
                : ['Recommended']
          }))
        }
      } catch (e) {
        // Fall through to best value
      }
    }
    
    // Best value recommendations
    let sorted = [...allProperties]
    if (decisionHelperMode) {
      sorted.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
    } else {
      sorted.sort((a, b) => a.price - b.price)
    }
    
    return sorted
      .slice(0, 4)
      .map(prop => ({
        ...prop,
        tags: ['Best Value']
      }))
  }, [allProperties, decisionHelperMode])

  // Popular Properties (6 max)
  const popularProperties = useMemo(() => {
    let sorted = [...allProperties]
    
    if (decisionHelperMode) {
      sorted.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
    }
    
    return sorted.slice(0, 6).map((prop) => {
      let tags = []
      if (decisionHelperMode && (prop.confidenceScore || 0) >= 80) {
        tags.push('Best Value')
      } else if (prop.price <= 15000) {
        tags.push('Best Value')
      }
      if (prop.bedrooms >= 3) tags.push('Family Choice')
      if (prop.price <= 18000 && prop.bedrooms >= 2) tags.push('Long Stay Friendly')
      if (tags.length === 0) tags.push('Popular')
      return { ...prop, tags: tags.slice(0, 1) }
    })
  }, [allProperties, decisionHelperMode])
  
  // Living cost data
  const livingCost = useMemo(() => getCityLivingCost(selectedCity), [selectedCity])
  const cityInsight = useMemo(() => getCityInsights(selectedCity), [selectedCity])

  // Compare functionality
  const handleToggleCompare = (propertyId) => {
    const property = allProperties.find(p => p.id === propertyId)
    if (!property) return
    
    const isSelected = compareProperties.some(p => p.id === propertyId)
    
    if (isSelected) {
      setCompareProperties(prev => prev.filter(p => p.id !== propertyId))
    } else {
      if (compareProperties.length < 3) {
        setCompareProperties(prev => [...prev, property])
      }
    }
  }

  const handleCompare = () => {
    if (compareProperties.length >= 2) {
      setShowCompareModal(true)
    }
  }

  const handleClearCompare = () => {
    setCompareProperties([])
  }

  // Quick Actions
  const quickActions = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Rent in Kathmandu',
      link: '/houses?location=Kathmandu'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Rent in Pokhara',
      link: '/houses?location=Pokhara'
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Verified Listings',
      link: '/houses?verified=true'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Budget under 25k',
      link: '/houses?max=25000'
    },
    {
      icon: <Bed className="w-5 h-5" />,
      label: 'Family (3+ beds)',
      link: '/houses?beds=3'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Long-stay friendly',
      link: '/houses?longstay=true'
    },
  ]

  // Hero background image
  const heroBackgroundImage = 'https://www.realtynepal.com/uploads/2023/06/viber_image_2023-06-25_17-37-19-205-750x750.jpg'

  // Check user role
  const isOwner = user?.accountType === 'owner'
  const isRenter = user?.accountType === 'renter' || !user

  return (
    <div className={`min-h-screen bg-neutral-950 ${compareProperties.length > 0 ? 'pb-24' : ''}`}>
      {/* Role-based Welcome Banner */}
      {isOwner && (
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 text-white py-4 px-4 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">
                Welcome back, {user?.name || 'Owner'}! Manage your properties and bookings.
              </span>
            </div>
            <Link
              to="/owner-dashboard"
              className="btn-outline !border-white/40 !text-white hover:!bg-white/20 hover:!border-white/60 flex items-center gap-2 shrink-0"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
      {/* 1. HERO Section - subtle dark gradient overlay */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBackgroundImage}
            alt="Nepal property background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-neutral-950" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight tracking-tight text-white">
              Find a place you&apos;ll love to call home
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
              Search verified rental properties across Nepal&apos;s most beautiful locations
            </p>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-neutral-700">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setPropertyType('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      propertyType === 'all'
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyType('houses')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      propertyType === 'houses'
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Houses
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyType('flats')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      propertyType === 'flats'
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Flats & Apartments
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by location"
                        value={searchLocation}
                        onChange={(e) => {
                          setSearchLocation(e.target.value)
                          if (e.target.value.trim()) setShowLocationError(false)
                        }}
                        onBlur={() => {
                          setLocationTouched(true)
                          if (!searchLocation.trim()) setShowLocationError(true)
                        }}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 text-base ${
                          showLocationError && locationTouched
                            ? 'border-red-400/50'
                            : 'border-white/20'
                        }`}
                      />
                    </div>
                    {showLocationError && locationTouched && !searchLocation.trim() && (
                      <p className="text-red-300 text-xs mt-2 ml-1">Enter a location</p>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 bg-white/10 backdrop-blur-sm text-white text-base appearance-none cursor-pointer"
                    >
                      <option value="all" className="bg-neutral-800">Any</option>
                      <option value="0-20000" className="bg-neutral-800">&lt;20k</option>
                      <option value="20000-30000" className="bg-neutral-800">20k–30k</option>
                      <option value="30000-" className="bg-neutral-800">30k+</option>
                    </select>
                  </div>
                  <div className="relative">
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 bg-white/10 backdrop-blur-sm text-white text-base appearance-none cursor-pointer"
                    >
                      <option value="all" className="bg-neutral-800">All Beds</option>
                      <option value="1" className="bg-neutral-800">1+ Bedroom</option>
                      <option value="2" className="bg-neutral-800">2+ Bedrooms</option>
                      <option value="3" className="bg-neutral-800">3+ Bedrooms</option>
                      <option value="4" className="bg-neutral-800">4+ Bedrooms</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-gradient px-8 py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Properties</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTIONS */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="card-glass-solid p-5 text-center group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-3 text-primary-400 group-hover:bg-primary-500/30 transition-colors duration-300">
                    {action.icon}
                  </div>
                  <span className="text-gray-200 font-medium text-sm">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LIVE RESULTS PREVIEW */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                {searchLocation.trim() ? 'Homes you might like' : 'Trending in Nepal'}
              </h2>
              <p className="text-gray-400 text-base">
                {searchLocation.trim()
                  ? `Found ${liveResults.length} properties matching your search`
                  : 'Most popular properties right now'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={decisionHelperMode}
                  onChange={(e) => setDecisionHelperMode(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                />
                <div className="flex items-center gap-2">
                  <Lightbulb className={`w-4 h-4 ${decisionHelperMode ? 'text-primary-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${decisionHelperMode ? 'text-primary-400' : 'text-gray-400'}`}>
                    Help me decide
                  </span>
                </div>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={decisionHelperMode}
                className="input-modern py-2.5 max-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {propertiesLoading ? (
            <Loader className="py-16" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {(searchLocation.trim() ? liveResults : trendingProperties).map((property) => (
                  <PropertyCardWithCompare
                    key={property.id}
                    property={property}
                    isSelected={compareProperties.some(p => p.id === property.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>

              {searchLocation.trim() && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams()
                      params.set('location', searchLocation.trim())
                      if (priceRange !== 'all') {
                        const [min, max] = priceRange.split('-')
                        if (min) params.set('min', min)
                        if (max) params.set('max', max)
                      }
                      if (bedrooms !== 'all') params.set('beds', bedrooms)
                      let route = '/houses'
                      if (propertyType === 'flats') route = '/flats-apartments'
                      navigate(`${route}?${params.toString()}`)
                    }}
                    className="btn-gradient"
                  >
                    <span>View all results</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 4. LIVING COST ESTIMATOR */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-glass-solid p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="w-6 h-6 text-primary-400" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                    Living Cost Estimator
                  </h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Estimate your monthly living expenses in major Nepali cities
                </p>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-modern py-2.5 max-w-[180px]"
                >
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Pokhara">Pokhara</option>
                  <option value="Chitwan">Chitwan</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Rent', value: livingCost.rent },
                { label: 'Food', value: livingCost.food },
                { label: 'Transport', value: livingCost.transport },
                { label: 'Utilities', value: livingCost.utilities },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-500 text-xs mb-1">{label}</div>
                  <div className="text-white font-bold text-lg">Rs. {value.toLocaleString()}</div>
                </div>
              ))}
              <div className="bg-primary-500/20 rounded-xl p-4 border border-primary-500/30 col-span-2 md:col-span-1">
                <div className="text-primary-400 text-xs mb-1">Total</div>
                <div className="text-white font-bold text-xl">Rs. {livingCost.total.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOCAL INSIGHTS */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Info className="w-6 h-6 text-primary-400" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Local Insights</h2>
            </div>
            <p className="text-gray-400 text-base">Know before you rent: City-specific tips for Nepal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Kathmandu', 'Lalitpur', 'Pokhara', 'Bhaktapur', 'Chitwan'].map((city) => {
              const insight = getCityInsights(city)
              return (
                <div key={city} className="card-glass-solid p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary-400" />
                    <h3 className="font-display text-xl font-bold text-white">{city}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{insight.tip}</p>
                  <div className="bg-primary-500/20 border border-primary-500/30 rounded-xl p-3">
                    <p className="text-primary-200 text-xs leading-relaxed">{insight.highlight}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. TRUST STATS */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {[
              { icon: <CheckCircle className="w-6 h-6 text-white" />, value: '500+', label: 'Verified Properties', bg: 'bg-emerald-500' },
              { icon: <HomeIcon className="w-6 h-6 text-white" />, value: '10,000+', label: 'Happy Renters', bg: 'bg-primary-500' },
              { icon: <Star className="w-6 h-6 text-white fill-white" />, value: '4.8★', label: 'Average Rating', bg: 'bg-amber-500' },
            ].map(({ icon, value, label, bg }) => (
              <div key={label} className="card-glass-solid p-8 text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 ${bg} rounded-2xl mb-4 shadow-xl`}>
                  {icon}
                </div>
                <div className="font-display text-3xl font-bold text-white mb-2">{value}</div>
                <div className="text-gray-400 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm max-w-2xl mx-auto">
            Every listing is manually reviewed by our team to ensure quality and accuracy.
          </p>
        </div>
      </section>

      {/* 7. TRUST & SAFETY */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Trust & Safety</h2>
            <p className="text-gray-400 text-base">Your peace of mind is our priority</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <CheckCircle className="w-6 h-6" />, title: 'Verified Properties', desc: 'Every listing is manually reviewed and verified', color: 'bg-emerald-500/20 text-emerald-400' },
              { icon: <DollarSign className="w-6 h-6" />, title: 'Transparent Pricing', desc: 'FairFlex pricing with no hidden fees', color: 'bg-primary-500/20 text-primary-400' },
              { icon: <Lock className="w-6 h-6" />, title: 'Secure Booking', desc: 'Safe and secure transactions every time', color: 'bg-violet-500/20 text-violet-400' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="card-glass-solid p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${color} rounded-xl mb-4`}>{icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. RECOMMENDED FOR YOU */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Recommended for you</h2>
            <p className="text-gray-400 text-base">Handpicked properties based on your search history</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalizedRecommendations.map((property) => (
              <PropertyCardWithCompare
                key={property.id}
                property={property}
                isSelected={compareProperties.some(p => p.id === property.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. POPULAR PROPERTIES */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Popular Properties</h2>
            <p className="text-gray-400 text-base">Handpicked properties just for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {popularProperties.map((property) => (
              <PropertyCardWithCompare
                key={property.id}
                property={property}
                isSelected={compareProperties.some(p => p.id === property.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
          <div className="text-center">
            <Link to="/houses" className="btn-gradient">
              <span>View all properties</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to find your next home?
          </h2>
          <p className="text-white/90 text-base mb-10 max-w-2xl mx-auto">
            Start your search today and connect with property owners who care about finding you the perfect place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/houses"
              className="inline-flex items-center bg-white text-gray-900 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <span>Browse all properties</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/houses"
              className="inline-flex items-center bg-white/10 border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span>Talk to property owners</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Compare Bar (Sticky) */}
      <CompareBar
        selectedProperties={compareProperties}
        onRemove={(id) => handleToggleCompare(id)}
        onCompare={handleCompare}
        onClose={handleClearCompare}
      />

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          properties={compareProperties}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  )
}

export default Home
