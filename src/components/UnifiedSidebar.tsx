"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Map,
  Eye,
  Users,
  MapPin,
  Route,
  Calendar,
  Grid3X3,
  BarChart3,
  UserPlus,
  Database,
  GitBranch,
  Layers,
  FileText,
  Smartphone,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}

interface Props {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// ─────────────────────────────────────────────
// Nav structure
// ─────────────────────────────────────────────
const GLOBAL_LINKS: NavItem[] = [
  { id: "field-map",   label: "Field Map",    icon: <Map size={18} />,        color: "#3b82f6", href: "/field-map" },
  { id: "field-entry", label: "Agent Entry",  icon: <Navigation size={18} />, color: "#10b981", href: "/field-entry" },
  { id: "agents",      label: "Field Agents", icon: <Smartphone size={18} />, color: "#f59e0b", href: "/agents" },
  { id: "team",        label: "Team Members", icon: <Users size={18} />,      color: "#8b5cf6", href: "/team" },
];

const MAP_TABS: NavItem[] = [
  { id: "visualize",  label: "Visualize",  icon: <Eye size={18} />,       color: "#3b82f6" },
  { id: "accounts",   label: "Accounts",   icon: <Users size={18} />,     color: "#10b981" },
  { id: "places",     label: "Places",     icon: <MapPin size={18} />,    color: "#f59e0b" },
  { id: "data-entry", label: "Data Entry", icon: <FileText size={18} />,  color: "#6366f1" },
  { id: "routes",     label: "Routes",     icon: <Route size={18} />,     color: "#ec4899" },
  { id: "schedule",   label: "Schedule",   icon: <Calendar size={18} />,  color: "#14b8a6" },
  { id: "territory",  label: "Territory",  icon: <Grid3X3 size={18} />,   color: "#f97316" },
  { id: "reports",    label: "Reports",    icon: <BarChart3 size={18} />, color: "#84cc16" },
  { id: "team",       label: "Team",       icon: <UserPlus size={18} />,  color: "#8b5cf6" },
  { id: "crm",        label: "CRM",        icon: <Database size={18} />,  color: "#06b6d4" },
  { id: "routing",    label: "Routing",    icon: <GitBranch size={18} />, color: "#a855f7" },
  { id: "layers",     label: "Layers",     icon: <Layers size={18} />,    color: "#64748b" },
  { id: "security",   label: "Security",   icon: <Shield size={18} />,    color: "#ef4444" },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function UnifiedSidebar({ activeTab, onTabChange }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isFieldMap = pathname === "/field-map" || pathname.startsWith("/field-map/");

  // On the field map, sidebar can completely disappear
  const [hidden, setHidden] = useState(false);
  // On other pages, sidebar can collapse to icon rail
  const [collapsed, setCollapsed] = useState(false);

  const handleItemClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (onTabChange && item.id) {
      onTabChange(item.id);
    }
  };

  // ── Field Map Mode: slim icon sidebar, can fully vanish ──
  if (isFieldMap) {
    return (
      <>
        {/* Floating re-open button when sidebar is fully hidden */}
        {hidden && (
          <button
            onClick={() => setHidden(false)}
            title="Open tools"
            style={{
              position: "fixed",
              top: "50%",
              left: "0",
              transform: "translateY(-50%)",
              zIndex: 200,
              background: "rgba(17,24,39,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderLeft: "none",
              borderRadius: "0 10px 10px 0",
              padding: "0.75rem 0.55rem",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              backdropFilter: "blur(8px)",
              boxShadow: "4px 0 20px rgba(0,0,0,0.4)",
              transition: "all 0.2s ease",
            }}
          >
            <Menu size={18} />
          </button>
        )}

        {/* The slim sidebar */}
        <aside
          style={{
            width: hidden ? "0px" : "72px",
            minHeight: "100vh",
            background: "linear-gradient(180deg, #0d1117 0%, #111827 100%)",
            borderRight: hidden ? "none" : "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            flexShrink: 0,
            position: "relative",
            zIndex: 100,
            boxShadow: hidden ? "none" : "4px 0 24px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1rem 0 0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(59,130,246,0.4)",
              }}
            >
              <Map size={15} color="white" />
            </div>
          </div>

          {/* Map tool items */}
          <div style={{ flex: 1, padding: "0.5rem 0", overflowY: "auto", overflowX: "hidden" }}>
            {MAP_TABS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <SlimItem
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  onClick={() => handleItemClick(item)}
                />
              );
            })}
          </div>

          {/* Hide button */}
          <button
            onClick={() => setHidden(true)}
            title="Hide sidebar"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 0",
              background: "transparent",
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              color: "#334155",
              cursor: "pointer",
              transition: "color 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#334155"; }}
          >
            <ChevronLeft size={16} />
          </button>
        </aside>
      </>
    );
  }

  // ── Global Nav Mode: collapsible sidebar for all other pages ──
  return (
    <aside
      style={{
        width: collapsed ? "64px" : "220px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d1117 0%, #111827 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        position: "relative",
        zIndex: 100,
        boxShadow: "4px 0 32px rgba(0,0,0,0.45)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: collapsed ? "1.25rem 0" : "1.25rem 1rem",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 20px rgba(59,130,246,0.4)",
          }}
        >
          <Map size={16} color="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
              JijiPoll
            </div>
            <div style={{ color: "#475569", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Field Intelligence
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {GLOBAL_LINKS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith((item.href ?? "") + "/");
          return (
            <GlobalItem
              key={item.id}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onClick={() => handleItemClick(item)}
            />
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div style={{ padding: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "0.5rem",
            padding: "0.6rem 0.75rem",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#475569",
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: 600,
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#94a3b8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color = "#475569";
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Slim icon-only item (field map mode)
// ─────────────────────────────────────────────
function SlimItem({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={item.label}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.7rem 0",
        background: isActive ? `${item.color}18` : hovered ? "rgba(255,255,255,0.05)" : "transparent",
        borderLeft: isActive ? `2px solid ${item.color}` : "2px solid transparent",
        color: isActive ? item.color : hovered ? "#cbd5e1" : "#475569",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <span style={{ display: "flex" }}>{item.icon}</span>
      <span style={{ fontSize: "0.58rem", fontWeight: isActive ? 700 : 500, textAlign: "center", lineHeight: 1.2, padding: "0 4px" }}>
        {item.label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Global nav item (non-map pages)
// ─────────────────────────────────────────────
function GlobalItem({
  item, isActive, collapsed, onClick,
}: { item: NavItem; isActive: boolean; collapsed: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? item.label : undefined}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: collapsed ? "0.65rem 0" : "0.6rem 0.75rem",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "10px",
        color: isActive ? item.color : hovered ? "#cbd5e1" : "#64748b",
        background: isActive ? `${item.color}18` : hovered ? "rgba(255,255,255,0.05)" : "transparent",
        border: isActive ? `1px solid ${item.color}35` : "1px solid transparent",
        cursor: "pointer",
        fontSize: "0.82rem",
        fontWeight: isActive ? 700 : 500,
        textAlign: "left",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
      {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
      {isActive && !collapsed && (
        <span
          style={{
            marginLeft: "auto",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: item.color,
            boxShadow: `0 0 6px ${item.color}`,
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
}
