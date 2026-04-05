import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, X, Shield, UserCheck, UserX, Users, Mail, User, Loader2 } from 'lucide-react'
import AdminShell from '../../components/AdminShell'
import { adminService } from '../../services/aiService'

function userStatusLabel(u) {
  if (u.isSuspended) return 'Suspended'
  if (u.isActive === false) return 'Inactive'
  return 'Active'
}

function roleLabel(role) {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('search') || '')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 15

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState(null)

  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    owners: 0,
    renters: 0
  })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const q = debouncedSearch
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (q) next.set('search', q)
        else next.delete('search')
        return next
      },
      { replace: true }
    )
  }, [debouncedSearch, setSearchParams])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  const loadSummary = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await adminService.getStats()
      if (res.success && res.data?.users) {
        const u = res.data.users
        setSummary({
          total: u.total ?? 0,
          active: u.active ?? 0,
          suspended: u.suspended ?? 0,
          owners: u.owners ?? 0,
          renters: u.renters ?? 0
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (debouncedSearch) params.search = debouncedSearch
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const res = await adminService.getUsers(params)
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data)
        setTotal(res.total ?? res.data.length)
        setPages(Math.max(1, res.pages ?? 1))
      } else {
        setUsers([])
        setTotal(0)
        setPages(1)
      }
    } catch (e) {
      console.error(e)
      setError(e.response?.data?.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleToggleStatus = async (userRow) => {
    const id = userRow._id || userRow.id
    if (!id || userRow.role === 'admin') {
      window.alert('Cannot change status for this account from the directory.')
      return
    }
    const suspended = userRow.isSuspended
    if (!window.confirm(suspended ? 'Activate this user?' : 'Suspend this user?')) return
    try {
      setActionId(id)
      if (suspended) {
        await adminService.activateUser(id)
      } else {
        await adminService.suspendUser(id)
      }
      await loadUsers()
      await loadSummary()
    } catch (e) {
      window.alert(e.response?.data?.message || 'Action failed')
    } finally {
      setActionId(null)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
    setPage(1)
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters =
    searchQuery.trim() || roleFilter !== 'all' || statusFilter !== 'all'

  const filteredCountLabel = useMemo(() => {
    if (loading) return '…'
    return String(users.length)
  }, [loading, users.length])

  return (
    <AdminShell>
      <header className="shrink-0 border-b-2 border-gray-300 bg-white shadow-sm">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight leading-tight">
            User directory
          </h1>
          <p className="text-sm font-semibold text-gray-700 leading-relaxed">
            Live data from the server — search, filter, suspend or activate accounts (admins excluded from suspend).
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: summary.total, icon: Users, bg: 'bg-blue-100', ic: 'text-blue-600' },
              { label: 'Active', value: summary.active, icon: UserCheck, bg: 'bg-green-100', ic: 'text-green-600' },
              { label: 'Suspended', value: summary.suspended, icon: UserX, bg: 'bg-red-100', ic: 'text-red-600' },
              { label: 'Owners', value: summary.owners, icon: Shield, bg: 'bg-indigo-100', ic: 'text-indigo-600' },
              { label: 'Renters', value: summary.renters, icon: User, bg: 'bg-purple-100', ic: 'text-purple-600' }
            ].map((s) => (
              <div key={s.label} className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.ic}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {statsLoading ? '…' : s.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md">
            <div className="p-6 border-b-2 border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="lg:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 appearance-none bg-white cursor-pointer"
                    >
                      <option value="all">All roles</option>
                      <option value="owner">Owner</option>
                      <option value="renter">Renter</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="lg:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
                <span className="font-semibold text-gray-900">{pages}</span> — showing{' '}
                <span className="font-semibold text-gray-900">{filteredCountLabel}</span> users
                {total > 0 && (
                  <>
                    {' '}
                    (<span className="font-semibold text-gray-900">{total.toLocaleString()}</span> matching)
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                  <p className="mt-3 text-sm text-gray-600">Loading users…</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {hasActiveFilters ? 'Try adjusting search or filters' : 'No users in the database yet'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                    >
                      <X className="w-4 h-4" />
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const id = user._id || user.id
                      const name = user.name || '—'
                      const initials = name
                        .split(/\s+/)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || '?'
                      const status = userStatusLabel(user)
                      const role = roleLabel(user.role)
                      return (
                        <tr key={id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-indigo-600">{initials}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                user.role === 'owner'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : user.role === 'admin'
                                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                                    : 'bg-purple-100 text-purple-800 border-purple-200'
                              }`}
                            >
                              {role}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                status === 'Active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : status === 'Suspended'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            {user.role === 'admin' ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : (
                              <button
                                type="button"
                                disabled={actionId === id}
                                onClick={() => handleToggleStatus(user)}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                                  user.isSuspended
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                }`}
                              >
                                {actionId === id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : user.isSuspended ? (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    Activate
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    Suspend
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && users.length > 0 && pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {page} / {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

export default AdminUsers
