import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Home,
  UserCircle,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
  ArrowRight,
  Wallet,
  Sparkles,
  ExternalLink,
  Search,
  Download,
  Activity,
  Clock,
  Zap,
  ChevronRight,
  Ban
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
  Legend,
  LineChart,
  Line
} from 'recharts'
import AdminShell from '../components/AdminShell'
import { adminService, bookingService } from '../services/aiService'

const PIE_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed']
const AUTO_REFRESH_MS = 120000

function formatRelativeTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const sec = Math.round((Date.now() - d.getTime()) / 1000)
  if (sec < 45) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function MomBadge({ pct }) {
  if (pct == null || Number.isNaN(pct)) return null
  const up = pct > 0
  const flat = pct === 0
  return (
    <span
      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        flat ? 'bg-gray-100 text-gray-600' : up ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}
    >
      {flat ? (
        '—'
      ) : up ? (
        <>
          <TrendingUp className="h-3 w-3" />+{pct}%
        </>
      ) : (
        <>
          <TrendingDown className="h-3 w-3" />
          {pct}%
        </>
      )}
      {!flat && <span className="sr-only"> vs last month</span>}
    </span>
  )
}

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

function QuickLinkCard({ to, title, description, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
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
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentProperties, setRecentProperties] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshedAt, setRefreshedAt] = useState(null)
  const [apiHealth, setApiHealth] = useState({ ok: null, message: '' })
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const refreshSeq = useRef(0)

  const loadDashboard = useCallback(async () => {
    const seq = ++refreshSeq.current
    setLoading(true)
    setError(null)
    try {
      const healthP = adminService.pingHealth().catch((e) => ({
        _fail: true,
        message: e.response?.data?.message || e.message || 'Unreachable'
      }))

      const [statsRes, usersRes, propsRes, bookingsRes, health] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({ page: 1, limit: 6 }),
        adminService.getAllProperties({ page: 1, limit: 6 }),
        bookingService.getAll({ page: 1, limit: 8 }).catch(() => ({ success: false, data: [] })),
        healthP
      ])

      if (seq !== refreshSeq.current) return

      if (health && health._fail) {
        setApiHealth({ ok: false, message: health.message })
      } else if (health && health.status === 'OK') {
        setApiHealth({ ok: true, message: 'API responding' })
      } else {
        setApiHealth({ ok: true, message: 'Connected' })
      }

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

      if (bookingsRes.success) {
        const raw = bookingsRes.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
        setRecentBookings(list)
      } else {
        setRecentBookings([])
      }

      setRefreshedAt(new Date())
    } catch (err) {
      if (seq !== refreshSeq.current) return
      console.error('Admin dashboard load:', err)
      setError(err.response?.data?.message || 'Could not load dashboard data.')
      setStats(null)
    } finally {
      if (seq === refreshSeq.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => loadDashboard(), AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [autoRefresh, loadDashboard])

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

  const trendData = useMemo(() => stats?.trends?.months ?? [], [stats])

  const cmp = stats?.comparison

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

  const exportSnapshot = () => {
    if (!stats) return
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            stats,
            note: 'RentNest admin snapshot — confidential'
          },
          null,
          2
        )
      ],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rentnest-admin-snapshot-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const submitQuickSearch = (e) => {
    e.preventDefault()
    const q = quickSearch.trim()
    if (!q) return
    navigate(`/admin-dashboard/users?search=${encodeURIComponent(q)}`)
    setQuickSearch('')
  }

  return (
    <AdminShell>
      <header className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Operations center
                </span>
                {apiHealth.ok === true && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <Activity className="h-3.5 w-3.5" />
                    API OK
                  </span>
                )}
                {apiHealth.ok === false && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                    <AlertCircle className="h-3.5 w-3.5" />
                    API check failed
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
              <p className="mt-1 max-w-3xl text-sm font-medium text-gray-600">
                Live database metrics, month-over-month movement, and 6-month activity trends. Use the command bar
                to jump to user search, export a JSON snapshot for records, or enable auto-refresh for monitoring
                sessions.
              </p>
              {refreshedAt && !loading && (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Last refreshed: {formatTime(refreshedAt)}
                  </span>
                  {stats?.meta?.generatedAt && (
                    <span>Server snapshot: {formatTime(new Date(stats.meta.generatedAt))}</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Zap className="h-4 w-4 text-amber-500" />
                Auto-refresh (2m)
              </label>
              <button
                type="button"
                onClick={() => exportSnapshot()}
                disabled={!stats}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => loadDashboard()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <form onSubmit={submitQuickSearch} className="mt-6 max-w-xl">
            <label className="sr-only" htmlFor="admin-quick-search">
              Quick user search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="admin-quick-search"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Jump to user directory — search by name or email…"
                className="w-full rounded-xl border-2 border-gray-300 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Press Enter to open Users with this query (URL updates for sharing).</p>
          </form>
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
              {/* Attention panels — read-only deep links, no approve/reject */}
              {(stats.properties?.pending > 0 || stats.bookings?.pending > 0) && (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {stats.properties?.pending > 0 && (
                    <Link
                      to="/admin-dashboard/properties"
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-amber-200 bg-amber-50/80 p-4 transition hover:bg-amber-50"
                    >
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-6 w-6 text-amber-700" />
                        <div>
                          <p className="font-bold text-amber-950">Listings in pending state</p>
                          <p className="text-sm text-amber-900/90">
                            {stats.properties.pending} property record(s) — open Properties and filter by status to
                            review (view only on your setup).
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-amber-800" />
                    </Link>
                  )}
                  {stats.bookings?.pending > 0 && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-violet-200 bg-violet-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-6 w-6 text-violet-700" />
                        <div>
                          <p className="font-bold text-violet-950">Open booking requests</p>
                          <p className="text-sm text-violet-900/90">
                            {stats.bookings.pending} booking(s) awaiting confirmation in the workflow — owners handle
                            approvals in their dashboard; nothing to accept here.
                          </p>
                        </div>
                      </div>
                      <span title="No approve/reject on this screen" className="shrink-0 text-violet-400">
                        <Ban className="h-5 w-5" />
                      </span>
                    </div>
                  )}
                </div>
              )}

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
                  sub={`${stats.properties?.active ?? 0} live · ${stats.properties?.pending ?? 0} pending`}
                />
                <KpiCard
                  icon={UserCircle}
                  iconBg="bg-amber-600"
                  borderClass="border-amber-100"
                  title="Owners / renters"
                  value={`${stats.users?.owners ?? 0} / ${stats.users?.renters ?? 0}`}
                  sub={`${stats.users?.admins ?? 0} admin account(s)`}
                />
                <KpiCard
                  icon={Calendar}
                  iconBg="bg-violet-600"
                  borderClass="border-violet-100"
                  title="Bookings (all time)"
                  value={(stats.bookings?.total ?? 0).toLocaleString()}
                  sub={`${stats.bookings?.confirmed ?? 0} confirmed · ${stats.bookings?.cancelled ?? 0} cancelled`}
                />
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">This month</span>
                    {cmp && <MomBadge pct={cmp.newUsersMomPct} />}
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    +{(stats.users?.newThisMonth ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">New sign-ups</p>
                  {cmp?.lastMonth && (
                    <p className="mt-2 text-xs text-gray-500">
                      Last month: {cmp.lastMonth.newUsers?.toLocaleString?.() ?? cmp.lastMonth.newUsers}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">This month</span>
                    {cmp && <MomBadge pct={cmp.newPropertiesMomPct} />}
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    +{(stats.properties?.newThisMonth ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">New listings created</p>
                  {cmp?.lastMonth && (
                    <p className="mt-2 text-xs text-gray-500">
                      Last month: {cmp.lastMonth.newProperties?.toLocaleString?.() ?? cmp.lastMonth.newProperties}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">This month</span>
                    {cmp && <MomBadge pct={cmp.newBookingsMomPct} />}
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    +{(stats.bookings?.thisMonth ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-600">New booking records</p>
                  {cmp?.lastMonth && (
                    <p className="mt-2 text-xs text-gray-500">
                      Last month: {cmp.lastMonth.newBookings?.toLocaleString?.() ?? cmp.lastMonth.newBookings}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Wallet className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Revenue snapshot</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-gray-900">
                    {formatNpr(stats.revenue?.total ?? 0)}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Sum of confirmed booking totals (NPR)</p>
                </div>
              </div>

              {trendData.length > 0 && (
                <div className="mb-8 rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">6-month activity (new records per month)</h2>
                  <p className="text-xs text-gray-500">
                    Users, properties, and bookings created in each calendar month — useful for growth reviews.
                  </p>
                  <div className="mt-4 h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                        <Legend />
                        <Line type="monotone" dataKey="users" name="Users" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                        <Line
                          type="monotone"
                          dataKey="properties"
                          name="Properties"
                          stroke="#059669"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          name="Bookings"
                          stroke="#7c3aed"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900">Bookings by status</h2>
                  <p className="text-xs text-gray-500">Distribution across the whole database</p>
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
                  <p className="text-xs text-gray-500">Inventory mix — drill down from Properties</p>
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

              <div className="mb-8">
                <h2 className="mb-4 text-xl font-extrabold text-gray-900">Workspace</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <QuickLinkCard
                    to="/admin-dashboard/users"
                    title="User directory"
                    description="Search, paginate, suspend or activate non-admin accounts."
                    icon={Users}
                  />
                  <QuickLinkCard
                    to="/admin-dashboard/properties"
                    title="All properties"
                    description="Every listing with owner and status — filter and inspect."
                    icon={Building2}
                  />
                  <QuickLinkCard
                    to="/admin-dashboard/reports"
                    title="Reports & trends"
                    description="Visual summaries for stakeholders."
                    icon={FileText}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm xl:col-span-1">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent sign-ups</h2>
                    <Link
                      to="/admin-dashboard/users"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Directory
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
                          <div className="shrink-0 text-right">
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-700">
                              {u.role || '—'}
                            </span>
                            <p className="mt-1 text-[10px] text-gray-400">{formatRelativeTime(u.createdAt)}</p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm xl:col-span-1">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Latest listings</h2>
                    <Link
                      to="/admin-dashboard/properties"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      All
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
                            <p className="text-[10px] text-gray-400">{formatRelativeTime(p.createdAt)}</p>
                          </div>
                          <Link
                            to={`/property/${p._id}`}
                            className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-indigo-600"
                            title="Public listing"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm xl:col-span-1">
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent bookings</h2>
                    <p className="text-xs text-gray-500">Read-only peek — newest first</p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {recentBookings.length === 0 ? (
                      <li className="px-5 py-8 text-center text-sm text-gray-500">No bookings yet</li>
                    ) : (
                      recentBookings.map((b) => {
                        const pid = b.property?._id || b.property
                        const title = b.property?.title || 'Property'
                        return (
                          <li key={b._id} className="px-5 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
                                <p className="text-xs text-gray-500">
                                  {b.renter?.name || 'Renter'} ·{' '}
                                  <span className="capitalize">{b.status || '—'}</span>
                                </p>
                                <p className="text-[10px] text-gray-400">{formatRelativeTime(b.createdAt)}</p>
                              </div>
                              {pid && (
                                <Link
                                  to={`/property/${pid}`}
                                  className="shrink-0 text-indigo-600 hover:text-indigo-800"
                                  title="Listing"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              )}
                            </div>
                          </li>
                        )
                      })
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
