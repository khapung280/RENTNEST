/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist: keep classes that are built dynamically (e.g. from functions or template literals)
  // so Tailwind does not purge them in production. JIT only sees static source strings.
  safelist: [
    // Status badges (OwnerDashboard, OwnerBookings, Admin, BookingCard, etc.)
    'bg-green-50', 'text-green-700', 'border-green-200', 'bg-green-100', 'text-green-800',
    'bg-red-50', 'text-red-700', 'border-red-200', 'bg-red-100', 'text-red-800',
    'bg-amber-50', 'text-amber-700', 'border-amber-200', 'bg-amber-100', 'text-amber-800',
    'bg-yellow-50', 'text-yellow-700', 'border-yellow-200',
    'bg-gray-50', 'text-gray-700', 'border-gray-200', 'bg-gray-100', 'text-gray-800',
    'bg-orange-100', 'text-orange-800', 'border-orange-200',
    'bg-blue-100', 'text-blue-800', 'border-blue-200',
    'bg-purple-100', 'text-purple-800', 'border-purple-200',
    'bg-emerald-100', 'text-emerald-800', 'border-emerald-200',
    // Confidence / Best-for colors (PropertyCardWithCompare, PropertyDetail)
    'bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-green-600', 'bg-yellow-600', 'bg-orange-600',
    'bg-blue-500', 'bg-blue-600', 'bg-violet-500', 'bg-purple-600', 'bg-indigo-600', 'bg-teal-500', 'bg-teal-600', 'bg-gray-600', 'bg-surface-500',
    'bg-primary-500',
    // FairFlex feature colors (feature.color.split(' ')[1] etc.)
    'text-red-600', 'bg-red-50', 'border-red-200', 'text-gray-600', 'bg-gray-50', 'border-gray-200', 'text-green-600', 'bg-green-50', 'border-green-200',
    // Form/error states (Login, Register, etc.)
    'text-red-400', 'text-gray-400',
    // Loader and other component classes passed as props
    'loader-wrapper',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'soft-xl': '0 20px 50px -12px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 1s linear infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        400: '400ms',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}
