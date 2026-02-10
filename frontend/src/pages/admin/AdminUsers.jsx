import { useState, useMemo } from 'react'
import { Search, Filter, X, Shield, UserCheck, UserX, Users, Mail, User } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'

// Admin Users Page - Enhanced user management interface
const AdminUsers = () => {
  // Dummy user data
  const [allUsers] = useState([
    { id: 1, name: 'Rajesh Shrestha', email: 'rajesh.shrestha@example.com', role: 'Owner', status: 'Active' },
    { id: 2, name: 'Sita Maharjan', email: 'sita.maharjan@example.com', role: 'Owner', status: 'Active' },
    { id: 3, name: 'Bikash Gurung', email: 'bikash.gurung@example.com', role: 'Renter', status: 'Active' },
    { id: 4, name: 'Anita Tamang', email: 'anita.tamang@example.com', role: 'Owner', status: 'Active' },
    { id: 5, name: 'Krishna Basnet', email: 'krishna.basnet@example.com', role: 'Renter', status: 'Suspended' },
    { id: 6, name: 'Mina Thapa', email: 'mina.thapa@example.com', role: 'Owner', status: 'Active' },
    { id: 7, name: 'Prakash Sharma', email: 'prakash.sharma@example.com', role: 'Renter', status: 'Active' },
    { id: 8, name: 'Sunita Poudel', email: 'sunita.poudel@example.com', role: 'Owner', status: 'Active' },
    { id: 9, name: 'Ramesh Karki', email: 'ramesh.karki@example.com', role: 'Renter', status: 'Suspended' },
    { id: 10, name: 'Saraswati Adhikari', email: 'saraswati.adhikari@example.com', role: 'Owner', status: 'Active' }
  ])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [users, setUsers] = useState(allUsers)

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = [...users]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    return filtered
  }, [users, searchQuery, roleFilter, statusFilter])

  // Handle suspend/activate
  const handleToggleStatus = (userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' }
          : user
      )
    )
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || roleFilter !== 'all' || statusFilter !== 'all'

  // Count stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'Active').length,
      suspended: users.filter(u => u.status === 'Suspended').length,
      owners: users.filter(u => u.role === 'Owner').length,
      renters: users.filter(u => u.role === 'Renter').length,
    }
  }, [users])

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-300 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight leading-tight">User Management</h1>
            <p className="text-sm font-semibold text-gray-700 leading-relaxed">
              Manage platform users and roles
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
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
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Active</p>
                  <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Suspended</p>
                  <p className="text-xl font-bold text-gray-900">{stats.suspended}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Owners</p>
                  <p className="text-xl font-bold text-gray-900">{stats.owners}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Renters</p>
                  <p className="text-xl font-bold text-gray-900">{stats.renters}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table Section */}
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
                      placeholder="Search by name or email..."
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

                {/* Role Filter */}
                <div className="lg:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 appearance-none bg-white cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="Owner">Owner</option>
                      <option value="Renter">Renter</option>
                    </select>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="lg:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
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
                Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{users.length}</span> users
                {hasActiveFilters && (
                  <span className="ml-2 text-indigo-600">
                    (filtered)
                  </span>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {hasActiveFilters
                      ? 'Try adjusting your search or filters'
                      : 'No users in the system'}
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
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">User</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Email</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Role</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-indigo-600">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              user.role === 'Owner'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              user.status === 'Active'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              user.status === 'Active'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            {user.status === 'Active' ? (
                              <>
                                <UserX className="w-4 h-4" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4" />
                                Activate
                              </>
                            )}
                          </button>
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

export default AdminUsers
