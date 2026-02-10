import { useState } from 'react'
import { Bed, Bath, Square, MapPin, Star, Check, Info, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateRentConfidence, getBestForLabel, calculateFairFlexSavings } from '../utils/propertyUtils'

// Property Card with Compare Feature
// Used on Home page to allow users to select properties for comparison
const PropertyCardWithCompare = ({ property, isSelected, onToggleCompare }) => {
  const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false)
  
  const handleCompareClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleCompare(property._id || property.id)
  }
  
  const confidenceScore = calculateRentConfidence(property)
  const bestFor = getBestForLabel(property)
  const savings = calculateFairFlexSavings(property)
  
  const getConfidenceColor = (score) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-orange-600'
  }
  
  const getBestForColor = (label) => {
    const colors = {
      'Family': 'bg-blue-600',
      'Students': 'bg-purple-600',
      'Professionals': 'bg-indigo-600',
      'Quiet Living': 'bg-teal-600'
    }
    return colors[label] || 'bg-gray-600'
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all border border-gray-800 group relative">
      {/* Compare Checkbox */}
      <button
        onClick={handleCompareClick}
        className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-indigo-600 text-white'
            : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
        }`}
        title={isSelected ? 'Remove from compare' : 'Add to compare'}
      >
        <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      <Link to={`/property/${property._id || property.id}`} className="block">
        {/* Property Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-indigo-600 font-bold text-sm">
              Rs. {property.price.toLocaleString()}/mo
            </span>
          </div>
          
          {/* Rent Confidence Score Badge */}
          <div className="absolute top-3 left-14 relative z-10">
            <button
              onMouseEnter={() => setShowConfidenceTooltip(true)}
              onMouseLeave={() => setShowConfidenceTooltip(false)}
              className={`${getConfidenceColor(confidenceScore)} text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg backdrop-blur-sm`}
            >
              <span className="font-bold text-xs">{confidenceScore}</span>
              <Info className="w-3 h-3" />
            </button>
            {showConfidenceTooltip && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 border border-gray-700">
                <div className="font-semibold mb-2">Rent Confidence Score</div>
                <div className="space-y-1 text-gray-300">
                  <div>• Verified listing: {property.verified ? 'Yes (+30)' : 'No'}</div>
                  <div>• Price fairness: {property.price / property.areaSqft <= 12 ? 'Good value' : 'Standard'}</div>
                  <div>• FairFlex: {savings.hasFairFlex ? 'Available (+20)' : 'Not available'}</div>
                  <div>• Amenities: Based on size & features</div>
                </div>
              </div>
            )}
          </div>
          
          {property.rating && (
            <div className="absolute top-14 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg z-10">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-900 font-bold text-xs">
                {property.rating.toFixed(1)}
              </span>
            </div>
          )}
          
          {/* Best For Badge */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-10">
            {property.tags && property.tags.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                {property.tags[0]}
              </span>
            )}
            <span className={`${getBestForColor(bestFor)} text-white text-xs font-semibold px-2.5 py-1 rounded-md`}>
              Best for {bestFor}
            </span>
          </div>
          
          {/* FairFlex Savings Badge - Only show if there's space and no overlap */}
          {savings.hasFairFlex && (
            <div className="absolute bottom-3 right-3 bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg z-10 max-w-[140px]">
              <div className="flex items-center gap-1 text-white">
                <TrendingDown className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-semibold truncate">
                  Save {savings.monthlySavings6}/mo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 mb-4 text-sm">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>{property.location}</span>
          </div>

          <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Bed className="w-4 h-4 text-indigo-400" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Bath className="w-4 h-4 text-purple-400" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Square className="w-4 h-4 text-pink-400" />
              <span>{property.areaSqft} sqft</span>
            </div>
          </div>
          
          {/* FairFlex Savings Preview */}
          {savings.hasFairFlex && (
            <div className="mb-3 p-2 bg-green-600/10 border border-green-600/30 rounded-lg">
              <div className="text-xs text-green-400 font-medium mb-1">FairFlex Savings</div>
              <div className="text-xs text-gray-300">
                3 months: Save Rs. {savings.savings3Months.toLocaleString()} • 
                6 months: Save Rs. {savings.savings6Months.toLocaleString()}
              </div>
            </div>
          )}

          <div className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-center text-sm">
            View Details
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PropertyCardWithCompare

