import React, { useMemo } from 'react';
import { useFieldMap, RouteStop } from '../context/FieldMapContext';
import { optimizeRoute, estimatedTravelMin, haversineKm } from '../utils/routeOptimizer';

export function DrawAreaStatsPanel() {
  const { state, dispatch } = useFieldMap();
  const { drawArea, filteredAccounts } = state;

  const accountsInArea = useMemo(() => {
    if (!drawArea) return [];
    return filteredAccounts.filter((account) => {
      const distance = haversineKm(drawArea.center[0], drawArea.center[1], account.lat, account.lng);
      return distance <= drawArea.radiusKm;
    });
  }, [drawArea, filteredAccounts]);

  const { areaSqKm, density, intensityLabel, intensityColor } = useMemo(() => {
    if (!drawArea) return { areaSqKm: 0, density: 0, intensityLabel: 'Low', intensityColor: 'bg-green-100 text-green-700' };
    const area = Math.PI * Math.pow(drawArea.radiusKm, 2);
    const dens = accountsInArea.length / area;
    let label = 'Low';
    let color = 'bg-green-100 text-green-700';
    if (dens > 50) { label = 'High'; color = 'bg-red-100 text-red-700'; }
    else if (dens > 10) { label = 'Medium'; color = 'bg-orange-100 text-orange-700'; }
    return { areaSqKm: area, density: dens, intensityLabel: label, intensityColor: color };
  }, [drawArea, accountsInArea.length]);

  const { optimizedMileage, optimizedTime } = useMemo(() => {
    if (accountsInArea.length === 0) return { optimizedMileage: 0, optimizedTime: 0 };
    // Create mock stops
    const stops: RouteStop[] = accountsInArea.map((acc, i) => ({ 
      id: `mock-${acc.id}`, 
      account: acc, 
      order: i, 
      visited: false,
      estimatedDurationMin: 30
    }));
    
    const startLocation = state.mapCenter ? { lat: state.mapCenter[0], lng: state.mapCenter[1] } : null;
    const optimized = optimizeRoute(stops, startLocation);
    
    // Calculate total mileage along the optimized route
    let mileage = 0;
    // from location to first
    if (startLocation && optimized.length > 0) {
      mileage += haversineKm(startLocation.lat, startLocation.lng, optimized[0].account.lat, optimized[0].account.lng);
    }
    for (let i = 0; i < optimized.length - 1; i++) {
      const c1 = optimized[i].account;
      const c2 = optimized[i+1].account;
      mileage += haversineKm(c1.lat, c1.lng, c2.lat, c2.lng);
    }
    return { optimizedMileage: mileage, optimizedTime: estimatedTravelMin(mileage) };
  }, [accountsInArea, state.mapCenter]);

  const handlePlanRoute = () => {
    if (accountsInArea.length === 0) return;
    dispatch({ type: "ADD_ACCOUNTS_TO_ROUTE", accounts: accountsInArea });
    // Switch to routing tab
    dispatch({ type: "SET_ACTIVE_TAB", tab: "routes" } as any);
  };

  const handleAssignAgent = () => {
    alert(`Assigning territory with ${intensityLabel} intensity (${accountsInArea.length} shops in ${areaSqKm.toFixed(2)} sq km) to an agent.`);
  };

  if (!drawArea) return null;

  // Calculate statistics
  const channelCounts: Record<string, number> = {};
  accountsInArea.forEach(c => {
    const ch = c.businessType || 'Other';
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  });
  
  const sortedChannels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '4.5rem',
      zIndex: 1000,
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      padding: '16px',
      width: '320px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#3b82f6' }}>📈</span> {drawArea.name ? `${drawArea.name} Area Analysis` : 'Area Analysis'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {accountsInArea.length} businesses in {areaSqKm.toFixed(2)} km²
          </p>
        </div>
        <button 
          onClick={() => dispatch({ type: "SET_DRAW_AREA", drawArea: null })} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}
        >
          ✕
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {accountsInArea.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '0.875rem' }}>
            No businesses found in this area.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Intensity
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: intensityColor.includes('green') ? '#dcfce7' : intensityColor.includes('orange') ? '#ffedd5' : '#fee2e2', color: intensityColor.includes('green') ? '#15803d' : intensityColor.includes('orange') ? '#c2410c' : '#b91c1c' }}>
                    {intensityLabel}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{density.toFixed(0)}/km²</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  TSP Est.
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {optimizedMileage.toFixed(1)} km <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '0.75rem' }}>({optimizedTime} min)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePlanRoute} style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Plan Route
              </button>
              <button onClick={handleAssignAgent} style={{ flex: 1, backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Assign Area
              </button>
            </div>

            {/* By Business Type */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', margin: '0 0 8px' }}>By Business Type</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sortedChannels.map(([ch, count]) => (
                  <div key={ch} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>{ch}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Businesses List */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', margin: '0 0 8px' }}>Businesses List ({accountsInArea.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {accountsInArea.slice(0, 100).map(contact => (
                  <div key={contact.id} style={{ border: '1px solid #f1f5f9', borderRadius: '6px', padding: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#0f172a', marginBottom: '2px' }}>{contact.name}</div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, color: '#334155' }}>
                        {contact.businessType || 'Other'}
                      </span>
                      {contact.phone && <span>📞 {contact.phone}</span>}
                    </div>
                  </div>
                ))}
                {accountsInArea.length > 100 && (
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', paddingTop: '4px' }}>+ {accountsInArea.length - 100} more businesses</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
