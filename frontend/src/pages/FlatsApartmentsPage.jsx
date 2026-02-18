import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { propertyService } from '../services/aiService'
import PropertyCardWithCompare from '../components/PropertyCardWithCompare'
import CompareBar from '../components/CompareBar'
import CompareModal from '../components/CompareModal'
import { Building2, Search, MapPin, Filter, X, ChevronDown, Loader2 } from 'lucide-react'
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

// Flats & Apartments Page - Shows only flats/apartments (type === "flat_apartment")
// Upgraded with filters, sorting, and compare functionality
const FlatsApartmentsPage = () => {
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
        const response = await propertyService.getAll({ type: 'flat_apartment' })
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

  // Get all flats/apartments with advanced features
  const allFlatsApartments = useMemo(() => {
    return allProperties
      .filter((property) => property.type === 'flat_apartment')
      .map(prop => ({
        ...prop,
        id: prop._id || prop.id,
        rating: prop.rating || 4.5,
        confidenceScore: calculateRentConfidence(prop),
        bestFor: getBestForLabel(prop),
        tags: getPropertyTags(prop),
      }))
  }, [allProperties])

  // Get unique locations
  const availableLocations = useMemo(() => {
    const locations = [...new Set(allFlatsApartments.map(f => f.location))].sort()
    return locations
  }, [allFlatsApartments])

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

  // Filtered flats/apartments
  const filteredFlatsApartments = useMemo(() => {
    let filtered = [...allFlatsApartments]

    // Filter by location (exact match, case-insensitive)
    const cleanedLocation = (searchLocation || '').trim()
    if (cleanedLocation) {
      const locLower = cleanedLocation.toLowerCase()
      filtered = filtered.filter((property) => property.location.toLowerCase() === locLower)
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
  }, [allFlatsApartments, searchLocation, minPrice, maxPrice, beds, verified])

  // Sorted flats/apartments
  const sortedFlatsApartments = useMemo(() => {
    const sorted = [...filteredFlatsApartments]
    
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
  }, [filteredFlatsApartments, sortBy])

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
    return allFlatsApartments.filter(f => compareProperties.includes(f._id || f.id))
  }, [allFlatsApartments, compareProperties])

  // Hero background image - flats/apartments (visible with dark overlay)
  const heroBackgroundImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80'

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Hero Section - same background colour as House page, image visible */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        {/* Background Image - visible */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/75 via-neutral-950/85 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.25),transparent)]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/20 border border-violet-500/30 rounded-2xl mb-6">
              <Building2 className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Flats & Apartments for Rent
            </h1>
            {searchLocation ? (
              <div className="flex items-center justify-center gap-2 text-base text-gray-300">
                <Search className="w-4 h-4 text-violet-400" />
                <p>
                  Showing properties in <span className="font-medium text-white">{searchLocation}</span>
                </p>
              </div>
            ) : (
              <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                Explore available rental flats and apartments across Nepal
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="relative h-8 bg-gradient-to-b from-transparent to-neutral-950" />

      {/* Listings Section - same dark theme as House page */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header with Filters and Sort */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Results Count */}
            <div>
              {sortedFlatsApartments.length > 0 ? (
                <h2 className="text-2xl font-semibold text-white">
                  {sortedFlatsApartments.length} {sortedFlatsApartments.length === 1 ? 'property' : 'properties'} found
                  {searchLocation && <span className="text-gray-400 font-normal"> in {searchLocation}</span>}
                </h2>
              ) : (
                <h2 className="text-2xl font-semibold text-white">
                  No properties found
                  {searchLocation && <span className="text-gray-400 font-normal"> in {searchLocation}</span>}
                </h2>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-neutral-700 rounded-xl bg-neutral-900 text-gray-300 hover:bg-neutral-800"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
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
                  className="appearance-none bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-gray-200 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="confidence">Rent Confidence</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-neutral-800 text-gray-200 focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">All Locations</option>
                      {availableLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-neutral-800 text-gray-200 focus:ring-2 focus:ring-violet-500"
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
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={bedroomsFilter}
                      onChange={(e) => setBedroomsFilter(e.target.value)}
                      className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-neutral-800 text-gray-200 focus:ring-2 focus:ring-violet-500"
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
                        className="w-4 h-4 text-violet-600 border-neutral-600 rounded bg-neutral-800 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-gray-300">Verified only</span>
                    </label>
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    onClick={updateFilters}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/60 z-50 flex items-start justify-end">
                <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-sm h-full overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-neutral-800 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Same filter content as desktop */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Location
                      </label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-neutral-800 text-gray-200"
                      >
                        <option value="">All Locations</option>
                        {availableLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Price Range
                      </label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-neutral-800 text-gray-200"
                      >
                        <option value="all">Any</option>
                        <option value="10000">Under 10k</option>
                        <option value="10000-20000">10k - 20k</option>
                        <option value="20000-30000">20k - 30k</option>
                        <option value="30000+">30k+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Bedrooms
                      </label>
                      <select
                        value={bedroomsFilter}
                        onChange={(e) => setBedroomsFilter(e.target.value)}
                        className="w-full border border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-neutral-800 text-gray-200"
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
                          className="w-4 h-4 text-violet-600 border-neutral-600 rounded bg-neutral-800 focus:ring-violet-500"
                        />
                        <span className="text-sm font-medium text-gray-300">Verified only</span>
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={resetFilters}
                        className="flex-1 border border-neutral-700 text-gray-300 font-medium py-2.5 rounded-xl hover:bg-neutral-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={updateFilters}
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-xl"
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
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
                  <p className="text-gray-400">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-xl mb-4 border border-red-500/30">
                    <Search className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Error loading properties</h3>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              ) : sortedFlatsApartments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedFlatsApartments.map((property) => (
                    <PropertyCardWithCompare
                      key={property._id || property.id}
                      property={property}
                      isSelected={compareProperties.includes(property._id || property.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-xl mb-4 border border-neutral-700">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No properties found</h3>
                  <p className="text-gray-400 mb-6 text-sm">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
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

export default FlatsApartmentsPage
