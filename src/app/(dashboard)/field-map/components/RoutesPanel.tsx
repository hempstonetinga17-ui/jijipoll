"use client";

import React, { useState } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { optimizeRoute, exportRouteToGPX, generateRoutePrintHTML, suggestNearbyAccounts } from "../utils/routeOptimizer";
import { GripVertical, X, CheckCircle2, Navigation, MapPin, Sparkles, Download, FileText, ArrowUp, ArrowDown, Save, PenTool } from "lucide-react";

export function RoutesPanel() {
  const { state, dispatch } = useFieldMap();
  const [tab, setTab] = useState<"current" | "saved">("current");

  const handleOptimize = async () => {
    dispatch({ type: "SET_OPTIMIZING", isOptimizing: true });
    
    // Simulate network delay for effect
    await new Promise(r => setTimeout(r, 800));
    
    const result = optimizeRoute(state.routeStops, state.routeStartLocation, state.routeEndLocation);
    dispatch({ type: "REORDER_ROUTE", stops: result.stops });
    dispatch({ type: "SET_OPTIMIZING", isOptimizing: false });
  };

  const handleSaveRoute = () => {
    if (state.routeStops.length === 0) return;
    const name = prompt("Enter a name for this route:");
    if (!name) return;
    
    dispatch({ 
      type: "SAVE_ROUTE", 
      route: {
        id: `route-${Date.now()}`,
        name,
        stops: [...state.routeStops],
        createdAt: new Date().toISOString(),
        isRecurring: false,
      } 
    });
    alert("Route saved successfully!");
  };

  const handleExportGPX = () => {
    if (state.routeStops.length === 0) return;
    const xml = exportRouteToGPX(state.routeStops, "StampKE Optimized Route");
    const blob = new Blob([xml], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stampke-route.gpx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLasso = () => {
    dispatch({ type: "SET_LASSO_MODE", isLassoMode: !state.isLassoMode });
  };

  const handleRemove = (id: string) => {
    dispatch({ type: "REMOVE_ROUTE_STOP", id });
  };

  const handleToggleVisited = (id: string) => {
    dispatch({ type: "MARK_STOP_VISITED", id });
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= state.routeStops.length) return;
    const newStops = [...state.routeStops];
    const temp = newStops[index];
    newStops[index] = newStops[index + direction];
    newStops[index + direction] = temp;
    dispatch({ type: "REORDER_ROUTE", stops: newStops });
  };

  const visitedCount = state.routeStops.filter(s => s.visited).length;
  const progressPercent = state.routeStops.length ? Math.round((visitedCount / state.routeStops.length) * 100) : 0;
  
  // Calculate running totals
  const totalKm = state.routeStops.reduce((sum, s) => sum + (s.distanceKm || 0), 0);
  const totalMin = state.routeStops.reduce((sum, s) => sum + (s.estimatedArrivalMin || 0) + s.estimatedDurationMin, 0);

  // Suggestions
  const suggestions = state.routeStops.length > 0 
    ? suggestNearbyAccounts(state.routeStops, state.accounts) 
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Routes</h2>
      </div>

      <div style={{ padding: "0.5rem", display: "flex", background: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
        <button 
          onClick={() => setTab("current")}
          style={{ flex: 1, padding: "0.5rem", background: tab === "current" ? "#3b82f6" : "#eee", color: tab === "current" ? "white" : "#555", border: "1px solid #ddd", borderRadius: "4px 0 0 4px", fontWeight: tab === "current" ? "bold" : "normal", cursor: "pointer" }}
        >
          Current Route
        </button>
        <button 
          onClick={() => setTab("saved")}
          style={{ flex: 1, padding: "0.5rem", background: tab === "saved" ? "#3b82f6" : "#eee", color: tab === "saved" ? "white" : "#555", border: "1px solid #ddd", borderRadius: "0 4px 4px 0", fontWeight: tab === "saved" ? "bold" : "normal", cursor: "pointer" }}
        >
          Saved Routes
        </button>
      </div>

      {tab === "current" && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          {state.routeStops.length === 0 ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#888" }}>
              <Navigation size={32} style={{ opacity: 0.5, margin: "0 auto 1rem" }} />
              <p>Your route is empty.</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Select accounts from the map or list to add them to your route.</p>
            </div>
          ) : (
            <>
              {/* Summary & Actions */}
              <div style={{ padding: "1rem", background: "white", borderBottom: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#555" }}>
                  <span>{state.routeStops.length} Stops</span>
                  <span>{totalKm.toFixed(1)} km</span>
                  <span>{Math.floor(totalMin / 60)}h {Math.round(totalMin % 60)}m</span>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden", marginBottom: "1rem" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", background: "#22c55e", transition: "width 0.3s" }} />
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    onClick={handleOptimize}
                    disabled={state.isOptimizing || state.routeStops.length < 2}
                    style={{ flex: 1, padding: "0.6rem", background: state.isOptimizing ? "#93c5fd" : "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                  >
                    <Sparkles size={16} />
                    {state.isOptimizing ? "Optimizing..." : "Optimize"}
                  </button>
                  <button 
                    onClick={handleLasso}
                    style={{ padding: "0.6rem", background: state.isLassoMode ? "#fcd34d" : "#f1f5f9", color: state.isLassoMode ? "#92400e" : "#475569", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    title="Lasso Tool (Draw triangle to select)"
                  >
                    <PenTool size={16} />
                  </button>
                  <button 
                    onClick={handleSaveRoute}
                    disabled={state.routeStops.length === 0}
                    style={{ padding: "0.6rem", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    title="Save Route"
                  >
                    <Save size={16} />
                  </button>
                  <button 
                    onClick={handleExportGPX}
                    disabled={state.routeStops.length === 0}
                    style={{ padding: "0.6rem", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    title="Export GPX"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => dispatch({ type: "CLEAR_ROUTE" })}
                    style={{ padding: "0.6rem", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    title="Clear Route"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Stop List */}
              <div style={{ flex: 1, padding: "0.5rem" }}>
                {state.routeStops.map((stop, i) => (
                  <div key={stop.id} style={{ display: "flex", alignItems: "center", padding: "0.8rem", background: stop.visited ? "#f8fafc" : "white", border: "1px solid #e2e8f0", borderRadius: "6px", marginBottom: "0.5rem", opacity: stop.visited ? 0.6 : 1 }}>
                    
                    {/* Manual reorder controls */}
                    <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
                      <button onClick={() => moveStop(i, -1)} disabled={i === 0} style={{ border: "none", background: "none", padding: 0, cursor: i === 0 ? "default" : "pointer", color: i === 0 ? "#ddd" : "#888" }}><ArrowUp size={14}/></button>
                      <GripVertical size={16} color="#cbd5e1" style={{ margin: "2px 0" }} />
                      <button onClick={() => moveStop(i, 1)} disabled={i === state.routeStops.length - 1} style={{ border: "none", background: "none", padding: 0, cursor: i === state.routeStops.length - 1 ? "default" : "pointer", color: i === state.routeStops.length - 1 ? "#ddd" : "#888" }}><ArrowDown size={14}/></button>
                    </div>
                    
                    <div style={{ width: "24px", height: "24px", background: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "bold", marginRight: "0.8rem", color: "#64748b" }}>
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "bold", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: stop.visited ? "line-through" : "none" }}>
                        {stop.account.name}
                      </div>
                      {i > 0 && stop.distanceKm !== undefined && (
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.2rem" }}>
                          +{stop.distanceKm} km • {stop.estimatedArrivalMin} min drive
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      {!stop.visited && (
                        <button onClick={() => handleToggleVisited(stop.id)} style={{ padding: "0.4rem", background: "#dcfce7", color: "#22c55e", border: "1px solid #bbf7d0", borderRadius: "4px", cursor: "pointer" }} title="Mark visited">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button onClick={() => handleRemove(stop.id)} style={{ padding: "0.4rem", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "4px", cursor: "pointer" }} title="Remove">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div style={{ padding: "1rem", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Sparkles size={14} color="#f59e0b" /> AI Suggestions (Nearby)
                  </h4>
                  {suggestions.slice(0, 3).map(s => {
                    const acc = state.accounts.find(a => a.id === s.id);
                    if (!acc) return null;
                    return (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px dashed #cbd5e1" }}>
                        <div style={{ minWidth: 0, paddingRight: "0.5rem" }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{s.reason}</div>
                        </div>
                        <button 
                          onClick={() => dispatch({ type: "ADD_ROUTE_STOP", account: acc })}
                          style={{ padding: "0.3rem 0.6rem", background: "white", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", color: "#3b82f6", fontWeight: "bold", flexShrink: 0 }}
                        >
                          + Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "saved" && (
        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
          {state.savedRoutes.length === 0 ? (
            <p style={{ color: "#666", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>No saved routes yet.</p>
          ) : (
            state.savedRoutes.map(route => (
              <div key={route.id} style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "0.5rem" }}>{route.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1rem" }}>{route.stops.length} stops • Created {new Date(route.createdAt).toLocaleDateString()}</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    onClick={() => dispatch({ type: "LOAD_ROUTE", route })}
                    style={{ flex: 1, padding: "0.4rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => dispatch({ type: "DELETE_SAVED_ROUTE", id: route.id })}
                    style={{ padding: "0.4rem", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "4px", cursor: "pointer" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
