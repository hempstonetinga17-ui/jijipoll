"use client";

import { UnifiedSidebar } from "@/components/UnifiedSidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFieldMap = pathname === "/field-map" || pathname.startsWith("/field-map/");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0f1e" }}>
      {/* Unified sidebar — only shown on non-field-map pages. 
          On field-map, the FieldMapLayout renders its own UnifiedSidebar inline. */}
      {!isFieldMap && <UnifiedSidebar />}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
