import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Calendar, Clock, Building2, Loader2, DollarSign } from 'lucide-react'
import { propertyService, bookingService } from '../services/aiService'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import StatCard from '../components/dashboard/StatCard'
import BookingTrendChart from '../components/dashboard/BookingTrendChart'
import PropertiesTable from '../components/dashboard/PropertiesTable'

const OwnerDashboard = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ownerName, setOwnerName] = useState('Owner')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.name) setOwnerName(parsed.name)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [propertiesResult, bookingsResult] = await Promise.allSettled([
        propertyService.getMyProperties(),
        bookingService.getOwnerBookings()
      ])

      const propertiesResponse = propertiesResult.status === 'fulfilled' ? propertiesResult.value : null
      const bookingsResponse = bookingsResult.status === 'fulfilled' ? bookingsResult.value : null

      if (propertiesResponse?.success && propertiesResponse?.data?.data) {
        setProperties(propertiesResponse.data.data)
      } else if (propertiesResult.status === 'rejected') {
        setError(propertiesResult.reason?.response?.data?.message || 'Failed to load properties')
      }

      if (bookingsResponse?.success) {
        const list = Array.isArray(bookingsResponse.data?.data)
          ? bookingsResponse.data.data
          : bookingsResponse.data
          ? [bookingsResponse.data]
          : []
        setBookings(list)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const activeBookings = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'approved'
    ).length
    const pendingRequests = bookings.filter((b) => b.status === 'pending').length
    const monthlyRevenue = properties.reduce((sum, p) => {
      const count = bookings.filter((b) => {
        const propId = b.property?._id ?? b.property
        return String(propId) === String(p._id) && (b.status === 'confirmed' || b.status === 'approved')
      }).length
      return sum + (p.price ?? 0) * count
    }, 0)
    return {
      totalProperties: properties.length,
      activeBookings,
      pendingRequests,
      monthlyRevenue
    }
  }, [properties, bookings])

  const bookingsByProperty = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      const propId = b.property?._id ?? b.property
      if (!propId) return
      const key = String(propId)
      if (!map[key]) map[key] = []
      map[key].push(b)
    })
    return map
  }, [bookings])

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const m = (now.getMonth() - 5 + i + 12) % 12
      const month = months[m]
      const count = bookings.filter((b) => {
        const d = b.checkIn ?? b.checkInDate ?? b.createdAt
        if (!d) return false
        const date = new Date(d)
        return date.getMonth() === m
      }).length
      return { month, bookings: count }
    })
  }, [bookings])

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }
    try {
      const response = await propertyService.delete(propertyId)
      if (response.success) loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete property')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      welcomeTitle={`Welcome back, ${ownerName} 👋`}
      subtitle="Here's your property performance overview."
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={loadData}
            className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <section className="mb-8 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Home}
            title="Total Properties"
            value={stats.totalProperties}
            change={12}
          />
          <StatCard
            icon={Calendar}
            title="Active Bookings"
            value={stats.activeBookings}
            change={8}
          />
          <StatCard
            icon={Clock}
            title="Pending Requests"
            value={stats.pendingRequests}
            change={-3}
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`NPR ${stats.monthlyRevenue.toLocaleString()}`}
            change={15}
          />
        </div>
      </section>

      <section className="mb-8 animate-fade-in">
        <BookingTrendChart data={chartData} />
      </section>

      <section className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your listings</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/owner-dashboard/add-property')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-300"
            >
              Add Property
            </button>
            <button
              onClick={() => navigate('/owner-dashboard/bookings')}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all duration-300"
            >
              View Bookings
            </button>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 md:p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-6">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Add your first property to start receiving bookings.
            </p>
            <button
              onClick={() => navigate('/owner-dashboard/add-property')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-300"
            >
              Add Your First Property
            </button>
          </div>
        ) : (
          <PropertiesTable
            properties={properties}
            bookingsByProperty={bookingsByProperty}
            onDelete={handleDeleteProperty}
          />
        )}
      </section>
    </DashboardLayout>
  )
}

export default OwnerDashboard
