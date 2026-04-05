import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Home,
  UserCircle,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Building2,
  FileText,
  ArrowRight,
  Wallet,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import AdminShell from '../components/AdminShell'
import { adminService } from '../services/aiService'

const PIE_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed']

function KpiCard({ icon: Icon, iconBg, title, value, sub, borderClass }) {
  return (
    <div
      className={`rounded-xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${borderClass}`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-gray-900">{value}</p>
      {sub && <p className="mt-2 text-xs font-medium text-gray-600">{sub}</p>}
    </div>
  )
}

function QuickLinkCard({ to, title, description, icon: Icon, accent }) {
  return (
    <Link
      to={to}
      className={`group flex flex-col rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md ${accent}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-gray-600 leading-relaxed">{description}</p>
    </Link>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentProperties, setRecentProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshedAt, setRefreshedAt] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, usersRes, propsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({ page: 1, limit: 6 }),
        adminService.getAllProperties({ page: 1, limit: 6 })
      ])

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      } else {
        setStats(null)
      }

      if (usersRes.success && Array.isArray(usersRes.data)) {
        setRecentUsers(usersRes.data)
      } else {
        setRecentUsers([])
      }

      if (propsRes.success && Array.isArray(propsRes.data)) {
        setRecentProperties(propsRes.data)
      } else {
        setRecentProperties([])
      }

      setRefreshedAt(new Date())
    } catch (err) {
      console.error('Admin dashboard load:', err)
      setError(err.response?.data?.message || 'Could not load dashboard data. Check your connection and try again.')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const bookingBarData = useMemo(() => {
    if (!stats?.bookings) return []
    const b = stats.bookings
    return [
      { name: 'Pending', count: b.pending ?? 0 },
      { name: 'Confirmed', count: b.confirmed ?? 0 },
      { name: 'Cancelled', count: b.cancelled ?? 0 }
    ]
  }, [stats])

  const propertyPieData = useMemo(() => {
    if (!stats?.properties) return []
    const p = stats.properties
    return [
      { name: 'Approved', value: p.approved ?? 0 },
      { name: 'Pending', value: p.pending ?? 0 },
      { name: 'Rejected', value: p.rejected ?? 0 }
    ].filter((d) => d.value > 0)
  }, [stats])

  const userRoleData = useMemo(() => {
    if (!stats?.users) return []
    const u = stats.users
    return [
      { name: 'Renters', value: u.renters ?? 0 },
      { name: 'Owners', value: u.owners ?? 0 },
      { name: 'Admins', value: u.admins ?? 0 }
    ].filter((d) => d.value > 0)
  }, [stats])

  const formatNpr = (n) => {
    const num = Number(n) || 0
    return `NPR ${num.toLocaleString()}`
  }

  const formatTime = (d) => {
    if (!d) return '—'
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <AdminShell>
      <header className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                Live overview
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm font-medium text-gray-600">
              Real metrics from your database — monitor growth, listings, and bookings (read-only; no approvals on this screen).
            </p>
            {refreshedAt && !loading && (
              <p className="mt-2 text-xs text-gray-500">Last refreshed: {formatTime(refreshedAt)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => loadDashboard()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="p-6">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">{error}</p>
                <button
                  type="button"
                  onClick={() => loadDashboard()}
                  className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {loading && !stats ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm font-medium text-gray-600">Loading dashboard…</p>
            </div>
          ) : stats ? (
            <>
              {/* KPI grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  icon={Users}
                  iconBg="bg-blue-600"
                  borderClass="border-blue-100"
                  title="Total users"
                  value={(stats.users?.total ?? 0).toLocaleString()}
                  sub={`${stats.users?.active ?? 0} active · ${stats.users?.suspended ?? 0} suspended`}
                />
                <KpiCard
                  icon={Home}
                  iconBg="bg-emerald-600"
                  borderClass="border-emerald-100"
                  title="Properties"
                  value={(stats.properties?.total ?? 0).toLocaleString()}
                  sub={`${stats.properties?.active ?? 0} live on marketplace`}
                />
                <KpiCard
                  icon={UserCircle}
                  iconBg="bg-amber-600"
                  borderClass="border-amber-100"
                  title="Owners & renters"
                  value={`${stats.users?.owners ?? 0} / ${stats.users?.renters ?? 0}`}
                  sub="Owners · Renters registered"
                />
                <KpiCard
                  icon={Calendar}
                  iconBg="bg-violet-600"
                  borderClass="border-violet-100"
                  title="Bookings (all time)"
                  value={(stats.bookings?.total ?? 0).toLocaleString()}
                  sub={`${stats.bookings?.confirmed ?? 0} confirmed · ${stats.bookings?.pending ?? 0} pending`}
                />
              </div>

              {/* This month + revenue */}
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">This month</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    +{(stats.users?.newThisMonth ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">New user sign-ups</p>
                </div>
                <div className="rounded-xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">This month</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    +{(stats.properties?.newThisMonth ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">New listings added</p>
                </div>
                <div className="rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">This month</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    +{(stats.bookings?.thisMonth ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">New booking records</p>
                </div>
                <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Wallet className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Revenue snapshot</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    {formatNpr(stats.revenue?.total ?? 0)}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Sum of confirmed booking totals</p>
                </div>
              </div>

              {/* Charts */}
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Bookings by status</h2>
                  <p className="text-xs text-gray-500">Counts only — no actions from this chart</p>
                  <div className="mt-4 h-[280px] w-full">
                    {bookingBarData.some((d) => d.count > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookingBarData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                            formatter={(value) => [value, 'Count']}
                          />
                          <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Bookings" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No booking data yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Listings by approval state</h2>
                  <p className="text-xs text-gray-500">For visibility — manage listings from the Properties page (view / filters)</p>
                  <div className="mt-4 h-[280px] w-full">
                    {propertyPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={propertyPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={2}
                          >
                            {propertyPieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Properties']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No properties yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {userRoleData.length > 0 && (
                <div className="mb-8 rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Accounts by role</h2>
                  <div className="mt-4 h-[220px] w-full max-w-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={userRoleData} margin={{ left: 16, right: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [value, 'Users']} />
                        <Bar dataKey="value" fill="#059669" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-extrabold text-gray-900">Workspace</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <QuickLinkCard
                    to="/admin-dashboard/users"
                    title="User directory"
                    description="Search and filter renters, owners, and account states."
                    icon={Users}
                  />
                  <QuickLinkCard
                    to="/admin-dashboard/properties"
                    title="All properties"
                    description="Browse every listing, owner, and status in one table."
                    icon={Building2}
                  />
                  <QuickLinkCard
                    to="/admin-dashboard/reports"
                    title="Reports & trends"
                    description="Charts and KPIs for presentations and reviews."
                    icon={FileText}
                  />
                </div>
              </div>

              {/* Recent activity */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent sign-ups</h2>
                    <Link
                      to="/admin-dashboard/users"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {recentUsers.length === 0 ? (
                      <li className="px-5 py-8 text-center text-sm text-gray-500">No users yet</li>
                    ) : (
                      recentUsers.map((u) => (
                        <li key={u._id} className="flex items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{u.name || '—'}</p>
                            <p className="truncate text-xs text-gray-500">{u.email}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-700">
                            {u.role || '—'}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Latest listings</h2>
                    <Link
                      to="/admin-dashboard/properties"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {recentProperties.length === 0 ? (
                      <li className="px-5 py-8 text-center text-sm text-gray-500">No properties yet</li>
                    ) : (
                      recentProperties.map((p) => (
                        <li key={p._id} className="flex items-center gap-3 px-5 py-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {p.image ? (
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <Home className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-gray-900">{p.title || 'Untitled'}</p>
                            <p className="truncate text-xs text-gray-500">
                              {(p.owner?.name || p.ownerName || 'Owner') + ' · ' + (p.status || '—')}
                            </p>
                          </div>
                          <Link
                            to={`/property/${p._id}`}
                            className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-indigo-600"
                            title="Open public listing"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </>
          ) : !loading ? (
            <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-10 text-center">
              <p className="font-medium text-gray-700">No statistics available.</p>
              <button
                type="button"
                onClick={() => loadDashboard()}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
              >
                Reload
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  )
}

export default AdminDashboard
