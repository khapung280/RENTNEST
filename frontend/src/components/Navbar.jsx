import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getCurrentUser, isAuthenticated } from '../utils/auth'
import RentNestLogo from './RentNestLogo'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  // Get user data on mount and when location changes
  useEffect(() => {
    const loadUser = () => {
      if (isAuthenticated()) {
        // Check localStorage for user data stored by authService
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (e) {
            const userData = getCurrentUser()
            setUser(userData)
          }
        } else {
          const userData = getCurrentUser()
          setUser(userData)
        }
      } else {
        setUser(null)
      }
    }
    
    loadUser()
    // Also reload when storage changes (e.g., after login)
    const handleStorageChange = () => loadUser()
    window.addEventListener('storage', handleStorageChange)
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [location])

  // Build nav links based on user state
  const navLinks = useMemo(() => {
    const links = [
      { path: '/', label: 'Home' },
      { path: '/houses', label: 'Houses' },
      { path: '/flats-apartments', label: 'Flats & Apartments' },
      { path: '/about', label: 'About Us' },
      { path: '/messages', label: 'Messages' },
    ]

    // Add role-based links
    if (user?.accountType === 'owner') {
      links.push({ path: '/owner-dashboard', label: 'Owner Dashboard' })
    }
    if (user?.accountType === 'admin') {
      links.push({ path: '/admin-dashboard', label: 'Admin Dashboard' })
    }

    // Add auth links
    if (!isAuthenticated()) {
      links.push({ path: '/login', label: 'Login' })
      links.push({ path: '/register', label: 'Register' })
    } else {
      links.push({ path: '/profile', label: 'Profile' })
      links.push({ path: '/logout', label: 'Logout', isAction: true })
    }

    return links
  }, [user])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <RentNestLogo size={36} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => 
              link.isAction ? (
                <button
                  key={link.path}
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navLinks.map((link) => 
                link.isAction ? (
                  <button
                    key={link.path}
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

