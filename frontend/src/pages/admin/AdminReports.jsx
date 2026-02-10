import { useState, useMemo } from 'react'
import { Users, Home, Calendar, BarChart3, TrendingUp, TrendingDown, Download, Filter, X, DollarSign, Activity } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'

// Admin Reports Page - Enhanced system reports and analytics
const AdminReports = () => {
  // Date filter state
  const [dateRange, setDateRange] = useState('month') // month, quarter, year, all

  // Dummy report data
  const stats = {
    totalUsers: 1247,
    totalProperties: 342,
    monthlyBookings: 156,
    totalRevenue: 2450000, // NPR
    activeListings: 318,
    newUsersThisMonth: 87,
    propertiesAdded: 24,
    completionRate: 94
  }

  // Monthly data for charts (last 6 months)
  const monthlyData = [
    { month: 'Jan', users: 45, properties: 12, bookings: 120, revenue: 1800000 },
    { month: 'Feb', users: 52, properties: 15, bookings: 135, revenue: 2025000 },
    { month: 'Mar', users: 48, properties: 18, bookings: 142, revenue: 2130000 },
    { month: 'Apr', users: 61, properties: 20, bookings: 148, revenue: 2220000 },
    { month: 'May', users: 55, properties: 22, bookings: 152, revenue: 2280000 },
    { month: 'Jun', users: 87, properties: 24, bookings: 156, revenue: 2340000 },
  ]

  // Calculate trends
  const trends = useMemo(() => {
    const lastMonth = monthlyData[monthlyData.length - 2]
    const currentMonth = monthlyData[monthlyData.length - 1]
    
    return {
      users: ((currentMonth.users - lastMonth.users) / lastMonth.users * 100).toFixed(1),
      properties: ((currentMonth.properties - lastMonth.properties) / lastMonth.properties * 100).toFixed(1),
      bookings: ((currentMonth.bookings - lastMonth.bookings) / lastMonth.bookings * 100).toFixed(1),
      revenue: ((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue * 100).toFixed(1),
    }
  }, [])

  // Get max value for chart scaling
  const getMaxValue = (data, key) => {
    return Math.max(...data.map(d => d[key]))
  }

  // Calculate bar height percentage
  const getBarHeight = (value, maxValue) => {
    return (value / maxValue) * 100
  }

  // Handle export (UI only)
  const handleExport = (format) => {
    // Simulate export
    alert(`Exporting reports as ${format}... (This is a demo - no actual file will be downloaded)`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-300 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight leading-tight">System Reports</h1>
                <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                  Platform usage and activity overview
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm font-medium appearance-none bg-white cursor-pointer"
                  >
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                {/* Export Button */}
                <button
                  onClick={() => handleExport('PDF')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Users Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(trends.users) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(trends.users) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(parseFloat(trends.users))}%
                </div>
              </div>
              <h3 className="text-xs font-bold text-blue-900 mb-2 tracking-wider uppercase">Total Users</h3>
              <p className="text-3xl font-extrabold text-blue-900 leading-none">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs font-medium text-blue-700 mt-2">+{stats.newUsersThisMonth} this month</p>
            </div>

            {/* Total Properties Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(trends.properties) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(trends.properties) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(parseFloat(trends.properties))}%
                </div>
              </div>
              <h3 className="text-xs font-bold text-green-900 mb-2 tracking-wider uppercase">Total Properties</h3>
              <p className="text-3xl font-extrabold text-green-900 leading-none">{stats.totalProperties}</p>
              <p className="text-xs font-medium text-green-700 mt-2">+{stats.propertiesAdded} this month</p>
            </div>

            {/* Monthly Bookings Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(trends.bookings) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(trends.bookings) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(parseFloat(trends.bookings))}%
                </div>
              </div>
              <h3 className="text-xs font-bold text-purple-900 mb-2 tracking-wider uppercase">Monthly Bookings</h3>
              <p className="text-3xl font-extrabold text-purple-900 leading-none">{stats.monthlyBookings}</p>
              <p className="text-xs font-medium text-purple-700 mt-2">This month</p>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(trends.revenue) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(trends.revenue) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(parseFloat(trends.revenue))}%
                </div>
              </div>
              <h3 className="text-xs font-bold text-amber-900 mb-2 tracking-wider uppercase">Total Revenue</h3>
              <p className="text-3xl font-extrabold text-amber-900 leading-none">NPR {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs font-medium text-amber-700 mt-2">Platform-wide</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Users Growth Chart */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Users Growth</h2>
                  <p className="text-sm text-gray-600">Last 6 months</p>
                </div>
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {monthlyData.map((data, index) => {
                  const maxValue = getMaxValue(monthlyData, 'users')
                  const height = getBarHeight(data.users, maxValue)
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                        <div
                          className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700"
                          style={{ height: `${height}%` }}
                          title={`${data.users} users`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{data.month}</span>
                      <span className="text-xs font-bold text-gray-900">{data.users}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Bookings Trend</h2>
                  <p className="text-sm text-gray-600">Last 6 months</p>
                </div>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {monthlyData.map((data, index) => {
                  const maxValue = getMaxValue(monthlyData, 'bookings')
                  const height = getBarHeight(data.bookings, maxValue)
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                        <div
                          className="absolute bottom-0 w-full bg-purple-600 rounded-t-lg transition-all hover:bg-purple-700"
                          style={{ height: `${height}%` }}
                          title={`${data.bookings} bookings`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{data.month}</span>
                      <span className="text-xs font-bold text-gray-900">{data.bookings}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-md mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Key Performance Indicators</h2>
              <p className="text-sm text-gray-600">Platform performance metrics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Active Listings</h3>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.activeListings}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Currently available</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Users</h3>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.newUsersThisMonth}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">This month</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Properties Added</h3>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.propertiesAdded}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">This month</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Completion Rate</h3>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.completionRate}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Booking success rate</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Revenue Trend</h2>
                <p className="text-sm text-gray-600">Last 6 months (NPR)</p>
              </div>
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.map((data, index) => {
                const maxValue = getMaxValue(monthlyData, 'revenue')
                const height = getBarHeight(data.revenue, maxValue)
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-amber-600 rounded-t-lg transition-all hover:bg-amber-700"
                        style={{ height: `${height}%` }}
                        title={`NPR ${data.revenue.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{data.month}</span>
                    <span className="text-xs font-bold text-gray-900">{(data.revenue / 100000).toFixed(1)}L</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminReports
