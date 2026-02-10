import { Users, Home, Shield, Calendar, CheckCircle2 } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'

// Admin Dashboard Page - Clean, professional dashboard for administrators
const AdminDashboard = () => {
  // Dummy data - System-level metrics
  const stats = {
    totalUsers: 1247, // Owners + Renters
    totalProperties: 342, // System-wide
    pendingApprovals: 18,
    activeBookings: 89 // System-wide
  }

  // Dummy property approvals data
  const pendingProperties = [
    { id: 1, propertyName: 'Thamel Luxury Apartment', ownerName: 'Rajesh Shrestha', location: 'Kathmandu', status: 'Pending' },
    { id: 2, propertyName: 'Lalitpur Family House', ownerName: 'Sita Maharjan', location: 'Lalitpur', status: 'Pending' },
    { id: 3, propertyName: 'Pokhara Lake View Villa', ownerName: 'Bikash Gurung', location: 'Pokhara', status: 'Pending' },
    { id: 4, propertyName: 'Baneshwor Modern Flat', ownerName: 'Anita Tamang', location: 'Kathmandu', status: 'Approved' },
    { id: 5, propertyName: 'Bhaktapur Heritage Home', ownerName: 'Krishna Basnet', location: 'Bhaktapur', status: 'Pending' },
    { id: 6, propertyName: 'Patan Studio Apartment', ownerName: 'Mina Thapa', location: 'Lalitpur', status: 'Pending' }
  ]

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
              System overview and management
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

              {/* Pending Approvals Card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-amber-900 mb-3 tracking-wider uppercase">Pending Approvals</h3>
                <p className="text-4xl font-extrabold text-amber-900 leading-none tracking-tight">{stats.pendingApprovals}</p>
                <p className="text-xs font-medium text-amber-700 mt-2">Requires action</p>
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

          {/* Section Divider */}
          <div className="border-t-2 border-gray-300 mb-10"></div>

          {/* Pending Property Approvals Section */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 md:p-8 shadow-md mb-10">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">Pending Property Approvals</h2>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">Review and manage property listing requests</p>
            </div>
            
            {/* Properties Table or Empty State */}
            {pendingProperties.length === 0 ? (
              <div className="text-center py-14">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg mb-5">
                  <CheckCircle2 className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-base font-semibold text-gray-800 mb-1.5">No pending approvals at the moment.</p>
                <p className="text-sm font-medium text-gray-600">All property listings have been reviewed.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6 md:-mx-8">
                  <div className="inline-block min-w-full align-middle px-6 md:px-8">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="text-left py-4 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">Property Name</th>
                          <th className="text-left py-4 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">Owner Name</th>
                          <th className="text-left py-4 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">Location</th>
                          <th className="text-left py-4 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingProperties.map((property) => (
                          <tr key={property.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                            <td className="py-5 px-5 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900 leading-normal">{property.propertyName}</span>
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-700 leading-normal">{property.ownerName}</span>
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap">
                              <span className="text-sm text-gray-600 leading-normal">{property.location}</span>
                            </td>
                            <td className="py-5 px-5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  property.status === 'Pending'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                }`}
                              >
                                {property.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-7 pt-6 border-t-2 border-gray-200">
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    Admins monitor and manage platform-wide activity from this dashboard.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Main Content Section */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 md:p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">System Overview</h2>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">Administrative controls and insights</p>
            </div>
            <p className="text-base font-medium text-gray-700 leading-relaxed">
              System management and monitoring tools will appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard

