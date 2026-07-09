"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search } from "lucide-react";

// Fix Leaflet's default icon path issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function MapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState<[number, number]>([-1.2921, 36.8219]); // Default Nairobi

  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      setCenter([lat, lng]);
    }
  }, [lat, lng]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setCenter([newLat, newLng]);
        onChange(newLat, newLng); // Drop pin at search result
      } else {
        alert("Location not found.");
      }
    } catch (e) {
      console.error(e);
      alert("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search location (e.g., Nairobi, CBD)" 
          style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
        />
        <button 
          onClick={handleSearch} 
          disabled={searching}
          type="button"
          style={{ padding: "0 1rem", background: "#3b82f6", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Search size={18} /> {searching ? "..." : "Search"}
        </button>
      </div>
      
      <div style={{ height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1", zIndex: 1 }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} />
          <MapEvents onChange={onChange} />
          {lat !== 0 && lng !== 0 && (
            <Marker position={[lat, lng]} />
          )}
        </MapContainer>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Click anywhere on the map to drop a pin and capture coordinates.</p>
    </div>
  );
}
