import { Bed, Bath, Square, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

// Premium property card component
// Displays property information with clean, professional design
const PropertyCard = ({ property }) => {
  return (
    <Link
      to={`/property/${property.id}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Property Image */}
      <div className="relative h-60 overflow-hidden bg-gray-100">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        
        {/* Price Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                Rs. {property.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 font-medium">/month</span>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-900">4.8</span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-5">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-sm font-medium">{property.location}</p>
        </div>

        {/* Property Features */}
        <div className="flex items-center gap-5 mb-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Bed className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Bath className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Square className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{property.areaSqft} sqft</span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="w-full bg-gray-900 group-hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors text-center text-sm">
          View Details
        </div>
      </div>
    </Link>
  )
}

export default PropertyCard
