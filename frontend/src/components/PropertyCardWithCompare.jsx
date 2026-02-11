import { useState } from 'react'
import { Bed, Bath, Square, MapPin, Star, Check, Info, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { calculateRentConfidence, getBestForLabel, calculateFairFlexSavings } from '../utils/propertyUtils'

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
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-orange-500'
  }

  const getBestForColor = (label) => {
    const colors = {
      'Family': 'bg-blue-500',
      'Students': 'bg-violet-500',
      'Professionals': 'bg-primary-500',
      'Quiet Living': 'bg-teal-500'
    }
    return colors[label] || 'bg-surface-500'
  }

  return (
    <div className="card-glass-solid overflow-hidden group relative hover:-translate-y-1">
      <button
        onClick={handleCompareClick}
        className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-soft ${
          isSelected
            ? 'bg-primary-500 text-white'
            : 'bg-white/90 backdrop-blur-sm text-surface-600 hover:bg-white border border-surface-200'
        }`}
        title={isSelected ? 'Remove from compare' : 'Add to compare'}
      >
        <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      <Link to={`/property/${property._id || property.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-soft">
            <span className="text-primary-600 font-bold text-sm">
              Rs. {property.price.toLocaleString()}/mo
            </span>
          </div>

          <div className="absolute top-3 left-14 z-10">
            <button
              onMouseEnter={() => setShowConfidenceTooltip(true)}
              onMouseLeave={() => setShowConfidenceTooltip(false)}
              className={`${getConfidenceColor(confidenceScore)} text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-soft text-xs font-semibold`}
            >
              {confidenceScore}
              <Info className="w-3 h-3" />
            </button>
            {showConfidenceTooltip && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-surface-800 text-white text-xs p-3 rounded-xl shadow-soft-xl z-30 border border-surface-700">
                <div className="font-semibold mb-2">Rent Confidence Score</div>
                <div className="space-y-1 text-surface-300">
                  <div>• Verified: {property.verified ? 'Yes (+30)' : 'No'}</div>
                  <div>• Price fairness: {property.price / property.areaSqft <= 12 ? 'Good value' : 'Standard'}</div>
                  <div>• FairFlex: {savings.hasFairFlex ? 'Available (+20)' : 'Not available'}</div>
                  <div>• Amenities: Based on size & features</div>
                </div>
              </div>
            )}
          </div>

          {property.rating && (
            <div className="absolute top-14 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-soft z-10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-surface-900 font-bold text-xs">{property.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-10">
            {property.tags && property.tags.length > 0 && (
              <span className="badge-accent">{property.tags[0]}</span>
            )}
            <span className={`${getBestForColor(bestFor)} text-white text-xs font-semibold px-2.5 py-1 rounded-lg`}>
              Best for {bestFor}
            </span>
          </div>

          {savings.hasFairFlex && (
            <div className="absolute bottom-3 right-3 bg-emerald-500/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-soft z-10 max-w-[140px]">
              <div className="flex items-center gap-1 text-white text-xs font-semibold">
                <TrendingDown className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Save {savings.monthlySavings6}/mo</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-display text-lg font-bold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-surface-500 mb-4 text-sm">
            <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span>{property.location}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-surface-100">
            <div className="flex items-center gap-1.5 text-surface-500 text-xs">
              <Bed className="w-4 h-4 text-primary-400" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-surface-500 text-xs">
              <Bath className="w-4 h-4 text-violet-400" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-surface-500 text-xs">
              <Square className="w-4 h-4 text-pink-400" />
              <span>{property.areaSqft} sqft</span>
            </div>
          </div>

          {savings.hasFairFlex && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-xs text-emerald-700 font-medium mb-1">FairFlex Savings</div>
              <div className="text-xs text-surface-600">
                3 mo: Rs. {savings.savings3Months.toLocaleString()} • 6 mo: Rs. {savings.savings6Months.toLocaleString()}
              </div>
            </div>
          )}

          <div className="block w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-3 rounded-xl text-center text-sm shadow-soft hover:shadow-soft-lg transition-all duration-300">
            View Details
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PropertyCardWithCompare
