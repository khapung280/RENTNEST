import { X } from 'lucide-react'
import { Bed, Bath, Square, MapPin } from 'lucide-react'
import { getComparisonExplanation } from '../utils/propertyUtils'

// Compare Modal Component
// Displays a side-by-side comparison of selected properties (up to 3)
const CompareModal = ({ properties, onClose }) => {
  if (!properties || properties.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Compare Properties</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Property Cards */}
            {properties.map((property, index) => (
              <div key={property.id} className="flex flex-col">
                {/* Property Image */}
                <div className="relative h-48 rounded-lg overflow-hidden mb-4 border border-gray-800">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Property Title */}
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-2">
                  {property.title}
                </h3>

                {/* Comparison Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-indigo-400 font-semibold">Price:</span>
                    <span className="text-white font-bold">
                      Rs. {property.price.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Bed className="w-4 h-4 text-indigo-400" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Bath className="w-4 h-4 text-purple-400" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Square className="w-4 h-4 text-pink-400" />
                    <span>{property.areaSqft} sqft</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span>{property.location}</span>
                  </div>
                  
                  {/* Explanation */}
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="text-yellow-400 text-xs font-semibold mb-1">Why this property?</div>
                    <div className="text-gray-400 text-xs leading-relaxed">
                      {getComparisonExplanation(property, properties)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty slots if less than 3 properties */}
            {properties.length < 3 &&
              Array.from({ length: 3 - properties.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg min-h-[400px]"
                >
                  <span className="text-gray-500 text-sm">No property</span>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompareModal

