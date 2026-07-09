"use client"

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DUMMY_BUSINESSES = [
  { id: 1, name: "Oceanic Fish Sellers", lat: -1.2921, lng: 36.8219 },
  { id: 2, name: "Global Seafood Hub", lat: 51.5074, lng: -0.1278 },
  { id: 3, name: "Nippon Fresh Fish", lat: 35.6762, lng: 139.6503 },
  { id: 4, name: "LatAm Fish Markets", lat: -23.5505, lng: -46.6333 },
  { id: 5, name: "Nordic Catch", lat: 59.3293, lng: 18.0686 },
]

export default function LandingMap() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "#f06135" }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={3} 
        scrollWheelZoom={false} 
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "transparent", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.7}
        />
        {DUMMY_BUSINESSES.map(biz => (
          <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={customIcon}>
            <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent={false}>
              <div style={{ fontWeight: "bold", color: "#1f2937", padding: "4px" }}>{biz.name}</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
