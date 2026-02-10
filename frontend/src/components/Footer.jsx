import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import RentNestLogo from './RentNestLogo'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* RentNest Column */}
          <div>
            <div className="mb-4">
              <RentNestLogo size={40} />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              RentNest is a flexible rental platform designed for short-term and long-term stays. 
              We connect renters with verified properties, offering fair pricing and secure bookings 
              for your perfect stay.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/houses"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-300 text-sm">
                <Mail size={18} className="text-blue-400" />
                <span>info@rentnest.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300 text-sm">
                <Phone size={18} className="text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-gray-300 text-sm">
                <MapPin size={18} className="text-blue-400 mt-0.5" />
                <span>123 Rental Street, City, State 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} RentNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

