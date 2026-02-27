/**
 * PropertyMap — Google Map + Nearby Places (1km)
 *
 * Requires GoogleMapsProvider as parent. Assumes Google API already loaded.
 * No useJsApiLoader — use <GoogleMapsProvider><PropertyMap /></GoogleMapsProvider>
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { MapPin, Star, Loader2, Utensils, Building2, School, Building, ShoppingBag } from 'lucide-react'

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '320px' }
const NEARBY_TYPES = ['restaurant', 'hospital', 'school', 'atm', 'store']
const MAX_RESULTS = 8

const typeIconMap = {
  restaurant: Utensils,
  hospital: Building2,
  school: School,
  atm: Building,
  store: ShoppingBag
}

function getTypeIcon(type) {
  return typeIconMap[type] || Building
}

export default function PropertyMap({ property, onOpenInMaps }) {
  const mapRef = useRef(null)
  const fetchIdRef = useRef(0)
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState(null)

  const lat = property?.latitude
  const lng = property?.longitude
  const hasCoords = lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
  const position = hasCoords ? { lat: Number(lat), lng: Number(lng) } : null

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    console.log('[PropertyMap] Map loaded, instance:', !!map)
  }, [])

  // Guard: API must be loaded by GoogleMapsProvider
  if (typeof window !== 'undefined' && !window.google) {
    console.warn('[PropertyMap] window.google not available. Ensure PropertyMap is wrapped in GoogleMapsProvider.')
    return null
  }

  // Fetch nearby places when coords and API are ready
  useEffect(() => {
    if (!hasCoords || !window.google?.maps?.places) return

    const places = window.google.maps.places

    const currentFetchId = ++fetchIdRef.current
    setNearbyLoading(true)
    setNearbyError(null)

    const serviceDiv = document.createElement('div')
    const service = new places.PlacesService(serviceDiv)

    console.log('[PropertyMap] PlacesService created, fetching nearby...', { lat, lng })

    const allResults = []
    let completed = 0

    const Status = window.google.maps.places.PlacesServiceStatus
    const handleCallback = (results, status) => {
      const statusOk = status === Status?.OK || status === 'OK'

      if (status === (Status?.REQUEST_DENIED ?? 'REQUEST_DENIED')) {
        console.warn('[PropertyMap] Places API REQUEST_DENIED. Enable Places API and check key restrictions.')
        setNearbyError('Places API not enabled or key restricted incorrectly.')
      }
      if (status === (Status?.OVER_QUERY_LIMIT ?? 'OVER_QUERY_LIMIT')) {
        setNearbyError('Places API quota exceeded. Check billing.')
      }

      if (statusOk && Array.isArray(results)) {
        results.forEach((place) => {
          if (place?.name) {
            allResults.push({
              name: place.name,
              rating: place.rating ?? null,
              vicinity: place.vicinity || '',
              type: place.types?.[0] || 'store'
            })
          }
        })
      }

      completed++
      if (completed === NEARBY_TYPES.length) {
        if (currentFetchId !== fetchIdRef.current) return

        const deduped = allResults
          .filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i)
          .slice(0, MAX_RESULTS)

        console.log('[PropertyMap] Nearby places fetched:', deduped.length, deduped)

        setNearbyPlaces(deduped)
        setNearbyLoading(false)
      }
    }

    NEARBY_TYPES.forEach((type) => {
      service.nearbySearch(
        { location: { lat: Number(lat), lng: Number(lng) }, radius: 1000, type },
        handleCallback
      )
    })

    const timeout = setTimeout(() => {
      if (currentFetchId === fetchIdRef.current && completed < NEARBY_TYPES.length) {
        setNearbyLoading(false)
        if (allResults.length > 0) {
          const deduped = allResults
            .filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i)
            .slice(0, MAX_RESULTS)
          setNearbyPlaces(deduped)
        }
      }
    }, 8000)

    return () => {
      clearTimeout(timeout)
      if (currentFetchId === fetchIdRef.current) {
        setNearbyPlaces([])
      }
    }
  }, [lat, lng, hasCoords])

  if (!hasCoords) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-8 h-8 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-300 font-medium">Exact location not available.</p>
            <p className="text-sm text-gray-500 mt-1">
              Coordinates were not set for this property. Contact the owner for the address.
            </p>
            {property?.location && onOpenInMaps && (
              <button
                type="button"
                onClick={() => onOpenInMaps()}
                className="mt-3 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 rounded-lg text-sm"
              >
                Search &quot;{property.location}&quot; in Google Maps
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-6">
        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-3 block" />
        <p className="text-gray-300 text-center">Coordinates: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</p>
        {onOpenInMaps && (
          <button
            type="button"
            onClick={() => onOpenInMaps()}
            className="mt-3 w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium"
          >
            View in Google Maps
          </button>
        )}
        <p className="text-xs text-gray-500 mt-3 text-center">Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map — API loaded by GoogleMapsProvider */}
      <div className="rounded-xl overflow-hidden border border-neutral-700">
        <div className="aspect-video w-full">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={position}
            zoom={15}
            onLoad={onMapLoad}
            options={{
              mapTypeControl: true,
              fullscreenControl: true,
              streetViewControl: true
            }}
          >
            <Marker position={position} />
          </GoogleMap>
        </div>
        <p className="text-xs text-gray-500 px-4 py-2 bg-neutral-800/50">
          Property at {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
        </p>
        {onOpenInMaps && (
          <button
            type="button"
            onClick={() => onOpenInMaps()}
            className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 font-medium"
          >
            Open in Google Maps →
          </button>
        )}
      </div>

      {/* Nearby Places (1km) */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Nearby Places (1km)</h3>
        {nearbyLoading && (
          <div className="flex items-center gap-2 text-gray-400 py-6" role="status">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span className="text-sm">Loading nearby places...</span>
          </div>
        )}
        {nearbyError && !nearbyLoading && (
          <p className="text-sm text-amber-500 py-4">Nearby places unavailable. {nearbyError}</p>
        )}
        {!nearbyLoading && !nearbyError && nearbyPlaces.length === 0 && (
          <p className="text-sm text-gray-500 py-4">No nearby places found within 1 km.</p>
        )}
        {!nearbyLoading && nearbyPlaces.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyPlaces.map((place, index) => {
              const IconComponent = getTypeIcon(place.type)
              return (
                <div
                  key={`${place.name}-${index}`}
                  className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{place.name}</p>
                      {place.vicinity && (
                        <p className="text-xs text-gray-500 truncate mt-0.5" title={place.vicinity}>
                          {place.vicinity}
                        </p>
                      )}
                      {place.rating != null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-400">{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
