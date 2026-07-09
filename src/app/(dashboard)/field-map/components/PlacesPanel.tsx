"use client";

import React, { useState } from "react";
import { useFieldMap, PlaceResult, FieldAccount } from "../context/FieldMapContext";
import { SearchIcon, MapPin, Building2, Utensils, GraduationCap, Building, Pill, Bed, Crosshair, Download, Upload, Plus } from "lucide-react";

export function PlacesPanel() {
  const { state, dispatch } = useFieldMap();
  const [query, setQuery] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    dispatch({ type: "SET_SEARCHING_PLACES", isSearching: true });
    dispatch({ type: "SET_PLACES_QUERY", query });

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=15`);
      const data = await res.json();
      
      const results: PlaceResult[] = data.map((d: any) => ({
        id: `place-${d.place_id}`,
        name: d.name || d.display_name.split(',')[0],
        displayName: d.display_name,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
        type: d.type,
        category: d.class
      }));

      dispatch({ type: "SET_PLACE_RESULTS", results });
    } catch (error) {
      console.error("Place search failed", error);
    } finally {
      dispatch({ type: "SET_SEARCHING_PLACES", isSearching: false });
    }
  };

  const addAsLead = (place: PlaceResult) => {
    const newAccount: FieldAccount = {
      id: `acc-${Date.now()}`,
      name: place.name,
      company: place.name,
      phone: "",
      email: "",
      salesYTD: 0,
      nextStep: "phone call",
      nextStepDate: new Date().toISOString().split('T')[0],
      daysSinceVisit: 0,
      salesStage: "1 - Lead",
      priority: "Medium",
      lat: place.lat,
      lng: place.lng,
      address: place.displayName,
      businessType: place.type,
      notes: ["Imported from Places Search"],
      photos: [],
      createdAt: new Date().toISOString()
    };

    dispatch({ type: "ADD_ACCOUNT", account: newAccount });
    // Switch to accounts tab and select the new account
    dispatch({ type: "SET_ACTIVE_TAB", tab: "accounts" });
    dispatch({ type: "SET_SELECTED_ACCOUNT", account: newAccount });
  };

  const centerOnMap = (place: PlaceResult) => {
    dispatch({ type: "SET_MAP_VIEW", center: [place.lat, place.lng], zoom: 16 });
  };

  const quickCategories = [
    { name: "Hospital", icon: <Building2 size={16} /> },
    { name: "Restaurant", icon: <Utensils size={16} /> },
    { name: "School", icon: <GraduationCap size={16} /> },
    { name: "Bank", icon: <Building size={16} /> },
    { name: "Pharmacy", icon: <Pill size={16} /> },
    { name: "Hotel", icon: <Bed size={16} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Places & Leads</h2>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} style={{ padding: "0.5rem", borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", background: "#f9f9f9" }}>
        <input 
          type="text" 
          placeholder="Search OSM (e.g., Starbucks Nairobi)" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0.5rem" }} 
        />
        {state.isSearchingPlaces ? (
          <div style={{ width: "18px", height: "18px", border: "2px solid #888", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        ) : (
          <button type="submit" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <SearchIcon size={18} color="#888" />
          </button>
        )}
      </form>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Territories from Data */}
        {!state.placeResults.length && !state.isSearchingPlaces && state.territoryList.length > 0 && (
          <div style={{ padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Known Territories</span>
              <span style={{ fontSize: "0.65rem", background: "#e2e8f0", padding: "0.1rem 0.4rem", borderRadius: "10px" }}>{state.territoryList.length}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxHeight: "150px", overflowY: "auto", paddingBottom: "0.5rem" }}>
              {state.territoryList.map(t => (
                <button
                  key={t.name}
                  onClick={() => {
                    dispatch({ type: "SET_MAP_VIEW", center: [t.centerLat, t.centerLng], zoom: 14 });
                  }}
                  title={`${t.accountCount} accounts`}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.6rem", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", color: "#334155" }}
                >
                  <MapPin size={12} color="#0f766e" /> {t.name} ({t.accountCount})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Search Tags */}
        {!state.placeResults.length && !state.isSearchingPlaces && (
          <div style={{ padding: "1rem", paddingTop: state.territoryList.length > 0 ? "0" : "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Quick Search OSM</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {quickCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { setQuery(cat.name); setTimeout(() => handleSearch(), 0); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", background: "white", border: "1px solid #ddd", borderRadius: "20px", fontSize: "0.85rem", cursor: "pointer", color: "#555" }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Lead Generation Tools</div>
              
              <button style={{ width: "100%", padding: "0.8rem", background: "white", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "4px", marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
                <Crosshair size={18} /> Find Nearby Prospects
              </button>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button style={{ flex: 1, padding: "0.6rem", background: "white", border: "1px solid #ddd", color: "#555", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", cursor: "pointer" }}>
                  <Upload size={16} /> Import
                </button>
                <button style={{ flex: 1, padding: "0.6rem", background: "white", border: "1px solid #ddd", color: "#555", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", cursor: "pointer" }}>
                  <Download size={16} /> Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {state.placeResults.map((place) => (
          <div key={place.id} style={{ padding: "1rem", borderBottom: "1px solid #eee", background: "white" }}>
            <div style={{ fontWeight: "bold", fontSize: "0.95rem", marginBottom: "0.2rem" }}>{place.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {place.displayName}
            </div>
            <div style={{ display: "inline-block", background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "4px", marginBottom: "0.8rem" }}>
              {place.category} • {place.type}
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={() => centerOnMap(place)}
                style={{ flex: 1, padding: "0.4rem", background: "white", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.8rem", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
              >
                <MapPin size={14} /> Map
              </button>
              <button 
                onClick={() => addAsLead(place)}
                style={{ flex: 1, padding: "0.4rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
              >
                <Plus size={14} /> Add Lead
              </button>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
