import AdminSidebar from './AdminSidebar'

/**
 * Sidebar fixed below Navbar (h-18). Main column fills viewport under nav; children should use
 * a shrink-0 page header + flex-1 min-h-0 overflow-y-auto for scrollable body.
 */
const AdminShell = ({ children }) => {
  return (
    <div className="relative w-full bg-gray-100">
      <AdminSidebar />
      <div className="flex h-[calc(100dvh-4.5rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-gray-100 pl-64">
        {children}
      </div>
    </div>
  )
}

export default AdminShell
