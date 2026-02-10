import PropertyCard from './PropertyCard'
import { Home, Search } from 'lucide-react'

// Simple grid component to display property cards
// Takes an array of properties and displays them in a responsive grid
const PropertyGrid = ({ properties }) => {
  // If no properties found, show empty state
  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-4">
          <Search className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600 mb-6 text-sm">Try adjusting your search criteria</p>
        <a
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          Back to Home
        </a>
      </div>
    )
  }

  // Display properties in a responsive grid layout
  // Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}

export default PropertyGrid
