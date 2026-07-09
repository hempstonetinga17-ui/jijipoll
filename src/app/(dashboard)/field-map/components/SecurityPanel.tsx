"use client";

import React from "react";
import { Shield, CheckCircle, Lock, Server, FileText } from "lucide-react";

export function SecurityPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Security & Compliance</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        
        {/* Overall Score */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "conic-gradient(#22c55e 100%, #e2e8f0 0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <div style={{ width: "84px", height: "84px", borderRadius: "50%", background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Shield size={24} color="#22c55e" style={{ marginBottom: "4px" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#1e293b" }}>SECURE</span>
            </div>
          </div>
          <div style={{ color: "#333", fontSize: "0.9rem", textAlign: "center" }}>Your field data meets enterprise security standards.</div>
        </div>

        {/* Checklists */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ padding: "0.8rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={16} color="#64748b" /> Infrastructure & Encryption
          </div>
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.85rem", color: "#333" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> AWS-hosted Infrastructure</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> SSL/TLS in-transit encryption</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> AES-256 at-rest encryption</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> Password hashing (bcrypt)</div>
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ padding: "0.8rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Server size={16} color="#64748b" /> Data Privacy & Compliance
          </div>
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.85rem", color: "#333" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> HIPAA Compliant Architecture</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> GDPR Data Handling</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} color="#22c55e" /> Role-based Access Control (RBAC)</div>
          </div>
        </div>

        <button style={{ width: "100%", padding: "0.8rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", marginBottom: "0.5rem" }}>
          <FileText size={16} /> Request Audit Log Export
        </button>
        <button style={{ width: "100%", padding: "0.8rem", background: "white", border: "1px solid #fee2e2", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#ef4444", fontWeight: "bold", cursor: "pointer" }}>
          Delete All Organization Data
        </button>

      </div>
    </div>
  );
}
