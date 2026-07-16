"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
  LogOut,
  Search,
  X,
  ArrowRight,
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

interface SearchResult {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  category: "page" | "account" | "place" | "agent";
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
// Static searchable index (pages + sections)
// ─────────────────────────────────────────────
const SEARCH_INDEX: SearchResult[] = [
  // Pages
  { id: "s-field-map",   label: "Field Map",    subtitle: "Interactive map view",         icon: <Map size={15} />,        color: "#3b82f6", href: "/field-map",   category: "page" },
  { id: "s-agents",      label: "Field Agents", subtitle: "Manage field agents",           icon: <Smartphone size={15} />, color: "#f59e0b", href: "/agents",      category: "page" },
  { id: "s-team",        label: "Team Members", subtitle: "View your team",               icon: <Users size={15} />,      color: "#8b5cf6", href: "/team",        category: "page" },
  { id: "s-field-entry", label: "Agent Entry",  subtitle: "Submit field data",            icon: <Navigation size={15} />, color: "#10b981", href: "/field-entry", category: "page" },
  // Map sections
  { id: "s-visualize",   label: "Visualize",    subtitle: "Map visualization layer",      icon: <Eye size={15} />,        color: "#3b82f6", href: "/field-map?tab=visualize",  category: "place" },
  { id: "s-accounts",    label: "Accounts",     subtitle: "Customer accounts on map",     icon: <Users size={15} />,      color: "#10b981", href: "/field-map?tab=accounts",   category: "account" },
  { id: "s-places",      label: "Places",       subtitle: "Saved locations & pins",       icon: <MapPin size={15} />,     color: "#f59e0b", href: "/field-map?tab=places",     category: "place" },
  { id: "s-routes",      label: "Routes",       subtitle: "Agent travel routes",          icon: <Route size={15} />,      color: "#ec4899", href: "/field-map?tab=routes",     category: "place" },
  { id: "s-schedule",    label: "Schedule",     subtitle: "Appointments & visits",        icon: <Calendar size={15} />,   color: "#14b8a6", href: "/field-map?tab=schedule",   category: "page" },
  { id: "s-territory",   label: "Territory",    subtitle: "Sales territory management",   icon: <Grid3X3 size={15} />,    color: "#f97316", href: "/field-map?tab=territory",  category: "place" },
  { id: "s-reports",     label: "Reports",      subtitle: "Analytics & reports",          icon: <BarChart3 size={15} />,  color: "#84cc16", href: "/field-map?tab=reports",    category: "page" },
  { id: "s-crm",         label: "CRM",          subtitle: "Customer relationship data",   icon: <Database size={15} />,   color: "#06b6d4", href: "/field-map?tab=crm",        category: "account" },
  { id: "s-routing",     label: "Routing",      subtitle: "Optimize delivery routes",     icon: <GitBranch size={15} />,  color: "#a855f7", href: "/field-map?tab=routing",    category: "place" },
  { id: "s-layers",      label: "Layers",       subtitle: "Map layer controls",           icon: <Layers size={15} />,     color: "#64748b", href: "/field-map?tab=layers",     category: "place" },
  { id: "s-security",    label: "Security",     subtitle: "Permissions & security",       icon: <Shield size={15} />,     color: "#ef4444", href: "/field-map?tab=security",   category: "page" },
  { id: "s-data-entry",  label: "Data Entry",   subtitle: "Enter field survey data",      icon: <FileText size={15} />,   color: "#6366f1", href: "/field-map?tab=data-entry", category: "page" },
];

const CATEGORY_LABELS: Record<string, string> = {
  page: "Pages",
  account: "Accounts",
  place: "Places",
  agent: "Agents",
};

// ─────────────────────────────────────────────
// Search Modal
// ─────────────────────────────────────────────
function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim()
    ? SEARCH_INDEX.filter(
        (r) =>
          r.label.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX.slice(0, 8);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [router, onClose]
  );

