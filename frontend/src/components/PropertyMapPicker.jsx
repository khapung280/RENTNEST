import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

const KATHMANDU_CENTER = [27.7172, 85.324]

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
  const hasPosition =
    lat != null && lng != null &&
    lat !== '' && lng !== '' &&
    !isNaN(Number(lat)) && !isNaN(Number(lng))
  const position = hasPosition ? [Number(lat), Number(lng)] : null

  return (
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
        <LocationMarker position={position} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  )
}
