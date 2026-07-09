"use client";

import React, { useState } from "react";
import { useFieldMap, Territory } from "../context/FieldMapContext";
import { Grid3X3, Plus, Map, Activity, Edit2, Trash2 } from "lucide-react";

export function TerritoryPanel() {
  const { state, dispatch } = useFieldMap();
  const [showAddForm, setShowAddForm] = useState(false);

  const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Territory Mgmt</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", padding: "4px 8px", borderRadius: "4px" }}
        >
          <Plus size={16}/> New
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>

        {showAddForm && (
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem", fontSize: "0.9rem" }}>New Territory</h4>
            <input type="text" placeholder="Territory Name" style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
            
            <div style={{ marginBottom: "0.8rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.4rem" }}>Color</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {colors.map(c => (
                  <div key={c} style={{ width: "24px", height: "24px", borderRadius: "50%", background: c, cursor: "pointer", border: "2px solid transparent" }} />
                ))}
              </div>
            </div>

            <select style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
              <option value="">Assign to Rep...</option>
              {state.teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <button style={{ width: "100%", padding: "0.6rem", background: "white", border: "1px solid #3b82f6", color: "#3b82f6", borderRadius: "4px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
              <Map size={16} /> Draw on Map
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowAddForm(false)} style={{ padding: "0.4rem 0.8rem", border: "1px solid #cbd5e1", background: "white", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowAddForm(false)} style={{ padding: "0.4rem 0.8rem", border: "none", background: "#3b82f6", color: "white", borderRadius: "4px", cursor: "pointer" }}>Save</button>
            </div>
          </div>
        )}

        {/* Territory List */}
        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Data Territories</h3>
        
        {state.isLoadingTerritories ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
            Loading territories...
          </div>
        ) : state.territoryList.length === 0 ? (
          <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "2rem" }}>
            <Grid3X3 size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>No territories found in data.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
            {state.territoryList.map((t, i) => (
              <div 
                key={t.name} 
                onClick={() => dispatch({ type: "SET_MAP_VIEW", center: [t.centerLat, t.centerLng], zoom: 14 })}
                style={{ display: "flex", alignItems: "center", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: colors[i % colors.length], marginRight: "1rem" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                    {t.accountCount.toLocaleString()} Accounts
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}>Fly To</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Balancing */}
        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Territory Balancing</h3>
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            Ensure equal distribution of accounts across your sales team.
          </div>
          
          <div style={{ display: "flex", height: "24px", borderRadius: "12px", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ flex: 3, background: "#3b82f6" }} title="Nairobi North: 30%"></div>
            <div style={{ flex: 4, background: "#10b981" }} title="Nairobi West: 40%"></div>
            <div style={{ flex: 2, background: "#f59e0b" }} title="Kiambu: 20%"></div>
            <div style={{ flex: 1, background: "#ef4444" }} title="Unassigned: 10%"></div>
          </div>
          
          <button style={{ width: "100%", padding: "0.6rem", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#333", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
            <Activity size={16} color="#3b82f6" /> Auto-Balance Territories
          </button>
        </div>

      </div>
    </div>
  );
}
