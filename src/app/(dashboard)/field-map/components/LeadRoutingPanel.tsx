"use client";

import React, { useState } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { GitBranch, Plus, Edit2, Trash2 } from "lucide-react";

export function LeadRoutingPanel() {
  const { state } = useFieldMap();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Lead Routing</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", padding: "4px 8px", borderRadius: "4px" }}
        >
          <Plus size={16}/> New Rule
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>

        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
            <GitBranch size={20} color="#3b82f6" style={{ marginTop: "2px" }} />
            <div>
              <div style={{ fontWeight: "bold", color: "#1e3a8a", fontSize: "0.95rem", marginBottom: "0.3rem" }}>Automated Lead Assignment</div>
              <div style={{ fontSize: "0.85rem", color: "#1e40af" }}>
                Rules are evaluated from top to bottom. New leads will be assigned to the rep whose rule matches first.
              </div>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem", fontSize: "0.9rem" }}>Create Routing Rule</h4>
            
            <input type="text" placeholder="Rule Name (e.g. Nairobi Healthcare)" style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
            
            <select style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
              <option value="geography">Match by Geography (Territory)</option>
              <option value="vertical">Match by Industry/Vertical</option>
              <option value="product">Match by Product Line</option>
              <option value="opportunity">Match by Deal Size</option>
            </select>

            <select style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
              <option value="">Assign to Rep...</option>
              {state.teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowAddForm(false)} style={{ padding: "0.4rem 0.8rem", border: "1px solid #cbd5e1", background: "white", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowAddForm(false)} style={{ padding: "0.4rem 0.8rem", border: "none", background: "#3b82f6", color: "white", borderRadius: "4px", cursor: "pointer" }}>Save Rule</button>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Active Rules</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Mock Rules */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#333" }}>Healthcare Leads</div>
                <div style={{ display: "inline-block", background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "4px", marginTop: "0.3rem" }}>
                  Vertical Match
                </div>
              </div>
              <div style={{ width: "32px", height: "16px", background: "#22c55e", borderRadius: "8px", position: "relative" }}>
                <div style={{ width: "12px", height: "12px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", right: "2px" }} />
              </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
              If Industry = Healthcare <br/>
              → Assign to <span style={{ fontWeight: "bold" }}>Mary Wanjiku</span>
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#333" }}>Kiambu Region</div>
                <div style={{ display: "inline-block", background: "#f1f5f9", color: "#64748b", fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "4px", marginTop: "0.3rem" }}>
                  Geography Match
                </div>
              </div>
              <div style={{ width: "32px", height: "16px", background: "#22c55e", borderRadius: "8px", position: "relative" }}>
                <div style={{ width: "12px", height: "12px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", right: "2px" }} />
              </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
              If Location in Kiambu Territory <br/>
              → Assign to <span style={{ fontWeight: "bold" }}>Peter Ochieng</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
