import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { propertyService } from '../services/aiService'
import PropertyCardWithCompare from '../components/PropertyCardWithCompare'
import CompareBar from '../components/CompareBar'
import CompareModal from '../components/CompareModal'
import { Home, Search, MapPin, Filter, X, ChevronDown, Loader2 } from 'lucide-react'
import { calculateRentConfidence, getBestForLabel } from '../utils/propertyUtils'

// Helper function to get property tags (same as PropertyDetail)
function getPropertyTags(property) {
  const tags = []
  if (property.price <= 15000) tags.push('Best Value')
  if (property.bedrooms >= 3) tags.push('Family Home')
  if (property.price <= 18000 && property.bedrooms >= 2) tags.push('Long-Stay Friendly')
  if (property.verified === true) tags.push('Verified')
  return tags.slice(0, 2) // Max 2 tags
}

// House Page - Shows only houses (type === "house")
// Upgraded with filters, sorting, and compare functionality
const HousePage = () => {
  // Get search query from URL parameters
  const [searchParams, setSearchParams] = useSearchParams()
  const searchLocation = searchParams.get('location') || ''
  const minPrice = searchParams.get('min')
  const maxPrice = searchParams.get('max')
  const beds = searchParams.get('beds')
  const verified = searchParams.get('verified') === 'true'
  const sort = searchParams.get('sort') || 'recommended'

  // Local filter state (for UI)
  const [locationFilter, setLocationFilter] = useState(searchLocation)
  const [priceFilter, setPriceFilter] = useState(
    minPrice && maxPrice ? `${minPrice}-${maxPrice}` : 
    minPrice ? `${minPrice}+` : 
    maxPrice ? `-${maxPrice}` : 'all'
  )
  const [bedroomsFilter, setBedroomsFilter] = useState(beds || 'all')
  const [verifiedFilter, setVerifiedFilter] = useState(verified)
  const [sortBy, setSortBy] = useState(sort)
  const [showFilters, setShowFilters] = useState(false)

  // Compare state
  const [compareProperties, setCompareProperties] = useState([])
  const [showCompareModal, setShowCompareModal] = useState(false)

  // State for properties from API
  const [allProperties, setAllProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch properties from backend API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await propertyService.getAll({ type: 'house' })
        if (response.success && response.data) {
          setAllProperties(response.data)
        } else {
          setError('Failed to load properties')
        }
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError(err.response?.data?.message || 'Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Get all houses with advanced features
  const allHouses = useMemo(() => {
    return allProperties
      .filter((property) => property.type === 'house')
      .map(prop => ({
        ...prop,
        id: prop._id || prop.id, // Support both MongoDB _id and numeric id
        rating: prop.rating || 4.5,
        confidenceScore: calculateRentConfidence(prop),
        bestFor: getBestForLabel(prop),
        tags: getPropertyTags(prop),
      }))
  }, [allProperties])

  // Get unique locations
  const availableLocations = useMemo(() => {
    const locations = [...new Set(allHouses.map(h => h.location))].sort()
    return locations
  }, [allHouses])

  // Update filters function
  const updateFilters = () => {
    const params = new URLSearchParams()
    
    if (locationFilter.trim()) {
      params.set('location', locationFilter.trim())
    }
    
    if (priceFilter !== 'all') {
      if (priceFilter.includes('-')) {
        const [min, max] = priceFilter.split('-')
        if (min) params.set('min', min)
        if (max) params.set('max', max)
      } else if (priceFilter.endsWith('+')) {
        params.set('min', priceFilter.replace('+', ''))
      } else if (priceFilter.startsWith('-')) {
        params.set('max', priceFilter.replace('-', ''))
      }
    }
    
    if (bedroomsFilter !== 'all') {
      params.set('beds', bedroomsFilter)
    }
    
    if (verifiedFilter) {
      params.set('verified', 'true')
    }
    
    if (sortBy !== 'recommended') {
      params.set('sort', sortBy)
    }
    
    setSearchParams(params)
    setShowFilters(false)
  }

  // Reset filters
  const resetFilters = () => {
    setLocationFilter('')
    setPriceFilter('all')
    setBedroomsFilter('all')
    setVerifiedFilter(false)
    setSortBy('recommended')
    setSearchParams({})
    setShowFilters(false)
  }

  // Filtered houses
  const filteredHouses = useMemo(() => {
    let filtered = [...allHouses]

    // Filter by location
    if (searchLocation) {
      filtered = filtered.filter((property) =>
        property.location.toLowerCase().includes(searchLocation.toLowerCase())
      )
    }

    // Filter by price range
    if (minPrice) {
      const min = parseInt(minPrice)
      filtered = filtered.filter((property) => property.price >= min)
    }
    if (maxPrice) {
      const max = parseInt(maxPrice)
      filtered = filtered.filter((property) => property.price <= max)
    }

    // Filter by bedrooms
    if (beds) {
      const bedCount = parseInt(beds)
      filtered = filtered.filter((property) => property.bedrooms >= bedCount)
    }

    // Filter by verified
    if (verified) {
      filtered = filtered.filter((property) => property.verified === true)
    }

    return filtered
  }, [allHouses, searchLocation, minPrice, maxPrice, beds, verified])

  // Sorted houses
  const sortedHouses = useMemo(() => {
    const sorted = [...filteredHouses]
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price)
      case 'confidence':
        return sorted.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
      default: // recommended
        return sorted.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
    }
  }, [filteredHouses, sortBy])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchLocation) count++
    if (minPrice || maxPrice) count++
    if (beds) count++
    if (verified) count++
    return count
  }, [searchLocation, minPrice, maxPrice, beds, verified])

  // Compare handlers
  const handleToggleCompare = (propertyId) => {
    setCompareProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId)
      } else if (prev.length < 3) {
        return [...prev, propertyId]
      }
      return prev
    })
  }

  const handleCompare = () => {
    if (compareProperties.length >= 2) {
      setShowCompareModal(true)
    }
  }

  const handleClearCompare = () => {
    setCompareProperties([])
  }

  // Get properties for comparison
  const compareProps = useMemo(() => {
    return allHouses.filter(h => compareProperties.includes(h._id || h.id))
  }, [allHouses, compareProperties])

  // Hero background image - Realty Nepal property image
  const heroBackgroundImage = 'https://www.realtynepal.com/uploads/2024/01/409610771_395211956292705_8349237220876335740_n-750x750.jpg'

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium and Clean */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBackgroundImage}
            alt="Beautiful houses"
            className="w-full h-full object-cover"
          />
          {/* Clean overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/55 to-white"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-6">
              <Home className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
              Houses for Rent
            </h1>
            {searchLocation ? (
              <div className="flex items-center justify-center gap-2 text-base text-gray-700">
                <Search className="w-4 h-4 text-indigo-600" />
                <p>
                  Showing properties in <span className="font-medium text-gray-900">{searchLocation}</span>
                </p>
              </div>
            ) : (
              <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
                Explore available rental houses across Nepal
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="relative h-12 bg-gradient-to-b from-transparent to-white"></div>

      {/* Listings Section - Premium and Spacious */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header with Filters and Sort */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Results Count */}
            <div>
              {sortedHouses.length > 0 ? (
                <h2 className="text-2xl font-semibold text-gray-900">
                  {sortedHouses.length} {sortedHouses.length === 1 ? 'house' : 'houses'} found
                  {searchLocation && ` in ${searchLocation}`}
                </h2>
              ) : (
                <h2 className="text-2xl font-semibold text-gray-900">
                  No houses found
                  {searchLocation && ` in ${searchLocation}`}
                </h2>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    const params = new URLSearchParams(searchParams)
                    if (e.target.value !== 'recommended') {
                      params.set('sort', e.target.value)
                    } else {
                      params.delete('sort')
                    }
                    setSearchParams(params)
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="confidence">Rent Confidence</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">All Locations</option>
                      {availableLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">Any</option>
                      <option value="10000">Under 10k</option>
                      <option value="10000-20000">10k - 20k</option>
                      <option value="20000-30000">20k - 30k</option>
                      <option value="30000+">30k+</option>
                    </select>
                  </div>

                  {/* Bedrooms Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={bedroomsFilter}
                      onChange={(e) => setBedroomsFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Verified Filter */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-900">Verified only</span>
                    </label>
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    onClick={updateFilters}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
                <div className="bg-white w-full max-w-sm h-full overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Same filter content as desktop */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Location
                      </label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">All Locations</option>
                        {availableLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Price Range
                      </label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Any</option>
                        <option value="10000">Under 10k</option>
                        <option value="10000-20000">10k - 20k</option>
                        <option value="20000-30000">20k - 30k</option>
                        <option value="30000+">30k+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Bedrooms
                      </label>
                      <select
                        value={bedroomsFilter}
                        onChange={(e) => setBedroomsFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifiedFilter}
                          onChange={(e) => setVerifiedFilter(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-900">Verified only</span>
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={resetFilters}
                        className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50"
                      >
                        Reset
                      </button>
                      <button
                        onClick={updateFilters}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Properties Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-xl mb-4">
                    <Search className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading properties</h3>
                  <p className="text-gray-600 mb-6 text-sm">{error}</p>
                </div>
              ) : sortedHouses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedHouses.map((house) => (
                    <PropertyCardWithCompare
                      key={house._id || house.id}
                      property={house}
                      isSelected={compareProperties.includes(house._id || house.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-4">
                    <Search className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No houses found</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compare Bar */}
      {compareProperties.length > 0 && (
        <CompareBar
          selectedProperties={compareProps}
          onRemove={handleToggleCompare}
          onCompare={handleCompare}
          onClose={handleClearCompare}
        />
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          properties={compareProps}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  )
}

export default HousePage
