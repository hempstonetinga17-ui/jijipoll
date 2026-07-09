import { FieldAccount, RouteStop } from "../context/FieldMapContext";

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimatedTravelMin(distanceKm: number): number {
  const averageSpeedKmh = 35; // typical urban driving
  return Math.ceil((distanceKm / averageSpeedKmh) * 60);
}

// Simple nearest neighbor TSP
export function optimizeRoute(
  stops: RouteStop[], 
  startLocation: { lat: number, lng: number } | null,
  endLocation?: { lat: number, lng: number } | null
): { stops: RouteStop[] } {
  if (stops.length <= 1) return { stops };
  
  const unvisited = [...stops];
  const optimized: RouteStop[] = [];
  
  let currentLat = startLocation ? startLocation.lat : unvisited[0].account.lat;
  let currentLng = startLocation ? startLocation.lng : unvisited[0].account.lng;
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDistance = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineKm(currentLat, currentLng, unvisited[i].account.lat, unvisited[i].account.lng);
      if (d < shortestDistance) {
        shortestDistance = d;
        nearestIndex = i;
      }
    }
    
    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nextStop);
    currentLat = nextStop.account.lat;
    currentLng = nextStop.account.lng;
  }
  
  return { stops: optimized.map((stop, i) => ({ ...stop, order: i })) };
}

export function exportRouteToGPX(stops: RouteStop[], routeName: string = "Optimized Route"): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="StampKE">\n  <trk>\n    <name>${routeName}</name>\n    <trkseg>\n`;
  for (const stop of stops) {
    xml += `      <trkpt lat="${stop.account.lat}" lon="${stop.account.lng}">\n        <name>${stop.account.name}</name>\n      </trkpt>\n`;
  }
  xml += `    </trkseg>\n  </trk>\n</gpx>`;
  return xml;
}

export function suggestNearbyAccounts(routeStops: RouteStop[], allAccounts: FieldAccount[]): { id: string, name: string, reason: string }[] {
  if (routeStops.length === 0) return [];
  const lastStop = routeStops[routeStops.length - 1];
  
  const unvisited = allAccounts.filter(a => !routeStops.find(s => s.account.id === a.id));
  
  const distances = unvisited.map(a => ({
    account: a,
    distance: haversineKm(lastStop.account.lat, lastStop.account.lng, a.lat, a.lng)
  }));
  
  distances.sort((a, b) => a.distance - b.distance);
  
  return distances.slice(0, 3).map(d => ({
    id: d.account.id,
    name: d.account.name,
    reason: `${d.distance.toFixed(1)} km away from last stop`
  }));
}

export function generateRoutePrintHTML(stops: RouteStop[]): string {
  return "<html><body><h1>Route</h1></body></html>";
}
