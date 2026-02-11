// ============================================
// MAIN APP COMPONENT
// ============================================
// This is the main file that controls which page shows
// It sets up all the routes (URLs) for different pages

// Import React Router for navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom'

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
import PropertyDetail from './pages/PropertyDetail'  // Property details
import Booking from './pages/Booking'            // Booking page
import MyBookings from './pages/MyBookings'      // My bookings
import Profile from './pages/Profile'            // Profile page
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

// Main App function
function App() {
  console.log('📱 App component rendering...')
  
  return (
    // BrowserRouter enables page navigation without reloading
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white">
        
        {/* Navbar - shows on every page at top */}
        <Navbar />
        
        {/* Main content area - different pages show here */}
        <main className="flex-grow">
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
            <Route path="/my-bookings" element={<MyBookings />} />
            
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

