"use client";

import React, { useState } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { Database, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";

export function CRMPanel() {
  const { state, dispatch } = useFieldMap();
  const { crmConfig } = state;
  const [selectedProvider, setSelectedProvider] = useState(crmConfig.provider);

  const providers = [
    { id: "salesforce", name: "Salesforce", color: "#00a1e0" },
    { id: "hubspot", name: "HubSpot", color: "#ff7a59" },
    { id: "dynamics365", name: "Dynamics 365", color: "#002050" },
    { id: "zoho", name: "Zoho CRM", color: "#f0483e" },
    { id: "netsuite", name: "NetSuite", color: "#314457" },
    { id: "insightly", name: "Insightly", color: "#f47f20" },
    { id: "veeva", name: "Veeva CRM", color: "#f26c23" },
    { id: "none", name: "None", color: "#94a3b8" }
  ];

  const isConnected = crmConfig.connected;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>CRM Integration</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        
        {/* Status Banner */}
        <div style={{ 
          padding: "0.8rem", 
          borderRadius: "8px", 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          marginBottom: "1.5rem",
          background: isConnected ? "#dcfce7" : "#f1f5f9",
          border: `1px solid ${isConnected ? "#bbf7d0" : "#e2e8f0"}`,
          color: isConnected ? "#166534" : "#475569"
        }}>
          {isConnected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
            {isConnected ? `Connected to ${crmConfig.provider}` : "No CRM Connected"}
          </span>
        </div>

        {/* Data Import Section */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 0.8rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={18} /> Import Data
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            Upload a CSV or Excel file to bulk import accounts to the map.
          </p>
          <div style={{ border: "2px dashed #cbd5e1", borderRadius: "6px", padding: "1.5rem", textAlign: "center", background: "#f8fafc", cursor: "pointer", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: "bold" }}>Click to upload file</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>CSV, XLSX up to 5MB</div>
          </div>
          <button style={{ width: "100%", padding: "0.6rem", background: "#1e3a8a", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
            Start Import
          </button>
        </div>

        {/* Provider Grid */}
        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Select Provider</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "2rem" }}>
          {providers.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedProvider(p.id as any)}
              style={{ 
                padding: "0.8rem 0.5rem", 
                border: `2px solid ${selectedProvider === p.id ? "#3b82f6" : "#e2e8f0"}`, 
                borderRadius: "6px", 
                background: "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: selectedProvider === p.id ? "0 4px 6px -1px rgba(59, 130, 246, 0.2)" : "none"
              }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Database size={16} color="white" />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "bold", textAlign: "center" }}>{p.name}</span>
            </div>
          ))}
        </div>

        {/* Config (if a provider is selected) */}
        {selectedProvider !== "none" && (
          <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
            <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem" }}>Synchronization Settings</h4>
            
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.4rem" }}>Sync Direction</div>
              <select style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} defaultValue="two-way">
                <option value="two-way">Two-way Sync</option>
                <option value="push-only">Push Only (StampKE → CRM)</option>
                <option value="pull-only">Pull Only (CRM → StampKE)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#333" }}>Auto-Sync in Background</span>
              <div style={{ width: "40px", height: "20px", background: "#22c55e", borderRadius: "10px", position: "relative", cursor: "pointer" }}>
                <div style={{ width: "16px", height: "16px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", left: "22px" }} />
              </div>
            </div>

            <button 
              onClick={() => dispatch({ type: "SET_CRM_CONFIG", config: { provider: selectedProvider, connected: !isConnected } })}
              style={{ width: "100%", padding: "0.6rem", background: isConnected ? "#fee2e2" : "#3b82f6", color: isConnected ? "#ef4444" : "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {isConnected ? "Disconnect" : "Connect Account"}
            </button>
          </div>
        )}
        {/* Feature List */}
        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Capabilities</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "#475569" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#22c55e" /> Real-time 2-way updates</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#22c55e" /> Map CRM fields to StampKE</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#22c55e" /> Sync routes and check-ins</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#22c55e" /> Custom object support</div>
        </div>

      </div>
    </div>
  );
}
