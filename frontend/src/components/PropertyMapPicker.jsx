import { useState, useCallback, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

const KATHMANDU_CENTER = [27.7172, 85.324]
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Fix default marker icon path (required for Vite/bundlers)
if (typeof window !== 'undefined') {
  try {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  } catch (_) { /* ignore */ }
}

async function searchAddress(query) {
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: 1,
  })
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'RentNest/1.0 (Property location picker)',
    },
  })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data
}

function MapCenterUpdater({ center, onFlied }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 15, { duration: 1 })
      onFlied?.()
    }
  }, [center, map, onFlied])
  return null
}

function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    },
  })

  if (!position) return null

  return (
    <Marker position={position}>
      <Popup>Selected Property Location</Popup>
    </Marker>
  )
}

export default function PropertyMapPicker({ lat, lng, onLocationSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [lastSearchCenter, setLastSearchCenter] = useState(null)

  const hasPosition =
    lat != null && lng != null &&
    lat !== '' && lng !== '' &&
    !isNaN(Number(lat)) && !isNaN(Number(lng))
  const position = hasPosition ? [Number(lat), Number(lng)] : null

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchError('Please enter an address to search')
      return
    }

    setSearchError('')
    setSearchLoading(true)
    try {
      const results = await searchAddress(query)
      if (!results || results.length === 0) {
        setSearchError('No results found. Try a different address or search term.')
        return
      }
      const first = results[0]
      const latNum = parseFloat(first.lat)
      const lngNum = parseFloat(first.lon)
      if (isNaN(latNum) || isNaN(lngNum)) {
        setSearchError('Invalid coordinates from search')
        return
      }
      setLastSearchCenter([latNum, lngNum])
      onLocationSelect(latNum, lngNum)
    } catch (err) {
      setSearchError(err?.message || 'Search failed. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }, [searchQuery, onLocationSelect])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Search Bar */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          Search Property Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="e.g., Thamel, Kathmandu"
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-500"
            disabled={searchLoading}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {searchError && (
          <p className="mt-1.5 text-sm text-red-600">{searchError}</p>
        )}
      </div>

      {/* Map */}
      <div className="w-full h-[400px] rounded-[10px] overflow-hidden border border-gray-300" style={{ minHeight: 400 }}>
        <MapContainer
          center={position || KATHMANDU_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
          style={{ minHeight: 400 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={lastSearchCenter} onFlied={() => setLastSearchCenter(null)} />
          <LocationMarker position={position} onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
    </div>
  )
}
