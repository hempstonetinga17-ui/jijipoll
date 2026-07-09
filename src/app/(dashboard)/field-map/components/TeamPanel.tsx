"use client";

import React from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { User, Activity, Map, Route as RouteIcon, Settings } from "lucide-react";

export function TeamPanel() {
  const { state } = useFieldMap();

  const totalActive = state.teamMembers.filter(m => m.status === "in-field").length;
  const totalVisits = state.teamMembers.reduce((sum, m) => sum + m.todayVisits, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Team Management</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        
        {/* Manager Dashboard Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "2rem" }}>
          <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <User size={14} /> Active Today
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>{totalActive} <span style={{ fontSize: "1rem", color: "#94a3b8" }}>/ {state.teamMembers.length}</span></div>
          </div>
          <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Activity size={14} /> Total Visits
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>{totalVisits}</div>
          </div>
        </div>

        {/* Team Members */}
        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Team Members</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
          {state.teamMembers.map(member => (
            <div key={member.id} style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#64748b", position: "relative" }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: "12px", height: "12px", borderRadius: "50%", border: "2px solid white", background: member.status === "online" ? "#22c55e" : member.status === "in-field" ? "#3b82f6" : "#cbd5e1" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#333" }}>{member.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{member.role === "manager" ? "Manager" : "Sales Rep"}</div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "#f8fafc", padding: "0.5rem", borderRadius: "6px", marginBottom: "0.8rem" }}>
                <div style={{ fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b" }}>Visits:</span> <span style={{ fontWeight: "bold" }}>{member.todayVisits}</span>
                </div>
                <div style={{ fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b" }}>Distance:</span> <span style={{ fontWeight: "bold" }}>{member.todayDistance} km</span>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  onClick={() => alert(`Issuing a StampKE Digital Business Card to ${member.name}. This is synced to the central CRM and Team Management.`)}
                  style={{ flex: 1, padding: "0.5rem", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                >
                  <Activity size={14} /> Issue Card
                </button>
                <button style={{ flex: 1, padding: "0.5rem", background: "white", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Area & Route Assignment */}
        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Area & Route Assignment</h3>
        <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <select style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1", outline: "none" }}>
            <option value="">Select Team Member...</option>
            {state.teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <select style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", outline: "none" }}>
              <option value="">Select Area...</option>
              <option value="nairobi">Nairobi CBD</option>
              <option value="westlands">Westlands</option>
              <option value="kilimani">Kilimani</option>
            </select>
            <select style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", outline: "none" }}>
              <option value="">Select Route...</option>
              <option value="1">Morning Loop</option>
              <option value="2">Prospecting Path</option>
            </select>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <input type="datetime-local" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", outline: "none" }} />
          </div>
          <button 
            onClick={() => alert("Successfully assigned area, route, and schedule to the field agent. It will sync to their agent app immediately.")}
            style={{ width: "100%", padding: "0.6rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <RouteIcon size={16} /> Assign Schedule
          </button>
        </div>

        <button style={{ width: "100%", padding: "0.8rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#64748b", fontWeight: "bold", cursor: "pointer" }}>
          <Settings size={16} /> Manage Users & Roles
        </button>

      </div>
    </div>
  );
}