  useEffect(() => {
    setFocused(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setFocused((f) => Math.min(f + 1, results.length - 1));
      if (e.key === "ArrowUp") setFocused((f) => Math.max(f - 1, 0));
      if (e.key === "Enter" && results[focused]) navigate(results[focused].href);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [results, focused, navigate, onClose]);

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, calc(100vw - 2rem))",
          background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.15)",
          zIndex: 1001,
          overflow: "hidden",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Search size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, accounts, places, agents…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f1f5f9",
              fontSize: "0.95rem",
              fontWeight: 500,
              caretColor: "#3b82f6",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}
            >
              <X size={15} />
            </button>
          )}
          <kbd
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "5px",
              padding: "2px 7px",
              fontSize: "0.65rem",
              color: "#475569",
              fontFamily: "monospace",
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "400px", overflowY: "auto", padding: "0.5rem 0" }}>
          {results.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#475569",
                fontSize: "0.85rem",
              }}
            >
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div
                  style={{
                    padding: "0.4rem 1.25rem 0.25rem",
                    fontSize: "0.63rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#334155",
                  }}
                >
                  {CATEGORY_LABELS[category] ?? category}
                </div>
                {items.map((result) => {
                  const isFocused = flatIndex === focused;
                  const currentIndex = flatIndex++;
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result.href)}
                      onMouseEnter={() => setFocused(currentIndex)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 1.25rem",
                        background: isFocused ? "rgba(59,130,246,0.1)" : "transparent",
                        border: "none",
                        borderLeft: isFocused ? `2px solid ${result.color}` : "2px solid transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.1s ease",
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          background: `${result.color}20`,
                          border: `1px solid ${result.color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: result.color,
                          flexShrink: 0,
                        }}
                      >
                        {result.icon}
                      </span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600 }}>
                          {result.label}
                        </span>
                        <span style={{ display: "block", color: "#475569", fontSize: "0.72rem" }}>
                          {result.subtitle}
                        </span>
                      </span>
                      {isFocused && (
                        <ArrowRight size={14} color={result.color} style={{ flexShrink: 0, opacity: 0.7 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: "0.65rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {[
            ["↑↓", "Navigate"],
            ["↵", "Open"],
            ["Esc", "Close"],
          ].map(([key, label]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <kbd
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  padding: "1px 6px",
                  fontSize: "0.6rem",
                  color: "#64748b",
                  fontFamily: "monospace",
                }}
              >
                {key}
              </kbd>
              <span style={{ color: "#334155", fontSize: "0.65rem" }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

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
  // Search modal
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

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
            <img src="/jijipoll.png" alt="Jijipoll Logo" style={{ width: "32px", height: "32px", borderRadius: "9px", objectFit: "cover", mixBlendMode: "screen" }} />
          </div>

          {/* Search button (slim mode) */}
          <button
            onClick={() => setSearchOpen(true)}
            title="Search (Ctrl+K)"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.65rem 0",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              color: "#475569",
              cursor: "pointer",
              transition: "color 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#3b82f6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
          >
            <Search size={16} />
            <span style={{ fontSize: "0.55rem", fontWeight: 600 }}>Search</span>
          </button>

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

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.7rem 0",
              background: "transparent",
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              color: "#ef4444",
              cursor: "pointer",
              transition: "color 0.15s ease",
              flexShrink: 0,
              opacity: 0.6,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
          >
            <LogOut size={16} />
            <span style={{ fontSize: "0.58rem", fontWeight: 600 }}>Sign out</span>
          </button>

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
    <>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

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
          <img src="/jijipoll.png" alt="Jijipoll Logo" style={{ width: "34px", height: "34px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, mixBlendMode: "screen" }} />
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

        {/* ── Search button ── */}
        <div style={{ padding: collapsed ? "0.5rem 0" : "0.5rem 0.5rem", flexShrink: 0 }}>
          <button
            id="sidebar-search-btn"
            onClick={() => setSearchOpen(true)}
            title="Search (Ctrl+K)"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "0.6rem",
              padding: collapsed ? "0.6rem 0" : "0.55rem 0.75rem",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#475569",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(59,130,246,0.1)";
              el.style.borderColor = "rgba(59,130,246,0.3)";
              el.style.color = "#3b82f6";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(255,255,255,0.04)";
              el.style.borderColor = "rgba(255,255,255,0.08)";
              el.style.color = "#475569";
            }}
          >
            <Search size={15} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
                <kbd
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    padding: "1px 5px",
                    fontSize: "0.6rem",
                    color: "#334155",
                    fontFamily: "monospace",
                  }}
                >
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, padding: "0.25rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
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

        {/* Sign out + Collapse */}
        <div style={{ padding: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {/* Sign out */}
          <button
            id="sidebar-signout-btn"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Sign out" : undefined}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "0.5rem",
              padding: "0.6rem 0.75rem",
              borderRadius: "10px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.15)";
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Sign out</span>}
          </button>

          {/* Collapse toggle */}
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
    </>
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
