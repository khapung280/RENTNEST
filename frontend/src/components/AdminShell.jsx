import AdminSidebar from './AdminSidebar'
import AdminFooter from './AdminFooter'

/**
 * Sidebar fixed below Navbar (h-18). Main column fills viewport under nav; children should use
 * a shrink-0 page header + flex-1 min-h-0 overflow-y-auto for scrollable body.
 * AdminFooter sits below the scroll region so it stays visible (marketing Footer is hidden on these routes).
 */
const AdminShell = ({ children }) => {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-gray-100">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gray-100 pl-64">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminShell
