import { Link } from 'react-router-dom'
import { Eye, Edit, Trash2 } from 'lucide-react'

const STATUS_STYLES_LIGHT = {
  active: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  rented: 'bg-indigo-50 text-indigo-700',
  rejected: 'bg-red-50 text-red-700'
}

const STATUS_STYLES_DARK = {
  active: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  approved: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  pending: 'bg-amber-500/15 text-amber-200 border border-amber-500/20',
  rented: 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  rejected: 'bg-red-500/15 text-red-300 border border-red-500/20'
}

const getStatusBadge = (status, darkMode) => {
  const s = (status || '').toLowerCase()
  const map = darkMode ? STATUS_STYLES_DARK : STATUS_STYLES_LIGHT
  return map[s] ?? (darkMode ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-700')
}

const PropertiesTable = ({ properties, bookingsByProperty, onDelete, onEdit, darkMode = false }) => {
  const getBookingCount = (propertyId) => {
    const list = bookingsByProperty?.[propertyId] ?? []
    return Array.isArray(list) ? list.length : 0
  }

  const getEarnings = (property) => {
    const count = getBookingCount(property._id)
    const price = property.price ?? 0
    return count * price
  }

  const displayStatus = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'approved') return 'Active'
    if (s === 'rejected') return 'Pending'
    return (status || 'Pending').charAt(0).toUpperCase() + (status || '').slice(1)
  }

  const wrap = darkMode
    ? 'bg-zinc-900/70 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl'
    : 'bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden'
  const theadBg = darkMode ? 'bg-zinc-950/80' : 'bg-gray-50'
  const thCls = darkMode
    ? 'px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider'
    : 'px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'
  const rowHover = darkMode ? 'hover:bg-zinc-800/60' : 'hover:bg-gray-50/80'
  const divide = darkMode ? 'divide-zinc-800' : 'divide-gray-100'
  const titleText = darkMode ? 'text-sm font-medium text-white' : 'text-sm font-medium text-gray-900'
  const subText = darkMode ? 'text-xs text-zinc-500' : 'text-xs text-gray-500'
  const cellText = darkMode ? 'text-sm text-zinc-300' : 'text-sm text-gray-700'
  const earnText = darkMode ? 'text-sm font-medium text-violet-300' : 'text-sm font-medium text-gray-900'

  return (
    <div className={wrap}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${divide}`}>
          <thead>
            <tr className={theadBg}>
              <th className={thCls}>Property Name</th>
              <th className={thCls}>Status</th>
              <th className={thCls}>Bookings</th>
              <th className={thCls}>Earnings</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divide}`}>
            {properties.map((property) => (
              <tr key={property._id} className={`${rowHover} transition-colors duration-200`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {property.image && (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-12 h-12 object-cover rounded-lg border border-zinc-700"
                      />
                    )}
                    <div>
                      <p className={titleText}>{property.title}</p>
                      {property.type && (
                        <p className={`${subText} capitalize`}>
                          {String(property.type).replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      property.status,
                      darkMode
                    )}`}
                  >
                    {displayStatus(property.status)}
                  </span>
                </td>
                <td className={`px-6 py-4 ${cellText}`}>{getBookingCount(property._id)}</td>
                <td className={`px-6 py-4 ${earnText} tabular-nums`}>
                  NPR {getEarnings(property).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/property/${property._id}`}
                      className={
                        darkMode
                          ? 'p-2 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors'
                          : 'p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                      }
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(property)}
                        className={
                          darkMode
                            ? 'p-2 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors'
                            : 'p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                        }
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(property._id)}
                      className={
                        darkMode
                          ? 'p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors'
                          : 'p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                      }
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PropertiesTable
