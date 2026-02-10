import { useState, useMemo } from 'react'
import { Search, Filter, X, Home, CheckCircle, XCircle, MapPin, User, Building2 } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'

// Admin Properties Page - Enhanced property management interface
const AdminProperties = () => {
  // Dummy property data
  const [allProperties] = useState([
    { id: 1, propertyName: 'Thamel Luxury Apartment', ownerName: 'Rajesh Shrestha', location: 'Kathmandu', status: 'Approved' },
    { id: 2, propertyName: 'Lalitpur Family House', ownerName: 'Sita Maharjan', location: 'Lalitpur', status: 'Approved' },
    { id: 3, propertyName: 'Pokhara Lake View Villa', ownerName: 'Bikash Gurung', location: 'Pokhara', status: 'Pending' },
    { id: 4, propertyName: 'Baneshwor Modern Flat', ownerName: 'Anita Tamang', location: 'Kathmandu', status: 'Approved' },
    { id: 5, propertyName: 'Bhaktapur Heritage Home', ownerName: 'Krishna Basnet', location: 'Bhaktapur', status: 'Pending' },
    { id: 6, propertyName: 'Patan Studio Apartment', ownerName: 'Mina Thapa', location: 'Lalitpur', status: 'Approved' },
    { id: 7, propertyName: 'Chabahil Family House', ownerName: 'Prakash Sharma', location: 'Kathmandu', status: 'Approved' },
    { id: 8, propertyName: 'Koteshwor 3BHK Flat', ownerName: 'Sunita Poudel', location: 'Kathmandu', status: 'Approved' },
    { id: 9, propertyName: 'Boudha Traditional Home', ownerName: 'Ramesh Karki', location: 'Kathmandu', status: 'Pending' },
    { id: 10, propertyName: 'Jawalakhel Apartment', ownerName: 'Saraswati Adhikari', location: 'Lalitpur', status: 'Approved' },
    { id: 11, propertyName: 'Budhanilkantha Villa', ownerName: 'Rajesh Shrestha', location: 'Kathmandu', status: 'Approved' },
    { id: 12, propertyName: 'Imadol Residential House', ownerName: 'Sita Maharjan', location: 'Lalitpur', status: 'Pending' }
  ])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [properties, setProperties] = useState(allProperties)

  // Get unique locations
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(allProperties.map(p => p.location))]
    return uniqueLocations.sort()
  }, [allProperties])

  // Filter properties
  const filteredProperties = useMemo(() => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        property =>
          property.propertyName.toLowerCase().includes(query) ||
          property.ownerName.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter)
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(property => property.location === locationFilter)
    }

    return filtered
  }, [properties, searchQuery, statusFilter, locationFilter])

  // Handle approve/reject
  const handleApprove = (propertyId) => {
    setProperties(prevProperties =>
      prevProperties.map(property =>
        property.id === propertyId
          ? { ...property, status: 'Approved' }
          : property
      )
    )
  }

  const handleReject = (propertyId) => {
    setProperties(prevProperties =>
      prevProperties.map(property =>
        property.id === propertyId
          ? { ...property, status: 'Rejected' }
          : property
      )
    )
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setLocationFilter('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || statusFilter !== 'all' || locationFilter !== 'all'

  // Count stats
  const stats = useMemo(() => {
    return {
      total: properties.length,
      approved: properties.filter(p => p.status === 'Approved').length,
      pending: properties.filter(p => p.status === 'Pending').length,
      rejected: properties.filter(p => p.status === 'Rejected').length,
    }
  }, [properties])

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-300 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight leading-tight">Property Management</h1>
            <p className="text-sm font-semibold text-gray-700 leading-relaxed">
              Review and monitor listed properties
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Total</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Approved</p>
                  <p className="text-xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Rejected</p>
                  <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Table Section */}
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md">
            {/* Filters and Search */}
            <div className="p-6 border-b-2 border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by property name, owner, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="lg:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 appearance-none bg-white cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="lg:w-48">
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{properties.length}</span> properties
                {hasActiveFilters && (
                  <span className="ml-2 text-indigo-600">
                    (filtered)
                  </span>
                )}
              </div>
            </div>

            {/* Properties Table */}
            <div className="overflow-x-auto">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {hasActiveFilters
                      ? 'Try adjusting your search or filters'
                      : 'No properties in the system'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Property</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Owner</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Location</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Home className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{property.propertyName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            {property.ownerName}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {property.location}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              property.status === 'Approved'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : property.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {property.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {property.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(property.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors border border-green-200"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(property.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {property.status === 'Approved' && (
                              <span className="text-xs text-gray-500 italic">Approved</span>
                            )}
                            {property.status === 'Rejected' && (
                              <span className="text-xs text-gray-500 italic">Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminProperties
