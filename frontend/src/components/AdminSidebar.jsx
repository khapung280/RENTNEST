import { Link, useLocation } from 'react-router-dom'
import { Users, Home, LayoutDashboard, FileText } from 'lucide-react'

// Admin Sidebar Component - Shared navigation for admin pages
const AdminSidebar = () => {
  const location = useLocation()

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin-dashboard/users' },
    { id: 'properties', label: 'Properties', icon: Home, path: '/admin-dashboard/properties' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin-dashboard/reports' }
  ]

  const isActive = (path) => {
    if (path === '/admin-dashboard') {
      return location.pathname === '/admin-dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b-2 border-gray-300">
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Admin Panel</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default AdminSidebar

