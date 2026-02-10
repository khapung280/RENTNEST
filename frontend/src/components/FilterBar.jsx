// Simple filter bar component
// Allows users to filter properties by location, price, and bedrooms
const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Properties</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={onFilterChange}
            placeholder="Search location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Min Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price ($)
          </label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={onFilterChange}
            placeholder="Min"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price ($)
          </label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={onFilterChange}
            placeholder="Max"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={onFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="0">Studio (0)</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar

