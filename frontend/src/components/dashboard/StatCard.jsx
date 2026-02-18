const StatCard = ({ icon: Icon, title, value, change, changeLabel = 'this month' }) => (
  <div
    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {change != null && (
          <p className={`mt-1 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% {changeLabel}
          </p>
        )}
      </div>
      <div className="ml-4 flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
    </div>
  </div>
)

export default StatCard
