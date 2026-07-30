"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Submission = {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: "#22c55e",
  REJECTED: "#ef4444",
  PENDING: "#f59e0b",
};

export default function AgentMap({ submissions }: { submissions: Submission[] }) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    const init = async () => {
      const L = (await import("leaflet")).default;

      // Destroy previous instance if re-mounting
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const validSubs = submissions.filter((s) => s.latitude && s.longitude);
      if (validSubs.length === 0) return;

      // Calculate center
      const avgLat = validSubs.reduce((sum, s) => sum + s.latitude, 0) / validSubs.length;
      const avgLng = validSubs.reduce((sum, s) => sum + s.longitude, 0) / validSubs.length;

      const map = L.map(containerRef.current!, {
        center: [avgLat, avgLng],
        zoom: 12,
        scrollWheelZoom: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      validSubs.forEach((sub) => {
        const color = STATUS_COLORS[sub.status] || "#6b7280";
        const marker = L.circleMarker([sub.latitude, sub.longitude], {
          radius: 8,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.6;">
            <strong>${sub.category}</strong><br/>
            <span style="color: ${color}; font-weight: 600;">${sub.status}</span><br/>
            <span style="color: #9ca3af;">${sub.latitude.toFixed(5)}, ${sub.longitude.toFixed(5)}</span>
          </div>
        `);
      });

      // Fit to all markers
      const bounds = L.latLngBounds(validSubs.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [30, 30] });
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [submissions]);

  return <div ref={containerRef} style={{ height: "320px", width: "100%" }} />;
}
