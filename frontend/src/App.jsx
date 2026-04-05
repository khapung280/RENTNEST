// ============================================
// MAIN APP COMPONENT
// ============================================
// This is the main file that controls which page shows
// It sets up all the routes (URLs) for different pages

// Import React Router for navigation
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Import components that appear on every page
import Navbar from './components/Navbar'        // Top navigation bar
import Footer from './components/Footer'          // Bottom footer
import ProtectedRoute from './components/ProtectedRoute'  // Checks if user is logged in

// Import all page components
import Home from './pages/Home'                  // Homepage
import About from './pages/About'                 // About page
import HousePage from './pages/HousePage'        // Houses page
import FlatsApartmentsPage from './pages/FlatsApartmentsPage'  // Flats page
import Login from './pages/Login'                // Login page
import Register from './pages/Register'          // Register page
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
import Booking from './pages/Booking'            // Booking page
import MyBookings from './pages/MyBookings'      // My bookings
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import PaymentKhaltiReturn from './pages/PaymentKhaltiReturn'
import Profile from './pages/Profile'            // Profile page
import UserPublicProfile from './pages/UserPublicProfile'
import OwnerDashboard from './pages/OwnerDashboard'  // Owner dashboard
import AddProperty from './pages/AddProperty'    // Add property
import OwnerBookings from './pages/OwnerBookings'  // Owner bookings
import Admin from './pages/Admin'                      // Admin dashboard (/admin)
import AdminDashboard from './pages/AdminDashboard'  // Admin dashboard (legacy)
import AdminUsers from './pages/admin/AdminUsers'    // Admin users
import AdminProperties from './pages/admin/AdminProperties'  // Admin properties
import AdminReports from './pages/admin/AdminReports'  // Admin reports
import AIChatbot from './components/AIChatbot'  // AI chatbot (on all pages)
import Messages from './pages/Messages'          // Messages page
import { getRoleFromToken } from './utils/auth'

/** Admins use the admin dashboard, not renter "My bookings". */
function RenterMyBookingsRoute() {
  if (getRoleFromToken() === 'admin') {
    return <Navigate to="/admin-dashboard" replace />
  }
  return <MyBookings />
}

// Main App function
function App() {
  return (
    // BrowserRouter enables page navigation without reloading
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex min-h-screen flex-col bg-white">
        {/* Navbar - shows on every page at top */}
        <Navbar />

        {/* flex-1 + min-h-0 lets admin shell fill viewport below nav without footer overlap */}
        <main className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>}>
          <Routes>
            
            {/* PUBLIC ROUTES - Anyone can visit */}
            <Route path="/" element={<Home />} />                    {/* Homepage */}
            <Route path="/about" element={<About />} />               {/* About */}
            <Route path="/houses" element={<HousePage />} />          {/* Houses */}
            <Route path="/flats-apartments" element={<FlatsApartmentsPage />} />  {/* Flats */}
            <Route path="/login" element={<Login />} />               {/* Login */}
            <Route path="/register" element={<Register />} />         {/* Register */}
            <Route path="/property/:id" element={<PropertyDetail />} />  {/* Property details - :id is property ID */}
            <Route path="/booking/:id" element={<Booking />} />      {/* Booking - :id is property ID */}
            
            {/* PROTECTED ROUTES - Must be logged in */}
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/user/:id" element={<UserPublicProfile />} />
            <Route path="/my-bookings" element={<ProtectedRoute><RenterMyBookingsRoute /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
            <Route path="/payment/khalti-return" element={<ProtectedRoute><PaymentKhaltiReturn /></ProtectedRoute>} />
            
            {/* OWNER ROUTES - Must be logged in as owner */}
            <Route path="/owner-dashboard" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner-dashboard/add-property" element={<ProtectedRoute requiredRole="owner"><AddProperty /></ProtectedRoute>} />
            <Route path="/owner-dashboard/bookings" element={<ProtectedRoute requiredRole="owner"><OwnerBookings /></ProtectedRoute>} />
            
            {/* ADMIN ROUTES - Must be logged in as admin */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin-dashboard/properties" element={<ProtectedRoute requiredRole="admin"><AdminProperties /></ProtectedRoute>} />
            <Route path="/admin-dashboard/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
            
          </Routes>
          </Suspense>
        </main>
        
        {/* Footer - shows on every page at bottom */}
        <Footer />
        
        {/* AI Chatbot - floating button on all pages */}
        <AIChatbot />
        
      </div>
    </BrowserRouter>
  )
}

export default App

