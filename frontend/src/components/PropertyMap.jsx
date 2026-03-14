import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

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

export default function PropertyMap({ lat, lng }) {
  const hasValidCoords =
    lat != null &&
    lng != null &&
    !isNaN(Number(lat)) &&
    !isNaN(Number(lng))

  if (!hasValidCoords) return null

  const position = [Number(lat), Number(lng)]

  return (
    <div className="w-full h-[400px] rounded-[10px] overflow-hidden border border-neutral-700">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: 400 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>RentNest Property Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
