"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  href?: string; // if set → navigate. if not set → tab change
  section?: string;
}

interface Props {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// ─────────────────────────────────────────────
// Nav structure
// ─────────────────────────────────────────────
const GLOBAL_LINKS: NavItem[] = [
  { id: "field-map",    label: "Field Map",     icon: <Map size={18} />,        color: "#3b82f6", href: "/field-map",   section: "App" },
  { id: "field-entry",  label: "Agent Entry",   icon: <Navigation size={18} />, color: "#10b981", href: "/field-entry", section: "App" },
  { id: "agents",       label: "Field Agents",  icon: <Smartphone size={18} />, color: "#f59e0b", href: "/agents",      section: "App" },
  { id: "team",         label: "Team Members",  icon: <Users size={18} />,      color: "#8b5cf6", href: "/team",        section: "App" },
];

const MAP_TABS: NavItem[] = [
  { id: "visualize",  label: "Visualize",   icon: <Eye size={18} />,        color: "#3b82f6",  section: "Map Tools" },
  { id: "accounts",   label: "Accounts",    icon: <Users size={18} />,      color: "#10b981",  section: "Map Tools" },
  { id: "places",     label: "Places",      icon: <MapPin size={18} />,     color: "#f59e0b",  section: "Map Tools" },
  { id: "data-entry", label: "Data Entry",  icon: <FileText size={18} />,   color: "#6366f1",  section: "Map Tools" },
  { id: "routes",     label: "Routes",      icon: <Route size={18} />,      color: "#ec4899",  section: "Map Tools" },
  { id: "schedule",   label: "Schedule",    icon: <Calendar size={18} />,   color: "#14b8a6",  section: "Map Tools" },
  { id: "territory",  label: "Territory",   icon: <Grid3X3 size={18} />,    color: "#f97316",  section: "Map Tools" },
  { id: "reports",    label: "Reports",     icon: <BarChart3 size={18} />,  color: "#84cc16",  section: "Map Tools" },
  { id: "team",       label: "Team",        icon: <UserPlus size={18} />,   color: "#8b5cf6",  section: "Map Tools" },
  { id: "crm",        label: "CRM",         icon: <Database size={18} />,   color: "#06b6d4",  section: "Map Tools" },
  { id: "routing",    label: "Routing",     icon: <GitBranch size={18} />,  color: "#a855f7",  section: "Map Tools" },
  { id: "layers",     label: "Layers",      icon: <Layers size={18} />,     color: "#64748b",  section: "Map Tools" },
  { id: "security",   label: "Security",    icon: <Shield size={18} />,     color: "#ef4444",  section: "Map Tools" },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function UnifiedSidebar({ activeTab, onTabChange }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isFieldMap = pathname === "/field-map" || pathname.startsWith("/field-map/");

  const handleItemClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (onTabChange && item.id) {
      onTabChange(item.id);
    }
  };

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
      {/* ── Logo ── */}
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

      {/* ── Nav ── */}
      <div style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {/* Global Links Section */}
        {!collapsed && (
          <div style={{ padding: "0.35rem 0.5rem 0.2rem", color: "#334155", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Navigation
          </div>
        )}
        {GLOBAL_LINKS.map((item) => {
          const isActive = item.href
            ? pathname === item.href || pathname.startsWith(item.href + "/")
            : activeTab === item.id;
          return (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onClick={() => handleItemClick(item)}
            />
          );
        })}

        {/* Map Tools Section — only show on field-map */}
        {isFieldMap && (
          <>
            <div style={{ margin: "0.75rem 0 0.2rem", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
            {!collapsed && (
              <div style={{ padding: "0.35rem 0.5rem 0.2rem", color: "#334155", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Map Tools
              </div>
            )}
            {MAP_TABS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <SidebarItem
                  key={`map-${item.id}`}
                  item={item}
                  isActive={isActive}
                  collapsed={collapsed}
                  onClick={() => handleItemClick(item)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
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
// Sidebar Item
// ─────────────────────────────────────────────
function SidebarItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = isActive
    ? `${item.color}18`
    : hovered
    ? "rgba(255,255,255,0.05)"
    : "transparent";

  const border = isActive
    ? `1px solid ${item.color}35`
    : "1px solid transparent";

  const color = isActive ? item.color : hovered ? "#cbd5e1" : "#64748b";

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
        color,
        background: bg,
        border,
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
      {!collapsed && (
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.label}
        </span>
      )}
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
