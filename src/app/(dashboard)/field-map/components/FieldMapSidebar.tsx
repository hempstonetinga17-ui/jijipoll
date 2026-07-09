"use client";

import React from "react";
import { Eye, Users, MapPin, Route, Calendar, Grid3X3, BarChart3, UserPlus, Database, GitBranch, Layers, ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function FieldMapSidebar({ activeTab, onTabChange, isCollapsed = false, onToggle }: Props) {
  const router = useRouter();
  const width = "80px";

  return (
    <div style={{ 
      width, 
      background: "#1e1e2e", 
      color: "white", 
      display: "flex", 
      flexDirection: "column", 
      flexShrink: 0, 
      zIndex: 50,
      transition: "width 0.3s ease"
    }}>
      <div style={{ 
        padding: "1rem 0", 
        background: "#1e1b4b", 
        color: "white", 
        fontWeight: "bold", 
        fontSize: isCollapsed ? "0.8rem" : "1.2rem", 
        textAlign: "center" 
      }}>
        <div 
          style={{ cursor: "pointer", display: "inline-block" }}
          onClick={onToggle}
          title={isCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isCollapsed ? <Grid3X3 size={24} /> : "MAPS"}
        </div>
      </div>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "0.5rem", overflowY: "auto" }}>
        <SidebarItem icon={<Eye size={20} />} label="Visualize" id="visualize" active={activeTab === "visualize"} onClick={() => onTabChange("visualize")} />
        <SidebarItem icon={<Users size={20} />} label="Accounts" id="accounts" active={activeTab === "accounts"} onClick={() => onTabChange("accounts")} />
        <SidebarItem icon={<MapPin size={20} />} label="Places" id="places" active={activeTab === "places"} onClick={() => onTabChange("places")} />
        <SidebarItem icon={<FileText size={20} />} label="Data Entry" id="data-entry" active={activeTab === "data-entry"} onClick={() => onTabChange("data-entry")} />
        <SidebarItem icon={<Route size={20} />} label="Routes" id="routes" active={activeTab === "routes"} onClick={() => onTabChange("routes")} />
        <SidebarItem icon={<Calendar size={20} />} label="Schedule" id="schedule" active={activeTab === "schedule"} onClick={() => onTabChange("schedule")} />
        <SidebarItem icon={<Grid3X3 size={20} />} label="Territory" id="territory" active={activeTab === "territory"} onClick={() => onTabChange("territory")} />
        <SidebarItem icon={<BarChart3 size={20} />} label="Reports" id="reports" active={activeTab === "reports"} onClick={() => onTabChange("reports")} />
        <SidebarItem icon={<UserPlus size={20} />} label="Team" id="team" active={activeTab === "team"} onClick={() => onTabChange("team")} />
        <SidebarItem icon={<Database size={20} />} label="CRM" id="crm" active={activeTab === "crm"} onClick={() => onTabChange("crm")} />
        <SidebarItem icon={<GitBranch size={20} />} label="Routing" id="routing" active={activeTab === "routing"} onClick={() => onTabChange("routing")} />
        <SidebarItem icon={<Layers size={20} />} label="Layers" id="layers" active={activeTab === "layers"} onClick={() => onTabChange("layers")} />
      </div>

      <div style={{ paddingBottom: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem" }}>
        <div
          onClick={() => router.push('/business-cards')}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.8rem 0",
            cursor: "pointer",
            color: "#60a5fa",
            gap: "0.3rem",
            transition: "all 0.2s ease"
          }}
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: "0.7rem", fontWeight: "bold", textAlign: "center", padding: "0 2px" }}>Dashboard</span>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, id, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "0.8rem 0", 
        cursor: "pointer",
        background: active ? "rgba(59, 130, 246, 0.2)" : "transparent",
        borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
        color: active ? "white" : "#aaa",
        gap: "0.3rem",
        transition: "all 0.2s ease"
      }}
      title={label}
    >
      {icon}
      <span style={{ fontSize: "0.7rem", fontWeight: active ? "bold" : "normal", textAlign: "center", padding: "0 2px" }}>{label}</span>
    </div>
  );
}
