import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import RentNestLogo from './RentNestLogo'

/**
 * Shared three-column footer (brand, quick links, contact + copyright).
 * @param {string} footerClassName — e.g. mt-24 (public) or shrink-0 (admin shell)
 */
const MarketingFooter = ({ footerClassName = '' }) => {
  return (
    <footer className={`border-t border-neutral-800 bg-neutral-900 text-white ${footerClassName}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
          <div>
            <div className="mb-6">
              <RentNestLogo size={40} variant="dark" />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              RentNest is a flexible rental platform designed for short-term and long-term stays. We
              connect renters with verified properties, offering fair pricing and secure bookings.
            </p>
          </div>

          <div>
            <h3 className="font-display mb-6 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/houses', label: 'Houses' },
                { to: '/flats-apartments', label: 'Flats & Apartments' }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-primary-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-6 text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@rentnest.com"
                  className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-primary-400"
                >
                  <Mail size={18} className="flex-shrink-0 text-primary-400" />
                  info@rentnest.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-primary-400"
                >
                  <Phone size={18} className="flex-shrink-0 text-primary-400" />
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary-400" />
                <span>123 Rental Street, City, State 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RentNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default MarketingFooter
