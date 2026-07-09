"use client";

import { useEffect, useState } from "react";
import { Settings, Smartphone, UserPlus, Shield } from "lucide-react";

export default function JijiAgentsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [agentId, setAgentId] = useState("");
  const [agentPin, setAgentPin] = useState("");

  const fetchCards = () => {
    setLoading(true);
    fetch("/api/org/agents")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { setCards(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCards(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    const res = await fetch("/api/org/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: selectedCard.id, agentId, agentPin, isAgentCard: true }),
    });
    if (res.ok) {
      alert("Agent credentials updated successfully!");
      setSelectedCard(null);
      fetchCards();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update agent");
    }
  };

  const agents = cards.filter((c) => c.isAgentCard);
  const unassigned = cards.filter((c) => !c.isAgentCard);

  const S: Record<string, React.CSSProperties> = {
    page: { padding: "2rem", minHeight: "100%", background: "#0a0f1e", color: "#e2e8f0" },
    card: { background: "#111827", border: "1px solid #1e2d45", borderRadius: "16px", overflow: "hidden" },
    th: { padding: "1rem 1.5rem", color: "#64748b", fontWeight: 600, fontSize: "0.85rem", background: "#0f172a", borderBottom: "1px solid #1e2d45", textAlign: "left" as const },
    td: { padding: "1rem 1.5rem", borderBottom: "1px solid #0f172a", color: "#e2e8f0" },
  };

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b" }}>Loading field agents...</div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Modal */}
      {selectedCard && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#111827", border: "1px solid #1e2d45", padding: "2rem", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={20} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>Provision Agent Access</h3>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Configure login credentials for <strong style={{ color: "#93c5fd" }}>{selectedCard.firstName} {selectedCard.lastName}</strong> to access the mobile agent app.
            </p>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent ID</label>
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="e.g. AGT-001"
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #1e2d45", background: "#0a0f1e", color: "#e2e8f0", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent PIN</label>
                <input
                  type="password"
                  value={agentPin}
                  onChange={(e) => setAgentPin(e.target.value)}
                  placeholder="4–6 digit PIN"
                  required
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #1e2d45", background: "#0a0f1e", color: "#e2e8f0", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="button" onClick={() => setSelectedCard(null)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #1e2d45", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", cursor: "pointer", fontWeight: 600 }}>Save Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Field Agents</h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Manage digital credentials provisioned for your field team.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>
            {agents.length} Active
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Active Agents */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Mobile Agents</h2>
          <div style={S.card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...S.th }}>Agent Name</th>
                  <th style={{ ...S.th }}>Agent ID</th>
                  <th style={{ ...S.th }}>Mobile Access</th>
                  <th style={{ ...S.th, textAlign: "right" as const }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#64748b", padding: "3rem" }}>
                      No active field agents. Provision a card to get started.
                    </td>
                  </tr>
                ) : (
                  agents.map((card) => (
                    <tr key={card.id}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{card.firstName} {card.lastName}</td>
                      <td style={{ ...S.td, color: "#64748b", fontFamily: "monospace" }}>{card.agentId}</td>
                      <td style={S.td}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                          <Smartphone size={12} /> Enabled
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <button
                          onClick={() => { setSelectedCard(card); setAgentId(card.agentId || ""); setAgentPin(""); }}
                          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", cursor: "pointer", padding: "0.4rem 0.75rem", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          <Settings size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unassigned Cards */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Available Cards</h2>
          <div style={{ ...S.card, padding: "1rem" }}>
            {unassigned.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>All cards are provisioned as agents.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {unassigned.map((card) => (
                  <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem", border: "1px solid #1e2d45", borderRadius: "10px", background: "#0a0f1e" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e2e8f0", margin: 0 }}>{card.firstName} {card.lastName}</p>
                      <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>{card.title}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedCard(card); setAgentId(""); setAgentPin(""); }}
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "0.4rem 0.875rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, color: "#10b981", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <UserPlus size={14} /> Provision
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
