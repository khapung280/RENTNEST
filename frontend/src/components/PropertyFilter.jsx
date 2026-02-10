import { useState } from 'react'
import { Filter, X, SlidersHorizontal } from 'lucide-react'

const PropertyFilter = ({ onFilterChange, filters }) => {
  const [isOpen, setIsOpen] = useState(false)

  const propertyTypes = ['All', 'House', 'Flat', 'Apartment', 'Villa', 'Studio']
  const locations = ['All', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan']
  const bedrooms = ['All', '1', '2', '3', '4', '5+']
  const bathrooms = ['All', '1', '2', '3', '4+']

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    const clearedFilters = {
      type: 'All',
      location: 'All',
      minPrice: '',
      maxPrice: '',
      bedrooms: 'All',
      bathrooms: 'All',
    }
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = 
    filters.type !== 'All' ||
    filters.location !== 'All' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.bedrooms !== 'All' ||
    filters.bathrooms !== 'All'

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Filter Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Filter Properties</h3>
            <p className="text-sm text-gray-500">
              {hasActiveFilters ? 'Filters applied' : 'Refine your search'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearFilters()
              }}
              className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
          <Filter className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Filter Content - Expandable */}
      {isOpen && (
        <div className="border-t border-gray-200 p-6 space-y-6">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Property Type
            </label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleChange('type', type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filters.type === type
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Location
            </label>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleChange('location', location)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filters.location === location
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Price Range (Rs.)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms & Bathrooms Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bedrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {bedrooms.map((bed) => (
                  <button
                    key={bed}
                    onClick={() => handleChange('bedrooms', bed)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.bedrooms === bed
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {bed}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bathrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {bathrooms.map((bath) => (
                  <button
                    key={bath}
                    onClick={() => handleChange('bathrooms', bath)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filters.bathrooms === bath
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {bath}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Count */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {Object.values(filters).filter(v => v !== 'All' && v !== '').length} filter(s) applied
                </span>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PropertyFilter

