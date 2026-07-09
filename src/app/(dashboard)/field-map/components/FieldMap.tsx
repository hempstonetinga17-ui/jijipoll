"use client";

import React, { useEffect, useCallback } from "react";
import { useFieldMap, getAccountColor } from "../context/FieldMapContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
  Circle,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── MapUpdater: programmatic view changes ─────────────────────────────────
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// ─── ViewportTracker: fires on pan/zoom and fetches visible accounts ─────────
function ViewportTracker() {
  const { state, dispatch, fetchViewportAccounts } = useFieldMap();
  const map = useMap();

  const handleMoveEnd = useCallback(() => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const viewportBounds = {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    };
    dispatch({ type: "SET_MAP_VIEW", center: [map.getCenter().lat, map.getCenter().lng], zoom });
    fetchViewportAccounts(
      viewportBounds,
      zoom,
      state.activeFilters,
      state.searchQuery
    );
  }, [map, fetchViewportAccounts, state.activeFilters, state.searchQuery, dispatch]);

  useMapEvents({
    moveend: handleMoveEnd,
    zoomend: handleMoveEnd,
  });

  // Trigger initial load when map first mounts
  useEffect(() => {
    // Small delay to let Leaflet finish initializing
    const timer = setTimeout(() => {
      handleMoveEnd();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─── FitBoundsButton: zoom to fit all visible accounts ──────────────────────
function FitBoundsButton() {
  const { state } = useFieldMap();
  const map = useMap();

  const handleFitBounds = () => {
    const accs = state.filteredAccounts;
    if (accs.length === 0) return;
    const lats = accs.map((a) => a.lat);
    const lngs = accs.map((a) => a.lng);
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  };

  if (state.filteredAccounts.length === 0) return null;

  return (
    <div
      onClick={handleFitBounds}
      title="Zoom to fit all visible accounts"
      style={{
        position: "absolute",
        bottom: "7rem",
        right: "1rem",
        zIndex: 1000,
        background: "rgba(255,255,255,0.97)",
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
        fontSize: "1.1rem",
        transition: "transform 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      ⊞
    </div>
  );
}

// ─── DrawAreaButton: toggle draw mode ─────────────────────────────────────────
function DrawAreaButton() {
  const { state, dispatch } = useFieldMap();
  
  return (
    <div
      onClick={() => {
        if (state.drawArea) {
          dispatch({ type: "SET_DRAW_AREA", drawArea: null });
        } else {
          dispatch({ type: "SET_DRAW_MODE", isDrawMode: !state.isDrawMode });
        }
      }}
      title={state.drawArea ? "Clear drawn area" : "Draw area to select businesses"}
      style={{
        position: "absolute",
        bottom: "9.5rem",
        right: "1rem",
        zIndex: 1000,
        background: state.isDrawMode ? "#3b82f6" : state.drawArea ? "#ef4444" : "rgba(255,255,255,0.97)",
        color: state.isDrawMode || state.drawArea ? "#fff" : "#1e3a8a",
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
        fontSize: "1.1rem",
        transition: "transform 0.15s, background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {state.drawArea ? "✕" : "✏️"}
    </div>
  );
}

// ─── DrawAreaHandler: circle draw for radius search ───────────────────────
function DrawAreaHandler() {
  const { state, dispatch } = useFieldMap();
  const map = useMap();
  const [startPoint, setStartPoint] = React.useState<L.LatLng | null>(null);
  const [currentPoint, setCurrentPoint] = React.useState<L.LatLng | null>(null);

  useMapEvents({
    mousedown(e) {
      if (!state.isDrawMode) return;
      map.dragging.disable();
      setStartPoint(e.latlng);
      setCurrentPoint(e.latlng);
    },
    mousemove(e) {
      if (!state.isDrawMode || !startPoint) return;
      setCurrentPoint(e.latlng);
    },
    mouseup: async (e) => {
      if (!state.isDrawMode || !startPoint) return;
      map.dragging.enable();
      const radiusKm = startPoint.distanceTo(e.latlng) / 1000;
      const center: [number, number] = [startPoint.lat, startPoint.lng];
      
      // Dispatch immediately for snappy UI
      dispatch({ type: "SET_DRAW_AREA", drawArea: { center, radiusKm } });
      dispatch({ type: "SET_DRAW_MODE", isDrawMode: false });
      setStartPoint(null);
      setCurrentPoint(null);

      // Fetch reverse geocode name in background
      try {
        console.log("Fetching area name for:", center);
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${center[0]}&longitude=${center[1]}&localityLanguage=en`);
        const data = await res.json();
        console.log("Reverse geocode response:", data);
        let areaName = data.locality || data.city || data.principalSubdivision;
        
        if (data.localityInfo && data.localityInfo.administrative) {
           // Sort by highest adminLevel to get the smallest sub-unit
           const sortedAdmins = [...data.localityInfo.administrative]
              .filter(a => a.name && !a.name.toLowerCase().includes("city") && !a.name.toLowerCase().includes("county"))
              .sort((a, b) => (b.adminLevel || 0) - (a.adminLevel || 0));
              
           if (sortedAdmins.length > 0) {
              // Remove generic administrative terms to clean up the name (e.g. "Ruai ward" -> "Ruai")
              areaName = sortedAdmins[0].name.replace(/ ward| location| division| constituency/gi, '').trim();
           }
        }

        if (areaName) {
           console.log("Dispatching new area name:", areaName);
           dispatch({ type: "SET_DRAW_AREA", drawArea: { center, radiusKm, name: areaName } });
        } else {
           console.log("No valid area name found in response.");
           dispatch({ type: "SET_DRAW_AREA", drawArea: { center, radiusKm, name: "Selected" } });
        }
      } catch (err) {
        console.error("Failed to reverse geocode area", err);
      }
    }
  });

  if (state.drawArea) {
    return (
      <Circle
        center={state.drawArea.center}
        radius={state.drawArea.radiusKm * 1000}
        pathOptions={{ color: '#58a6ff', fillColor: '#58a6ff', fillOpacity: 0.2 }}
      />
    );
  }

  if (state.isDrawMode && startPoint && currentPoint) {
    return (
      <Circle
        center={startPoint}
        radius={startPoint.distanceTo(currentPoint)}
        pathOptions={{ color: '#58a6ff', fillColor: '#58a6ff', fillOpacity: 0.2 }}
      />
    );
  }
  return null;
}

// ─── MapInteractionHandler: lasso + right-click ────────────────────────────
function MapInteractionHandler() {
  const { state, dispatch } = useFieldMap();
  const [lassoPoints, setLassoPoints] = React.useState<[number, number][]>([]);

  useMapEvents({
    click(e) {
      if (state.isPickingLocation) {
        dispatch({
          type: "SET_PICKED_LOCATION",
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        });
      } else if (state.isLassoMode) {
        const newPoints = [
          ...lassoPoints,
          [e.latlng.lat, e.latlng.lng] as [number, number],
        ];
        setLassoPoints(newPoints);
        if (newPoints.length === 3) {
          const [p1, p2, p3] = newPoints;
          const minLat = Math.min(p1[0], p2[0], p3[0]);
          const maxLat = Math.max(p1[0], p2[0], p3[0]);
          const minLng = Math.min(p1[1], p2[1], p3[1]);
          const maxLng = Math.max(p1[1], p2[1], p3[1]);
          const selected = state.accounts.filter(
            (a) =>
              a.lat >= minLat &&
              a.lat <= maxLat &&
              a.lng >= minLng &&
              a.lng <= maxLng
          );
          dispatch({ type: "ADD_ACCOUNTS_TO_ROUTE", accounts: selected });
          setLassoPoints([]);
          alert(`Lasso selected ${selected.length} accounts added to route!`);
        }
      }
    },
    contextmenu(e) {
      if (confirm("Create a new account at this location?")) {
        dispatch({
          type: "SET_PICKED_LOCATION",
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        });
        dispatch({ type: "SET_SHOW_ADD_MODAL", show: true });
        dispatch({ type: "SET_ACTIVE_TAB", tab: "accounts" } as any);
      }
    },
  });

  if (state.isLassoMode && lassoPoints.length > 0) {
    return (
      <Polyline
        positions={lassoPoints}
        pathOptions={{ color: "#ef4444", weight: 3, dashArray: "4 4" }}
      />
    );
  }
  return null;
}

// ─── Main Map Component ────────────────────────────────────────────────────────
export function FieldMap() {
  const { state, dispatch } = useFieldMap();
  const {
    mapCenter,
    mapZoom,
    filteredAccounts,
    routeStops,
    colorizeBy,
    mapSettings,
    placeResults,
    territories,
    activeTab,
    isLoadingViewport,
    clusters,
    totalAccountCount,
    totalInView,
  } = state;

  // Custom colored dot icon
  const createColoredIcon = (color: string) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="
          position: relative;
          width: 24px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4));
        ">
          <div style="
            position: absolute;
            top: 0;
            width: 24px;
            height: 24px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
          "></div>
          <div style="
            position: absolute;
            top: 8px;
            width: 8px;
            height: 8px;
            background: rgba(255,255,255,0.95);
            border-radius: 50%;
            z-index: 2;
          "></div>
        </div>
      `,
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -32],
    });
  };

  // Route stop icon (numbered)
  const createRouteIcon = (num: number, visited: boolean) => {
    return L.divIcon({
      className: "custom-route-icon",
      html: `<div style="background-color:${visited ? "#94a3b8" : "#3b82f6"};color:white;width:22px;height:22px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 2px 5px rgba(0,0,0,0.3);opacity:${visited ? 0.7 : 1}">${num}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11],
    });
  };

  const routePositions: [number, number][] = routeStops.map((stop) => [
    stop.account.lat,
    stop.account.lng,
  ]);

  const getTileLayerUrl = () => {
    switch (mapSettings.tileLayer) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "dark":
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      case "terrain":
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      case "street":
      default:
        return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }
  };

  const isLowZoom = mapZoom < 10;

  return (
    <div style={{ height: "100%", width: "100%", zIndex: 0, position: "relative" }}>
      {/* ─── Stats Overlay ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "4rem",
          zIndex: 1000,
          background: "rgba(255,255,255,0.97)",
          padding: "0.5rem 1rem",
          borderRadius: "10px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          display: "flex",
          gap: "1.5rem",
          backdropFilter: "blur(6px)",
          fontSize: "0.75rem",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div>
          <div style={{ color: "#64748b", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>
            In View
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b" }}>
            {filteredAccounts.length.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>
            Total
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#3b82f6" }}>
            {totalAccountCount > 0 ? totalAccountCount.toLocaleString() : "—"}
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>
            Visits Today
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#22c55e" }}>
            {routeStops.filter((s) => s.visited).length}
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.05em" }}>
            Agents
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#8b5cf6" }}>
            {state.teamMembers.filter((m) => m.status !== "offline").length}
          </div>
        </div>
        {mapZoom < 10 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f59e0b", fontSize: "0.72rem", fontWeight: "bold" }}>
            🔍 Zoom in to see pins
          </div>
        )}
      </div>

      {/* ─── Loading Indicator ─────────────────────────────────────────── */}
      {isLoadingViewport && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 1000,
            background: "#3b82f6",
            color: "white",
            padding: "0.4rem 0.8rem",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              border: "2px solid rgba(255,255,255,0.4)",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Loading...
        </div>
      )}

      {/* ─── Zoom hint when nothing loaded yet ────────────────────────── */}
      {!isLoadingViewport && filteredAccounts.length === 0 && clusters.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "rgba(255,255,255,0.95)",
            padding: "1.5rem 2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗺️</div>
          <div style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "0.3rem" }}>
            Pan or zoom to load accounts
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
            {totalAccountCount > 0
              ? `${totalAccountCount.toLocaleString()} accounts available`
              : "Move the map to start exploring"}
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{
          height: "100%",
          width: "100%",
          zIndex: 1,
          cursor:
            state.isPickingLocation || state.isLassoMode
              ? "crosshair"
              : "grab",
        }}
        zoomControl={false}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <ViewportTracker />
        <MapInteractionHandler />

        <TileLayer
          url={getTileLayerUrl()}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* ─── Territory Circles ──────────────────────────────────────── */}
        {mapSettings.showTerritories &&
          activeTab === "territory" &&
          territories.map((t, i) => (
            <Circle
              key={t.id}
              center={[-1.29 + i * 0.05, 36.82 - i * 0.05]}
              radius={3000}
              pathOptions={{
                color: t.color,
                fillColor: t.color,
                fillOpacity: 0.2,
              }}
            />
          ))}

        {/* ─── Radius Search Tool ─────────────────────────────────────── */}
        {mapSettings.showRadiusSearch && (
          <Circle
            center={mapCenter}
            radius={mapSettings.radiusSearchKm * 1000}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
              dashArray: "5, 10",
            }}
          />
        )}

        {/* ─── Cluster Circles (low zoom) ─────────────────────────────── */}
        {isLowZoom &&
          clusters.map((cluster) => (
            <CircleMarker
              key={cluster.key}
              center={[cluster.lat, cluster.lng]}
              radius={Math.min(40, Math.max(16, Math.log10(cluster.count) * 12))}
              pathOptions={{
                color: cluster.territory ? "#0f766e" : "#1e3a8a",
                fillColor: cluster.territory ? "#14b8a6" : "#3b82f6",
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={0.95}
                permanent={false}
              >
                <div style={{ textAlign: "center", padding: "0.2rem", minWidth: "100px" }}>
                  {cluster.territory && (
                    <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#0f766e", marginBottom: "2px" }}>
                      📍 {cluster.territory}
                    </div>
                  )}
                  <div style={{ fontWeight: "bold", fontSize: "1.05rem", color: "#1e3a8a" }}>
                    {cluster.count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    accounts
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div style={{ textAlign: "center", padding: "0.3rem" }}>
                  {cluster.territory && (
                    <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#0f766e", marginBottom: "4px" }}>
                      📍 {cluster.territory}
                    </div>
                  )}
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1e3a8a" }}>
                    {cluster.count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    accounts in this area
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#3b82f6", marginTop: "0.3rem" }}>
                    Zoom in to see details
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* ─── Individual Account Markers (medium/high zoom) ──────────── */}
        {!isLowZoom &&
          (!mapSettings.showRoutePolyline || activeTab !== "routes") &&
          filteredAccounts.map((account) => {
            const color = getAccountColor(account, colorizeBy);
            const isRouted = routeStops.some((s) => s.account.id === account.id);
            if (isRouted && mapSettings.showRoutePolyline && activeTab === "routes")
              return null;

            return (
              <Marker
                key={account.id}
                position={[account.lat, account.lng]}
                icon={createColoredIcon(color)}
                eventHandlers={{
                  click: () =>
                    dispatch({ type: "SET_SELECTED_ACCOUNT", account }),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -34]}
                  opacity={0.95}
                  sticky={false}
                >
                  <div style={{ minWidth: "140px", maxWidth: "220px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "2px", color: "#1e293b", fontSize: "0.85rem" }}>
                      {account.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "2px" }}>
                      {account.businessType}{account.salesStage !== "1 - Lead" ? ` • ${account.salesStage}` : ""}
                    </div>
                    {account.territory && (
                      <div style={{ fontSize: "0.72rem", color: "#0f766e", marginBottom: "2px" }}>
                        📍 {account.territory}
                      </div>
                    )}
                    {account.phone && (
                      <div style={{ fontSize: "0.75rem", color: "#475569" }}>
                        📞 {account.phone}
                      </div>
                    )}
                    {(account.customFields as any)?.Owner && (account.customFields as any).Owner !== "N/A" && (
                      <div style={{ fontSize: "0.72rem", color: "#475569" }}>
                        👤 {(account.customFields as any).Owner}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: account.daysSinceVisit <= 7 ? "#22c55e" : account.daysSinceVisit <= 30 ? "#f59e0b" : "#ef4444",
                        marginTop: "3px",
                        fontWeight: "600",
                      }}
                    >
                      Last visit: {account.daysSinceVisit}d ago
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

        {/* ─── Draw Area Overlay ────────────────────────────────────────── */}
        <DrawAreaHandler />

        {/* ─── Place Search Results ───────────────────────────────────── */}
        {activeTab === "places" &&
          placeResults.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={L.divIcon({
                className: "custom-place-icon",
                html: `<div style="background-color:#f59e0b;color:white;width:16px;height:16px;border-radius:4px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;box-shadow:0 2px 5px rgba(0,0,0,0.3);">P</div>`,
                iconSize: [16, 16],
              })}
            >
              <Popup>
                <div style={{ fontWeight: "bold" }}>{place.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {place.category}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ─── Route Polylines & Stops ────────────────────────────────── */}
        {mapSettings.showRoutePolyline && routeStops.length > 0 && (
          <>
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#3b82f6",
                weight: 4,
                opacity: 0.7,
                dashArray: "8, 8",
              }}
            />
            {routeStops.map((stop, i) => (
              <Marker
                key={`route-${stop.id}`}
                position={[stop.account.lat, stop.account.lng]}
                icon={createRouteIcon(i + 1, !!stop.visited)}
                eventHandlers={{
                  click: () =>
                    dispatch({
                      type: "SET_SELECTED_ACCOUNT",
                      account: stop.account,
                    }),
                }}
              >
                <Popup>
                  <div style={{ fontWeight: "bold" }}>
                    Stop {i + 1}: {stop.account.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    {stop.account.address}
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* ─── Floating Buttons ───────────────────────────────────────────── */}
        <FitBoundsButton />
        <DrawAreaButton />
      </MapContainer>

      {/* ─── CSS animations ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
