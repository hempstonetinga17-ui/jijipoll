"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FieldMapProvider, useFieldMap } from "./context/FieldMapContext";

// Import all panel components
import { FieldMapSidebar } from "./components/FieldMapSidebar";
import { AccountsPanel } from "./components/AccountsPanel";
import { VisualizePanel } from "./components/VisualizePanel";
import { RoutesPanel } from "./components/RoutesPanel";
import { PlacesPanel } from "./components/PlacesPanel";
import { MapLayersPanel } from "./components/MapLayersPanel";
import { SchedulePanel } from "./components/SchedulePanel";
import { ReportsPanel } from "./components/ReportsPanel";
import { TerritoryPanel } from "./components/TerritoryPanel";
import { TeamPanel } from "./components/TeamPanel";
import { CRMPanel } from "./components/CRMPanel";
import { LeadRoutingPanel } from "./components/LeadRoutingPanel";
import { SecurityPanel } from "./components/SecurityPanel";
import { AccountDetailSlideout } from "./components/AccountDetailSlideout";
import { DataEntryPanel } from "./components/DataEntryPanel";
import { DrawAreaStatsPanel } from "./components/DrawAreaStatsPanel";

// Leaflet map must be dynamically imported with SSR disabled
const FieldMapComponent = dynamic(
  () => import("./components/FieldMap").then((mod) => mod.FieldMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "#0a0f1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: "0.9rem",
          gap: "0.75rem",
        }}
      >
        <span className="animate-spin" style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #1e2d45", borderTop: "2px solid #3b82f6", borderRadius: "50%" }} />
        Loading Map...
      </div>
    ),
  }
);

function FieldMapLayout() {
  const { state, dispatch } = useFieldMap();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleTabChange = (tab: string) => {
    if (state.activeTab === tab) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      dispatch({ type: "SET_ACTIVE_TAB", tab });
      setSidebarCollapsed(false);
    }
  };

  const renderActivePanel = () => {
    switch (state.activeTab) {
      case "accounts":   return <AccountsPanel />;
      case "visualize":  return <VisualizePanel />;
      case "routes":     return <RoutesPanel />;
      case "places":     return <PlacesPanel />;
      case "layers":     return <MapLayersPanel />;
      case "schedule":   return <SchedulePanel />;
      case "reports":    return <ReportsPanel />;
      case "territory":  return <TerritoryPanel />;
      case "team":       return <TeamPanel />;
      case "crm":        return <CRMPanel />;
      case "routing":    return <LeadRoutingPanel />;
      case "security":   return <SecurityPanel />;
      case "data-entry": return <DataEntryPanel />;
      default:           return <VisualizePanel />;
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", width: "100%", overflow: "hidden" }}>
      {/* Left icon sidebar */}
      <FieldMapSidebar
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Feature panel drawer */}
      <div
        style={{
          width: sidebarCollapsed ? "0px" : "320px",
          background: "#111827",
          boxShadow: sidebarCollapsed ? "none" : "4px 0 20px rgba(0,0,0,0.3)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: sidebarCollapsed ? "none" : "1px solid #1e2d45",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "320px", height: "100%", display: "flex", flexDirection: "column" }}>
          {renderActivePanel()}
        </div>
      </div>

      {/* Main map area */}
      <div style={{ flex: 1, position: "relative", background: "#0a0f1e" }}>
        <FieldMapComponent />
      </div>

      {/* Account details slideout */}
      {state.selectedAccount && <AccountDetailSlideout />}

      {/* Draw area stats overlay */}
      <DrawAreaStatsPanel />
    </div>
  );
}

export default function FieldSalesMappingPage() {
  return (
    <FieldMapProvider>
      <FieldMapLayout />
    </FieldMapProvider>
  );
}
