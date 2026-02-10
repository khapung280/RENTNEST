import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Home, Calendar, Clock, Building2, Loader2, Eye, Edit, Trash2 } from 'lucide-react'
import { propertyService } from '../services/aiService'
import { bookingService } from '../services/aiService'

// Owner Dashboard Page - Clean, professional dashboard for property owners
const OwnerDashboard = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load properties and bookings in parallel
      const [propertiesResponse, bookingsResponse] = await Promise.all([
        propertyService.getMyProperties(),
        bookingService.getOwnerBookings()
      ])

      if (propertiesResponse.success) {
        setProperties(propertiesResponse.data.data || [])
      }

      if (bookingsResponse.success) {
        const bookingsData = bookingsResponse.data.data || []
        setBookings(bookingsData)
        
        // Calculate stats
        setStats({
          totalProperties: propertiesResponse.data.data?.length || 0,
          activeBookings: bookingsData.filter(b => b.status === 'approved').length,
          pendingRequests: bookingsData.filter(b => b.status === 'pending').length
        })
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    try {
      const response = await propertyService.delete(propertyId)
      if (response.success) {
        loadData()
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert(error.response?.data?.message || 'Failed to delete property')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700'
      case 'pending':
        return 'bg-amber-50 text-amber-700'
      case 'rejected':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2.5 tracking-tight leading-tight">Owner Dashboard</h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Overview of your property listings and bookings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Properties Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Home className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2.5 tracking-tight">Total Properties</h3>
              <p className="text-4xl font-bold text-gray-900 leading-tight">{stats.totalProperties}</p>
            </div>

            {/* Active Bookings Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2.5 tracking-tight">Active Bookings</h3>
              <p className="text-4xl font-bold text-gray-900 leading-tight">{stats.activeBookings}</p>
            </div>

            {/* Pending Requests Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-amber-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2.5 tracking-tight">Pending Requests</h3>
              <p className="text-4xl font-bold text-gray-900 leading-tight">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-gray-200 mb-16"></div>

        {/* My Properties Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight leading-tight">My Properties</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Manage your property listings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                onClick={() => navigate('/owner-dashboard/add-property')}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm shadow-sm hover:shadow"
              >
                Add New Property
              </button>
              <button
                onClick={() => navigate('/owner-dashboard/bookings')}
                className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
              >
                View Booking Requests
              </button>
            </div>
          </div>
          
          {/* Properties List or Empty State */}
          {properties.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-6">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                You haven't added any properties yet.
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                Start by adding your first property to receive bookings.
              </p>
              <button
                onClick={() => navigate('/owner-dashboard/add-property')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Add Your First Property
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 md:-mx-8">
              <div className="inline-block min-w-full align-middle px-6 md:px-8">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Property</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {properties.map((property) => (
                      <tr key={property._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {property.image && (
                              <img
                                src={property.image}
                                alt={property.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-900 leading-normal block">{property.title}</span>
                              <span className="text-xs text-gray-500 capitalize">{property.type?.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600 leading-normal">{property.location}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">NPR {property.price?.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium leading-normal ${getStatusBadge(property.status)}`}>
                            {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/property/${property._id}`}
                              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Property"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(property._id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Property"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard

