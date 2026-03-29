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

const BookingTrendChart = ({ data = BOOKING_TREND_DATA, darkMode = false }) => {
  const wrap = darkMode
    ? 'bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800 shadow-xl'
    : 'bg-white rounded-xl p-6 shadow-md border border-gray-100'
  const titleCls = darkMode ? 'text-lg font-semibold text-white mb-4' : 'text-lg font-semibold text-gray-900 mb-4'
  const gridStroke = darkMode ? '#3f3f46' : '#e5e7eb'
  const axisStroke = darkMode ? '#a1a1aa' : '#6b7280'
  const tooltipStyle = darkMode
    ? { borderRadius: '12px', border: '1px solid #3f3f46', background: '#18181b', color: '#fafafa' }
    : { borderRadius: '8px', border: '1px solid #e5e7eb' }
  const lineColor = darkMode ? '#a78bfa' : '#6366f1'
  const dotFill = darkMode ? '#a78bfa' : '#6366f1'

  return (
    <div className={wrap}>
      <h3 className={titleCls}>Booking trends</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="month" stroke={axisStroke} fontSize={12} />
            <YAxis stroke={axisStroke} fontSize={12} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: darkMode ? '#fafafa' : '#374151' }}
            />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: dotFill, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: darkMode ? '#8b5cf6' : '#4f46e5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BookingTrendChart
