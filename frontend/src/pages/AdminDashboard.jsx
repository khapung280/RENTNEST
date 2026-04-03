import { Users, Home, UserCircle, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

// Admin Dashboard Page - Clean, professional dashboard for administrators
const AdminDashboard = () => {
  const stats = {
    totalUsers: 1247,
    totalProperties: 342,
    ownerAccounts: 412,
    activeBookings: 89
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-300 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight leading-tight">Dashboard</h1>
            <p className="text-sm font-semibold text-gray-700 leading-relaxed">
              System overview — browse users and listings (no listing approvals)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Cards Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-blue-900 mb-3 tracking-wider uppercase">Total Users</h3>
                <p className="text-4xl font-extrabold text-blue-900 leading-none tracking-tight">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs font-medium text-blue-700 mt-2">Owners + Renters</p>
              </div>

              {/* Total Properties Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Home className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-green-900 mb-3 tracking-wider uppercase">Total Properties</h3>
                <p className="text-4xl font-extrabold text-green-900 leading-none tracking-tight">{stats.totalProperties}</p>
                <p className="text-xs font-medium text-green-700 mt-2">System-wide</p>
              </div>

              {/* Owner accounts (illustrative) */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                    <UserCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-amber-900 mb-3 tracking-wider uppercase">Owner accounts</h3>
                <p className="text-4xl font-extrabold text-amber-900 leading-none tracking-tight">{stats.ownerAccounts}</p>
                <p className="text-xs font-medium text-amber-700 mt-2">Illustrative — use Users to manage</p>
              </div>

              {/* Active Bookings Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-purple-900 mb-3 tracking-wider uppercase">Active Bookings</h3>
                <p className="text-4xl font-extrabold text-purple-900 leading-none tracking-tight">{stats.activeBookings}</p>
                <p className="text-xs font-medium text-purple-700 mt-2">System-wide</p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-300 mb-10"></div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 md:p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">Where to look</h2>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                New listings go live when owners publish them. Use these pages to review the platform.
              </p>
            </div>
            <ul className="space-y-3 text-base font-medium text-gray-700">
              <li>
                <Link to="/admin-dashboard/users" className="text-indigo-600 hover:text-indigo-800 font-semibold">Users</Link>
                {' — '}owners and renters
              </li>
              <li>
                <Link to="/admin-dashboard/properties" className="text-indigo-600 hover:text-indigo-800 font-semibold">Properties</Link>
                {' — '}all listings (view only)
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard

