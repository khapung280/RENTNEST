import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import RentNestLogo from './RentNestLogo'

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div>
            <div className="mb-6">
              <RentNestLogo size={40} />
            </div>
            <p className="text-surface-400 text-sm leading-relaxed max-w-sm">
              RentNest is a flexible rental platform designed for short-term and long-term stays.
              We connect renters with verified properties, offering fair pricing and secure bookings.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-6 text-white">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/houses', label: 'Houses' },
                { to: '/flats-apartments', label: 'Flats & Apartments' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-surface-400 hover:text-primary-400 text-sm font-medium transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-6 text-white">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-surface-400 text-sm">
                <Mail size={18} className="text-primary-400 flex-shrink-0" />
                info@rentnest.com
              </li>
              <li className="flex items-center gap-3 text-surface-400 text-sm">
                <Phone size={18} className="text-primary-400 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-3 text-surface-400 text-sm">
                <MapPin size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
                123 Rental Street, City, State 12345
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-12 pt-8 text-center">
          <p className="text-surface-500 text-sm">
            &copy; {new Date().getFullYear()} RentNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
