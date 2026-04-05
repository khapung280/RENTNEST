import { useLocation } from 'react-router-dom'
import MarketingFooter from './MarketingFooter'
import AdminFooter from './AdminFooter'

const Footer = () => {
  const { pathname } = useLocation()

  if (pathname.startsWith('/admin-dashboard')) {
    return null
  }
  if (pathname === '/admin') {
    return <AdminFooter />
  }

  return <MarketingFooter footerClassName="mt-24" />
}

export default Footer
