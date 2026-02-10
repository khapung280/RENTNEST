import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, UserCheck, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services/authService'

// Register Page - Clean, professional SaaS style
const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'renter'
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Basic validation (UI only, no backend)
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      // Call backend API
      handleRegister()
    } else {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        accountType: formData.role
      });

      if (response.success) {
        // Store token and user data
        authService.setAuth(response.token, response.user);
        
        // Redirect based on account type
        if (response.user.accountType === 'owner') {
          navigate('/owner-dashboard');
        } else if (response.user.accountType === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/'); // Renter goes to home
        }
      } else {
        setErrors({ general: response.message || 'Registration failed. Please try again.' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Register error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Backend returned an error
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          // Validation error or user exists
          if (data.errors && Array.isArray(data.errors)) {
            // Multiple validation errors
            const errorList = data.errors.map(err => `• ${err.msg || err.message}`).join('\n');
            errorMessage = `${data.message || 'Validation failed'}\n\n${errorList}`;
          } else {
            errorMessage = data.message || 'Validation failed. Please check your input.';
          }
        } else if (status === 500) {
          // Server error - show detailed error in development
          const devError = data.error || error.message;
          errorMessage = `${data.message || 'Server error during registration'}\n\n${devError ? `Error: ${devError}` : 'Please check if MongoDB is running and backend is connected.'}`;
        } else {
          errorMessage = data.message || errorMessage;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = '❌ Unable to connect to server.\n\nPlease ensure:\n1. Backend server is running\n2. The API URL (VITE_API_URL) is configured correctly\n3. MongoDB is running';
      } else {
        // Something else happened
        errorMessage = `Connection error: ${error.message}`;
      }
      
      setErrors({ general: errorMessage });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Registration Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1.5">
              Create your account
            </h1>
            <p className="text-sm text-gray-600">
              Join RentNest to find your next home or list your property
            </p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 whitespace-pre-line">{errors.general}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Full Name <span className="text-gray-500 font-normal">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm transition-all ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address <span className="text-gray-500 font-normal">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm transition-all ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {!errors.email && formData.email && (
                <p className="mt-1.5 text-xs text-gray-500">
                  We'll use this to send you booking confirmations
                </p>
              )}
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password <span className="text-gray-500 font-normal">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm transition-all ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!errors.password && formData.password && formData.password.length >= 8 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Password strength: Good
                </p>
              )}
              {!errors.password && formData.password && formData.password.length > 0 && formData.password.length < 8 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Use at least 8 characters for a stronger password
                </p>
              )}
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password <span className="text-gray-500 font-normal">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm transition-all ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Passwords match
                </p>
              )}
              {!errors.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && formData.password.length > 0 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Make sure both passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                I want to
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'renter' }))}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    formData.role === 'renter'
                      ? 'border-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <User className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formData.role === 'renter' ? 'text-gray-900' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${formData.role === 'renter' ? 'text-gray-900' : 'text-gray-700'}`}>
                          Renter
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Looking for a place to rent
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'owner' }))}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    formData.role === 'owner'
                      ? 'border-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <UserCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${formData.role === 'owner' ? 'text-gray-900' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${formData.role === 'owner' ? 'text-gray-900' : 'text-gray-700'}`}>
                          Property Owner
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Listing a property for rent
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-medium hover:text-gray-700 transition-colors">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

