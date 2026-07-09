"use client";

import React from "react";
import { useFieldMap, MapTileLayer } from "../context/FieldMapContext";

export function MapLayersPanel() {
  const { state, dispatch } = useFieldMap();
  const { mapSettings } = state;

  const handleTileChange = (layer: MapTileLayer) => {
    dispatch({ type: "SET_MAP_SETTINGS", settings: { tileLayer: layer } });
  };

  const handleToggle = (key: keyof typeof mapSettings) => {
    dispatch({ type: "SET_MAP_SETTINGS", settings: { [key]: !mapSettings[key] } });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_MAP_SETTINGS", settings: { radiusSearchKm: parseInt(e.target.value) } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Map Layers</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        
        {/* Base Map Style */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Base Map Style</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            <TileCard 
              name="Street" 
              active={mapSettings.tileLayer === "street"} 
              onClick={() => handleTileChange("street")}
              bg="#e5e7eb"
            />
            <TileCard 
              name="Satellite" 
              active={mapSettings.tileLayer === "satellite"} 
              onClick={() => handleTileChange("satellite")}
              bg="#1f2937"
              color="white"
            />
            <TileCard 
              name="Dark" 
              active={mapSettings.tileLayer === "dark"} 
              onClick={() => handleTileChange("dark")}
              bg="#0f172a"
              color="#cbd5e1"
            />
            <TileCard 
              name="Terrain" 
              active={mapSettings.tileLayer === "terrain"} 
              onClick={() => handleTileChange("terrain")}
              bg="#dcfce7"
            />
          </div>
        </div>

        {/* Overlays */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Overlays</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ToggleRow label="Marker Clustering" checked={mapSettings.showClustering} onChange={() => handleToggle("showClustering")} />
            <ToggleRow label="Route Polylines" checked={mapSettings.showRoutePolyline} onChange={() => handleToggle("showRoutePolyline")} />
            <ToggleRow label="Heat Map (Density)" checked={mapSettings.showHeatmap} onChange={() => handleToggle("showHeatmap")} />
            <ToggleRow label="Territory Boundaries" checked={mapSettings.showTerritories} onChange={() => handleToggle("showTerritories")} />
            <ToggleRow label="Live Traffic" checked={mapSettings.showTraffic} onChange={() => handleToggle("showTraffic")} />
          </div>
        </div>

        {/* Radius Search Tool */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem", display: "flex", justifyContent: "space-between" }}>
            <span>Radius Search Tool</span>
            <Toggle checked={mapSettings.showRadiusSearch} onChange={() => handleToggle("showRadiusSearch")} />
          </h3>
          
          <div style={{ opacity: mapSettings.showRadiusSearch ? 1 : 0.5, pointerEvents: mapSettings.showRadiusSearch ? "auto" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#666", marginBottom: "0.5rem" }}>
              <span>Radius</span>
              <span>{mapSettings.radiusSearchKm} km</span>
            </div>
            <input 
              type="range" 
              min="1" max="50" 
              value={mapSettings.radiusSearchKm} 
              onChange={handleRadiusChange}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
            <button style={{ width: "100%", padding: "0.6rem", background: "white", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
              Center on Map View
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function TileCard({ name, active, onClick, bg, color = "#333" }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        height: "80px", 
        background: bg, 
        color: color,
        borderRadius: "6px", 
        display: "flex", 
        alignItems: "flex-end", 
        padding: "0.5rem", 
        fontSize: "0.8rem", 
        fontWeight: "bold",
        cursor: "pointer",
        border: active ? "3px solid #3b82f6" : "3px solid transparent",
        boxShadow: active ? "0 4px 6px -1px rgba(59, 130, 246, 0.3)" : "0 1px 3px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative map lines */}
      <div style={{ position: "absolute", top: 10, left: 10, width: "100%", height: "2px", background: "rgba(128,128,128,0.2)", transform: "rotate(15deg)" }} />
      <div style={{ position: "absolute", top: 30, left: 10, width: "100%", height: "2px", background: "rgba(128,128,128,0.2)", transform: "rotate(-25deg)" }} />
      
      <span style={{ position: "relative", zIndex: 1 }}>{name}</span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.9rem", color: "#333" }}>{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }: any) {
  return (
    <div 
      onClick={onChange}
      style={{ 
        width: "40px", height: "20px", 
        background: checked ? "#22c55e" : "#cbd5e1", 
        borderRadius: "10px", 
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
    >
      <div style={{ 
        width: "16px", height: "16px", 
        background: "white", 
        borderRadius: "50%", 
        position: "absolute", 
        top: "2px", 
        left: checked ? "22px" : "2px",
        transition: "left 0.2s",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
      }} />
    </div>
  );
}
