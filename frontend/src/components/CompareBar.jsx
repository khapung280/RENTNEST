import { X, GitCompare } from 'lucide-react'

// Compare Bar Component
// Sticky bar at bottom showing selected properties for comparison
const CompareBar = ({ selectedProperties, onRemove, onCompare, onClose }) => {
  if (selectedProperties.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-surface-200 shadow-soft-xl z-40 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 text-surface-700 font-medium">
            <GitCompare className="w-5 h-5 text-primary-500" />
            <span className="hidden sm:inline">Comparing ({selectedProperties.length}/3):</span>
            <span className="sm:hidden">({selectedProperties.length}/3)</span>
          </div>
          {selectedProperties.map((property) => (
            <div
              key={property.id}
              className="flex items-center gap-2 bg-surface-100 rounded-xl p-2 border border-surface-200 flex-shrink-0"
            >
              <img
                src={property.image}
                alt={property.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-surface-800 text-sm font-medium max-w-[120px] truncate">
                {property.title}
              </span>
              <button
                onClick={() => onRemove(property.id)}
                className="text-surface-500 hover:text-surface-900 transition-colors p-1 rounded-lg hover:bg-surface-200"
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
            className="btn-gradient disabled:!bg-surface-300 disabled:!from-surface-300 disabled:!to-surface-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare</span>
          </button>
          <button
            onClick={onClose}
            className="btn-outline py-2.5"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompareBar

