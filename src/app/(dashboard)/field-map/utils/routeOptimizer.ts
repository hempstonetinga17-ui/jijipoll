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
export function optimizeRoute(stops: RouteStop[], startLocation: { lat: number, lng: number } | null): RouteStop[] {
  if (stops.length <= 1) return stops;
  
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
  
  return optimized.map((stop, i) => ({ ...stop, order: i }));
}
