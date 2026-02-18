import { Link } from 'react-router-dom'
import { Eye, Edit, Trash2 } from 'lucide-react'

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  rented: 'bg-indigo-50 text-indigo-700',
  rejected: 'bg-red-50 text-red-700'
}

const getStatusBadge = (status) => {
  const s = (status || '').toLowerCase()
  return STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-700'
}

const PropertiesTable = ({ properties, bookingsByProperty, onDelete, onEdit }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Property Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Bookings
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Earnings
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((property) => (
              <tr
                key={property._id}
                className="hover:bg-gray-50/80 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {property.image && (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{property.title}</p>
                      {property.type && (
                        <p className="text-xs text-gray-500 capitalize">
                          {String(property.type).replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      property.status
                    )}`}
                  >
                    {displayStatus(property.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {getBookingCount(property._id)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  NPR {getEarnings(property).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/property/${property._id}`}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(property)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(property._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
