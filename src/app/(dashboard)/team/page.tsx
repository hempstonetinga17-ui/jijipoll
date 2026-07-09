"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, Map } from "lucide-react";

export default function JijiTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = () => {
    setLoading(true);
    fetch("/api/org-dashboard/team")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { setTeam(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTeam(); }, []);

  const removeMember = async (userId: string) => {
    if (!confirm("Remove this member? This cannot be undone.")) return;
    const res = await fetch(`/api/org-dashboard/team?userId=${userId}`, { method: "DELETE" });
    if (res.ok) { alert("Member removed."); fetchTeam(); }
    else { const d = await res.json(); alert(d.error || "Failed to remove member."); }
  };

  const S: Record<string, React.CSSProperties> = {
    page: { padding: "2rem", minHeight: "100%", background: "#0a0f1e", color: "#e2e8f0" },
    card: { background: "#111827", border: "1px solid #1e2d45", borderRadius: "16px", overflow: "hidden" },
    th: { padding: "1rem 1.5rem", color: "#64748b", fontWeight: 600, fontSize: "0.85rem", background: "#0f172a", borderBottom: "1px solid #1e2d45" },
    td: { padding: "1rem 1.5rem", borderBottom: "1px solid #0f172a" },
  };

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b" }}>Loading team members...</div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Team Members</h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Manage your organisation&apos;s team</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => window.location.href = "/field-map"}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
          >
            <Map size={18} /> Open Field Map
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#10b981", color: "white", padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
            <UserPlus size={18} /> Invite Member
          </button>
        </div>
      </div>

      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...S.th, textAlign: "left" }}>Name</th>
              <th style={{ ...S.th, textAlign: "left" }}>Email</th>
              <th style={{ ...S.th, textAlign: "left" }}>Role</th>
              <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#64748b", padding: "3rem" }}>
                  No team members found.
                </td>
              </tr>
            ) : (
              team.map((member) => (
                <tr key={member.id}>
                  <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0" }}>{member.name || "N/A"}</td>
                  <td style={{ ...S.td, color: "#64748b" }}>{member.email}</td>
                  <td style={S.td}>
                    <span style={{
                      background: member.role === "ADMIN" ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
                      color: member.role === "ADMIN" ? "#10b981" : "#64748b",
                      padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600
                    }}>{member.role}</span>
                  </td>
                  <td style={{ ...S.td, textAlign: "right" }}>
                    {member.role !== "ADMIN" && (
                      <button onClick={() => removeMember(member.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
