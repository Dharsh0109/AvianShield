import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Airport } from '../services/api'

interface AirportRisk {
  airport:   Airport
  riskLevel: string | null
  prob:      number | null
}

interface Props { airports: AirportRisk[] }

const riskColour = (level: string | null) =>
  level === 'High' ? '#f87171' : level === 'Medium' ? '#fbbf24' : '#34d399'

export default function MapPanel({ airports }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden glass" style={{ height: 380 }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {airports.map(({ airport, riskLevel, prob }) => (
          <CircleMarker
            key={airport.airport_id}
            center={[airport.latitude, airport.longitude]}
            radius={12}
            pathOptions={{
              color:       riskColour(riskLevel),
              fillColor:   riskColour(riskLevel),
              fillOpacity: 0.75,
              weight:      2,
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{airport.airport_code} — {airport.airport_name}</p>
                <p className="text-slate-500 mt-1">Risk: <span className="font-semibold text-slate-700">{riskLevel ?? 'Unknown'}</span></p>
                <p className="text-slate-500">Probability: <span className="font-semibold text-slate-700">{prob !== null ? `${(prob * 100).toFixed(1)}%` : '—'}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
