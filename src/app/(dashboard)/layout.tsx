"use client";

import { JijiSidebar } from "@/components/JijiSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0f1e" }}>
      <JijiSidebar />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: "56px",
            background: "#111827",
            borderBottom: "1px solid #1e2d45",
            display: "flex",
            alignItems: "center",
            padding: "0 1.5rem",
            gap: "1rem",
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "8px",
              background: "#1a2235",
              border: "1px solid #1e2d45",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
              }}
            />
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
              Live
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
