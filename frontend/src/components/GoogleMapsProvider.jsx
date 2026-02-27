/**
 * GoogleMapsProvider — Single source of truth for Google Maps JavaScript API
 *
 * Loads the API ONCE for the entire app. Use this to wrap any component that
 * needs Google Maps or Places API. Prevents "Loader must not be called again
 * with different options" errors.
 */
import { useJsApiLoader } from '@react-google-maps/api'
import { Loader2 } from 'lucide-react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

if (!API_KEY && typeof window !== 'undefined') {
  console.warn(
    '[GoogleMapsProvider] VITE_GOOGLE_MAPS_API_KEY is missing. Add it to frontend/.env. ' +
    'Maps and Places will not work. See docs/GOOGLE_MAPS_SETUP.md for setup.'
  )
}

function getLoadErrorMsg(loadError) {
  if (!loadError) return null
  const msg = loadError.message || String(loadError)
  if (msg.includes('ApiNotActivatedMapError') || msg.includes('referer')) {
    return 'Maps JavaScript API not enabled or API key restricted. Enable the API and check HTTP referrer restrictions in Google Cloud Console.'
  }
  if (msg.includes('InvalidKeyMapError')) {
    return 'Invalid API key. Check VITE_GOOGLE_MAPS_API_KEY in frontend/.env'
  }
  if (msg.includes('billing') || msg.includes('Billing')) {
    return 'Google Maps requires billing to be enabled. Enable billing in Google Cloud Console.'
  }
  return 'Failed to load Google Maps. Check your API key and network.'
}

export default function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-rentnest',
    googleMapsApiKey: API_KEY || 'no-key',
    libraries: ['places']
  })

  if (loadError) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-6">
        <p className="text-sm text-amber-500">{getLoadErrorMsg(loadError)}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-12 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="text-sm text-gray-400">Loading map...</span>
        </div>
      </div>
    )
  }

  return children
}
