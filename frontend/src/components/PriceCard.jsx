const PriceCard = ({ title, price, adjustment }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-blue-600 mb-1">
        ${price.toLocaleString()}
      </div>
      {adjustment !== undefined && (
        <p className={`text-sm ${adjustment > 0 ? 'text-red-600' : adjustment < 0 ? 'text-green-600' : 'text-gray-600'}`}>
          {adjustment > 0 ? '+' : ''}{adjustment}%
        </p>
      )}
    </div>
  )
}

export default PriceCard

