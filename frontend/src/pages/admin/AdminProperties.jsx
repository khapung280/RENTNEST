import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, Home, CheckCircle, XCircle, MapPin, User, Building2, Loader2 } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { adminService } from '../../services/aiService'

const statusDisplay = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

const AdminProperties = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminService.getAllProperties({ limit: 100 })
      if (res.success && Array.isArray(res.data)) setProperties(res.data)
      else setProperties([])
    } catch (err) {
      console.error('Fetch admin properties error:', err)
      setError(err.response?.data?.message || 'Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const locations = useMemo(() => {
    const unique = [...new Set(properties.map(p => (p.location || '').trim()).filter(Boolean))]
    return unique.sort()
  }, [properties])

  const filteredProperties = useMemo(() => {
    let filtered = [...properties]
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.owner?.name || p.ownerName || '').toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => (p.status || '').toLowerCase() === statusFilter.toLowerCase())
    }
    if (locationFilter !== 'all') {
      filtered = filtered.filter(p => (p.location || '').trim() === locationFilter)
    }
    return filtered
  }, [properties, searchQuery, statusFilter, locationFilter])

  const handleApprove = async (id) => {
    try {
      setActionLoading(id)
      const res = await adminService.approveProperty(id)
      if (res.success) await fetchProperties()
      else setError(res.message || 'Approve failed')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    try {
      setActionLoading(id)
      const res = await adminService.rejectProperty(id)
      if (res.success) await fetchProperties()
      else setError(res.message || 'Reject failed')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setLocationFilter('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || statusFilter !== 'all' || locationFilter !== 'all'

  const stats = useMemo(() => {
    const s = (status) => (p) => (p.status || '').toLowerCase() === status
    return {
      total: properties.length,
      approved: properties.filter(s('approved')).length,
      pending: properties.filter(s('pending')).length,
      rejected: properties.filter(s('rejected')).length,
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
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-sm font-medium">Dismiss</button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          ) : (
          <>
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
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
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
                    {filteredProperties.map((property) => {
                      const status = (property.status || '').toLowerCase()
                      const isPending = status === 'pending'
                      const id = property._id || property.id
                      const ownerName = property.owner?.name || property.ownerName || '—'
                      return (
                      <tr key={id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {property.image ? (
                              <img src={property.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                            ) : (
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-indigo-600" />
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-900">{property.title || 'Untitled'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            {ownerName}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {property.location || '—'}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              status === 'approved'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {statusDisplay(property.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(id)}
                                  disabled={actionLoading === id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors border border-green-200 disabled:opacity-50"
                                >
                                  {actionLoading === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(id)}
                                  disabled={actionLoading === id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-200 disabled:opacity-50"
                                >
                                  {actionLoading === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                  Reject
                                </button>
                              </>
                            )}
                            {status === 'approved' && <span className="text-xs text-gray-500 italic">Approved</span>}
                            {status === 'rejected' && <span className="text-xs text-gray-500 italic">Rejected</span>}
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminProperties
