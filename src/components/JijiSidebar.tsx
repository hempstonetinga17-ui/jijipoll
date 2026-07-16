"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Users, Smartphone, Navigation, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/field-map",   label: "Field Map",      icon: Map,        color: "#3b82f6" },
  { href: "/agent",       label: "Agent Entry",    icon: Navigation, color: "#10b981" },
  { href: "/team",        label: "Team Members",   icon: Users,      color: "#8b5cf6" },
  { href: "/agents",      label: "Field Agents",   icon: Smartphone, color: "#f59e0b" },
];

export function JijiSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "220px",
        minHeight: "100vh",
        background: "#111827",
        borderRight: "1px solid #1e2d45",
        display: "flex",
        flexDirection: "column",
        padding: "1.25rem 0.75rem",
        gap: "0.25rem",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0 0.5rem",
          marginBottom: "1.5rem",
          overflow: "hidden",
        }}
      >
        <img src="/jijipoll.png" alt="Jijipoll Logo" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, filter: "brightness(0) invert(1)", mixBlendMode: "screen" }} />
        {!collapsed && (
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em" }}>
              JijiPoll
            </div>
            <div style={{ color: "#64748b", fontSize: "0.65rem", fontWeight: 500 }}>
              Field Intelligence
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      {NAV.map(({ href, label, icon: Icon, color }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              color: active ? color : "#64748b",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: active ? `${color}18` : "transparent",
              border: active ? `1px solid ${color}30` : "1px solid transparent",
              transition: "all 0.15s ease",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = "#1a2235";
                (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#64748b";
              }
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!collapsed && label}
          </Link>
        );
      })}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.65rem",
          borderRadius: "10px",
          background: "#1a2235",
          border: "1px solid #1e2d45",
          color: "#64748b",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: 600,
          transition: "all 0.15s",
          width: "100%",
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
      </button>
    </aside>
  );
}
