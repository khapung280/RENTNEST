import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const BOOKING_TREND_DATA = [
  { month: 'Jul', bookings: 4 },
  { month: 'Aug', bookings: 6 },
  { month: 'Sep', bookings: 5 },
  { month: 'Oct', bookings: 8 },
  { month: 'Nov', bookings: 10 },
  { month: 'Dec', bookings: 12 }
]

const BookingTrendChart = ({ data = BOOKING_TREND_DATA }) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking trends</h3>
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            labelStyle={{ color: '#374151' }}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#4f46e5' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default BookingTrendChart
