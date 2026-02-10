import { X, GitCompare } from 'lucide-react'

// Compare Bar Component
// Sticky bar at bottom showing selected properties for comparison
const CompareBar = ({ selectedProperties, onRemove, onCompare, onClose }) => {
  if (selectedProperties.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl z-40 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 text-white font-medium">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <span className="hidden sm:inline">Comparing ({selectedProperties.length}/3):</span>
            <span className="sm:hidden">({selectedProperties.length}/3)</span>
          </div>
          {selectedProperties.map((property) => (
            <div
              key={property.id}
              className="flex items-center gap-2 bg-gray-800 rounded-lg p-2 border border-gray-700 flex-shrink-0"
            >
              <img
                src={property.image}
                alt={property.title}
                className="w-10 h-10 rounded object-cover"
              />
              <span className="text-white text-sm font-medium max-w-[120px] truncate">
                {property.title}
              </span>
              <button
                onClick={() => onRemove(property.id)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onCompare}
            disabled={selectedProperties.length < 2}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompareBar

