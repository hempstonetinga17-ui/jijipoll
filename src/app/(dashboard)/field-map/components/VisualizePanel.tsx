"use client";

import React, { useState } from "react";
import { useFieldMap, ColorizeBy, getColorLegend, SALES_STAGE_COLORS, PRIORITY_COLORS, NEXT_STEP_COLORS } from "../context/FieldMapContext";

export function VisualizePanel() {
  const { state, dispatch } = useFieldMap();
  const [tab, setTab] = useState<"colorize" | "filters" | "feed">("feed");

  const colorizeOptions: { value: ColorizeBy; label: string }[] = [
    { value: "salesYTD", label: "Sales YTD" },
    { value: "nextStep", label: "Next Step" },
    { value: "daysSinceVisit", label: "Days Since Last Visit" },
    { value: "salesStage", label: "Sales Stage" },
    { value: "priority", label: "Priority" },
    { value: "businessType", label: "Business Type" },
  ];

  const handleColorizeChange = (val: ColorizeBy) => {
    dispatch({ type: "SET_COLORIZE_BY", colorizeBy: val });
  };

  const legend = getColorLegend(state.colorizeBy);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Visualize</h2>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0.5rem", display: "flex", background: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
        <button 
          onClick={() => setTab("feed")}
          style={{ flex: 1, padding: "0.5rem", background: tab === "feed" ? "#3b82f6" : "#eee", color: tab === "feed" ? "white" : "#555", border: "1px solid #ddd", borderRadius: "4px 0 0 4px", fontWeight: tab === "feed" ? "bold" : "normal", cursor: "pointer", fontSize: "0.8rem" }}
        >
          Live Feed
        </button>
        <button 
          onClick={() => setTab("colorize")}
          style={{ flex: 1, padding: "0.5rem", background: tab === "colorize" ? "#3b82f6" : "#eee", color: tab === "colorize" ? "white" : "#555", borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", borderLeft: "none", borderRight: "none", fontWeight: tab === "colorize" ? "bold" : "normal", cursor: "pointer", fontSize: "0.8rem" }}
        >
          Colorize
        </button>
        <button 
          onClick={() => setTab("filters")}
          style={{ flex: 1, padding: "0.5rem", background: tab === "filters" ? "#3b82f6" : "#eee", color: tab === "filters" ? "white" : "#555", border: "1px solid #ddd", borderRadius: "0 4px 4px 0", fontWeight: tab === "filters" ? "bold" : "normal", cursor: "pointer", fontSize: "0.8rem" }}
        >
          Filters
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "colorize" && (
          <div>
            <div style={{ padding: "1rem 1rem 0.5rem", fontSize: "0.7rem", fontWeight: "bold", color: "#888", textTransform: "uppercase" }}>
              Colorize Accounts By
            </div>
            {colorizeOptions.map(opt => (
              <div 
                key={opt.value} 
                onClick={() => handleColorizeChange(opt.value)}
                style={{ 
                  padding: "0.8rem 1rem", 
                  borderBottom: "1px solid #eee", 
                  fontSize: "0.9rem", 
                  background: state.colorizeBy === opt.value ? "rgba(59, 130, 246, 0.1)" : "white", 
                  color: state.colorizeBy === opt.value ? "#3b82f6" : "#333", 
                  fontWeight: state.colorizeBy === opt.value ? "bold" : "normal",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div style={{ 
                  width: "16px", height: "16px", borderRadius: "50%", 
                  border: `2px solid ${state.colorizeBy === opt.value ? "#3b82f6" : "#ddd"}`,
                  marginRight: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {state.colorizeBy === opt.value && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />}
                </div>
                {opt.label}
              </div>
            ))}
          </div>
        )}

        {tab === "filters" && (
          <div style={{ padding: "1rem" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "0.6rem 0.8rem", marginBottom: "1rem", fontSize: "0.78rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
              Filters are live — map reloads the visible area instantly when you change a filter.
            </div>
            <div style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Select options below to filter the map. Unchecked items will be hidden.
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Priority</div>
              {["High", "Medium", "Low"].map(p => (
                <label key={p} style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={state.activeFilters.priority.includes(p as any) || state.activeFilters.priority.length === 0} onChange={(e) => {
                    const current = state.activeFilters.priority;
                    let next = current.length === 0 ? ["High", "Medium", "Low"] as any : [...current];
                    if (e.target.checked) next.push(p as any);
                    else next = next.filter((i: any) => i !== p);
                    if (next.length === 3) next = [];
                    dispatch({ type: "SET_FILTERS", filters: { priority: next } });
                  }} style={{ marginRight: "8px" }}/>
                  {p}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Sales Stage</div>
              {["1 - Lead", "2 - Qualified", "3 - Proposal", "4 - Customer", "5 - Churned"].map(s => (
                <label key={s} style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={state.activeFilters.salesStage.includes(s as any) || state.activeFilters.salesStage.length === 0} onChange={(e) => {
                    const current = state.activeFilters.salesStage;
                    let next = current.length === 0 ? ["1 - Lead", "2 - Qualified", "3 - Proposal", "4 - Customer", "5 - Churned"] as any : [...current];
                    if (e.target.checked) next.push(s as any);
                    else next = next.filter((i: any) => i !== s);
                    if (next.length === 5) next = [];
                    dispatch({ type: "SET_FILTERS", filters: { salesStage: next } });
                  }} style={{ marginRight: "8px" }}/>
                  {s}
                </label>
              ))}
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Business Type</div>
              {["Duka", "Green Grocer", "Butcher", "Eatery", "Wholesale", "Kibanda", "Other"].map(bt => (
                <label key={bt} style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={state.activeFilters.businessType.includes(bt) || state.activeFilters.businessType.length === 0} onChange={(e) => {
                    const current = state.activeFilters.businessType;
                    let next = current.length === 0 ? ["Duka", "Green Grocer", "Butcher", "Eatery", "Wholesale", "Kibanda", "Other"] : [...current];
                    if (e.target.checked) next.push(bt);
                    else next = next.filter((i: string) => i !== bt);
                    if (next.length === 7) next = [];
                    dispatch({ type: "SET_FILTERS", filters: { businessType: next } });
                  }} style={{ marginRight: "8px" }}/>
                  {bt}
                </label>
              ))}
            </div>

          </div>
        )}

        {tab === "feed" && (
          <div>
            <div style={{ padding: "1rem 1rem 0.5rem", fontSize: "0.7rem", fontWeight: "bold", color: "#888", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
              <span>Live Agent Activity</span>
              <span style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "0.3rem" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }}/> Syncing...</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {state.checkIns.map((activity: any, idx: number) => {
                let color = "#3b82f6";
                if (activity.outcome === "visited") color = "#22c55e";
                else if (activity.outcome === "no_answer") color = "#ef4444";
                else if (activity.outcome === "follow_up") color = "#f59e0b";

                let actionText = `Logged ${activity.outcome.replace("_", " ")} at ${activity.accountName}`;

                return (
                <div key={idx} style={{ padding: "1rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, marginTop: "6px" }} />
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#333" }}>{activity.agentName || "Agent"}</div>
                    <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "0.2rem" }}>{actionText}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.4rem" }}>{new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                );
              })}
              {state.checkIns.length === 0 && (
                <div style={{ padding: "2rem", textAlign: "center", color: "#888", fontSize: "0.85rem" }}>
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {tab === "colorize" && (
        <div style={{ padding: "1rem", background: "#1e1e2e", color: "white", fontSize: "0.85rem", borderTop: "1px solid #444" }}>
          <div style={{ marginBottom: "0.8rem", fontWeight: "bold", fontSize: "0.75rem", color: "#aaa", textTransform: "uppercase" }}>
            Legend: {colorizeOptions.find(o => o.value === state.colorizeBy)?.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {legend.map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color, border: "1px solid rgba(255,255,255,0.2)" }}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
