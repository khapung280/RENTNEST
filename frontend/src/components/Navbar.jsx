import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getCurrentUser, isAuthenticated } from '../utils/auth'
import RentNestLogo from './RentNestLogo'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const loadUser = () => {
      if (isAuthenticated()) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (e) {
            setUser(getCurrentUser())
          }
        } else {
          setUser(getCurrentUser())
        }
      } else {
        setUser(null)
      }
    }
    loadUser()
    const handleStorageChange = () => loadUser()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [location])

  const navLinks = useMemo(() => {
    const links = [
      { path: '/', label: 'Home' },
      { path: '/houses', label: 'Houses' },
      { path: '/flats-apartments', label: 'Flats & Apartments' },
      { path: '/about', label: 'About Us' },
      { path: '/messages', label: 'Messages' },
    ]
    if (user?.accountType === 'owner') {
      links.push({ path: '/owner-dashboard', label: 'Owner Dashboard' })
    }
    if (user?.accountType === 'admin') {
      links.push({ path: '/admin-dashboard', label: 'Admin Dashboard' })
    }
    if (!isAuthenticated()) {
      links.push({ path: '/login', label: 'Login' })
      links.push({ path: '/register', label: 'Register' })
    } else {
      links.push({ path: '/profile', label: 'Profile' })
      links.push({ path: '/logout', label: 'Logout', isAction: true })
    }
    return links
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'text-primary-400 bg-primary-500/20'
        : 'text-gray-300 hover:text-primary-400 hover:bg-white/5'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-neutral-900 backdrop-blur-xl border-b border-neutral-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Link to="/" className="flex items-center transition-opacity hover:opacity-90">
            <RentNestLogo size={36} variant="dark" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isAction ? (
                <button
                  key={link.path}
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={linkClass(link.path)}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.isAction ? (
                  <button
                    key={link.path}
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:bg-white/5"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium ${linkClass(link.path)}`}
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
