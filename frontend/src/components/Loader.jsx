// Premium animated loader - Stripe/Linear style
const Loader = ({ size = 'md', className = '' }) => {
  const dotSize = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' }[size]
  return (
    <div className={`loader-wrapper ${className}`} role="status" aria-label="Loading">
      <div className="loader-dots">
        <span className={dotSize} />
        <span className={dotSize} />
        <span className={dotSize} />
      </div>
    </div>
  )
}

export default Loader
