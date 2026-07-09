"use client";

import React, { useState, useRef } from "react";
import { useFieldMap, getAccountColor, FieldAccount } from "../context/FieldMapContext";
import { Plus, Search, Filter, Trash2, Upload, X, MapPin } from "lucide-react";

export function AccountsPanel() {
  const { state, dispatch } = useFieldMap();
  const [localSearch, setLocalSearch] = useState(state.searchQuery);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (q: string) => {
    setLocalSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch({ type: "SET_SEARCH_QUERY", query: q });
    }, 300);
  };

  const inView = state.filteredAccounts.length;
  const total = state.totalAccountCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "bold" }}>Accounts</h2>
          <button
            onClick={() => dispatch({ type: "SET_SHOW_ADD_MODAL", show: true })}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", padding: "4px 10px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <MapPin size={11} />
          <span>
            <strong style={{ color: "white" }}>{inView.toLocaleString()}</strong> in view
            {total > 0 && <span> of <strong style={{ color: "#93c5fd" }}>{total.toLocaleString()}</strong> total</span>}
          </span>
          {state.isLoadingViewport && (
            <span style={{ color: "#93c5fd", fontSize: "0.7rem" }}>• loading...</span>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ padding: "0.5rem", borderBottom: "1px solid #ddd", background: "#f9f9f9", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search accounts in view..."
            value={localSearch}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0.4rem 0", fontSize: "0.85rem" }}
          />
          {localSearch && (
            <button onClick={() => { setLocalSearch(""); dispatch({ type: "SET_SEARCH_QUERY", query: "" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
        {state.territoryList.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <select
              value={state.selectedTerritory || ""}
              onChange={(e) => {
                const terr = e.target.value || null;
                dispatch({ type: "SET_SELECTED_TERRITORY", territory: terr });
                if (terr) {
                  const tData = state.territoryList.find(t => t.name === terr);
                  if (tData) {
                    dispatch({ type: "SET_MAP_VIEW", center: [tData.centerLat, tData.centerLng], zoom: 14 });
                  }
                }
              }}
              style={{ flex: 1, border: "1px solid #e2e8f0", outline: "none", background: "white", padding: "0.3rem", fontSize: "0.8rem", borderRadius: "4px", color: "#334155" }}
            >
              <option value="">All Territories</option>
              {state.territoryList.map(t => (
                <option key={t.name} value={t.name}>{t.name} ({t.accountCount})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Zoom hint */}
      {state.mapZoom < 10 && (
        <div style={{ padding: "0.6rem 1rem", background: "#fef9c3", borderBottom: "1px solid #fde68a", fontSize: "0.78rem", color: "#92400e", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          🔍 Zoom in on the map to see accounts
        </div>
      )}

      {/* Account List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {state.isLoadingViewport && inView === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
            <div style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>⏳</div>
            Loading accounts in view...
          </div>
        )}
        {!state.isLoadingViewport && inView === 0 && state.mapZoom >= 10 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888", fontSize: "0.85rem" }}>
            <div style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>📍</div>
            No accounts in this area.
            {localSearch && <div style={{ marginTop: "0.4rem", color: "#3b82f6" }}>Try clearing your search.</div>}
          </div>
        )}
        {state.filteredAccounts
          .filter(a => !state.selectedTerritory || a.territory === state.selectedTerritory)
          .map(acc => {
          const isSelected = state.selectedAccount?.id === acc.id;
          const statusColor = getAccountColor(acc, state.colorizeBy);

          return (
            <div
              key={acc.id}
              onClick={() => dispatch({ type: "SET_SELECTED_ACCOUNT", account: acc })}
              style={{
                padding: "0.8rem 1rem",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                background: isSelected ? "#3b82f6" : "white",
                color: isSelected ? "white" : "#333",
                transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", minWidth: 0 }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
                  <div style={{ fontWeight: "bold", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</div>
                </div>
                {(acc.source === "db") && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Delete this field entry?")) {
                        try {
                          await fetch(`/api/org-dashboard/field-map/accounts?id=${acc.id}`, { method: "DELETE" });
                          dispatch({ type: "DELETE_ACCOUNT", id: acc.id } as any);
                        } catch { alert("Failed to delete account"); }
                      }
                    }}
                    style={{ background: "transparent", border: "none", color: isSelected ? "rgba(255,255,255,0.8)" : "#ef4444", cursor: "pointer", padding: "2px", flexShrink: 0 }}
                    title="Remove Entry"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: isSelected ? "rgba(255,255,255,0.8)" : "#64748b", marginBottom: "0.2rem" }}>
                {acc.businessType || "Retail"}
                {acc.territory && (
                  <span style={{ 
                    marginLeft: "0.4rem", 
                    padding: "0.1rem 0.4rem", 
                    background: isSelected ? "rgba(255,255,255,0.2)" : "#e0f2fe", 
                    color: isSelected ? "white" : "#0284c7", 
                    borderRadius: "4px", 
                    fontSize: "0.7rem", 
                    fontWeight: "bold" 
                  }}>
                    {acc.territory}
                  </span>
                )}
                {" • " + acc.salesStage}
              </div>
              <div style={{ fontSize: "0.73rem", color: isSelected ? "rgba(255,255,255,0.8)" : "#64748b", paddingLeft: "14px" }}>
                <div style={{ marginTop: "0.15rem" }}>Last visit: {acc.daysSinceVisit}d • {acc.priority} priority</div>
              </div>
            </div>
          );
        })}
      </div>

      {state.showAddModal && <AddAccountModal onClose={() => dispatch({ type: "SET_SHOW_ADD_MODAL", show: false })} />}
    </div>
  );
}

function AddAccountModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useFieldMap();
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Picked location from map right click
  const defaultLat = state.pickedLocation ? state.pickedLocation.lat : state.mapCenter[0];
  const defaultLng = state.pickedLocation ? state.pickedLocation.lng : state.mapCenter[1];

  const [formData, setFormData] = useState({
    name: "", address: "", lat: defaultLat, lng: defaultLng,
    phone: "", email: "", businessType: "Other", priority: "Medium",
    salesStage: "1 - Lead", nextStep: "follow up",
    natureOfBusiness: "", itemsSold: "", industry: "", estimateVolumePerDay: "",
    ownerName: "", shopkeeperName: "", ownerPhone: "", shopkeeperPhone: "",
    ownerEmail: "", shopkeeperEmail: "", additionalInfo: ""
  });

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/org-dashboard/field-map/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });
      const data = await res.json();
      if (data.success && data.account) {
        // We can parse the saved record and add to context
        const saved = data.account;
        let customFields = {} as any;
        try { customFields = JSON.parse(saved.customFields); } catch(e){}
          const newAcc: FieldAccount = {
            id: saved.id,
            name: saved.name,
            address: saved.address || "",
            lat: saved.latitude,
            lng: saved.longitude,
            salesStage: saved.salesStage,
            salesYTD: saved.salesYTD,
            nextStep: saved.nextStep,
            nextStepDate: saved.nextStepDate,
            daysSinceVisit: saved.daysSinceVisit || 0,
            priority: saved.priority,
            businessType: customFields.businessType,
            phone: customFields.phone,
            email: customFields.email,
            customFields,
            createdAt: new Date().toISOString(),
            notes: [],
            photos: []
          };
        dispatch({ type: "ADD_ACCOUNT", account: newAcc });
        dispatch({ type: "SET_PICKED_LOCATION", location: null });
        onClose();
      } else {
        alert("Failed to save account");
      }
    } catch(err) {
      alert("Error saving account.");
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) return alert("Empty CSV");
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const accounts = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = lines[i].split(',').map(v => v.trim());
        const acc: any = {};
        headers.forEach((h, idx) => {
          acc[h] = vals[idx] || "";
        });
        accounts.push(acc);
      }

      if (accounts.length > 0) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/org-dashboard/field-map/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accounts })
          });
          const data = await res.json();
          if (data.success) {
            alert(`Successfully imported ${data.count} accounts. Refreshing page to load new pins.`);
            window.location.reload();
          } else {
            alert("Bulk upload failed.");
          }
        } catch(err) {
          alert("Bulk upload error");
        }
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "8px", width: "90%", maxWidth: "500px", maxHeight: "90%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Add Accounts</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20}/></button>
        </div>
        
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <button onClick={() => setTab("single")} style={{ flex: 1, padding: "1rem", background: tab === "single" ? "white" : "#f8fafc", border: "none", borderBottom: tab === "single" ? "2px solid #3b82f6" : "2px solid transparent", fontWeight: "bold", color: tab === "single" ? "#3b82f6" : "#64748b", cursor: "pointer" }}>Single Account</button>
          <button onClick={() => setTab("bulk")} style={{ flex: 1, padding: "1rem", background: tab === "bulk" ? "white" : "#f8fafc", border: "none", borderBottom: tab === "bulk" ? "2px solid #3b82f6" : "2px solid transparent", fontWeight: "bold", color: tab === "bulk" ? "#3b82f6" : "#64748b", cursor: "pointer" }}>CSV Upload</button>
        </div>

        <div style={{ padding: "1.5rem", overflowY: "auto" }}>
          {tab === "single" && (
            <form onSubmit={handleSingleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {state.pickedLocation && (
                <div style={{ background: "#dcfce7", color: "#166534", padding: "0.8rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>
                  📍 Using coordinates from map pin drop.
                </div>
              )}
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Lat</label>
                  <input required value={formData.lat} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})} type="number" step="any" style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Lng</label>
                  <input required value={formData.lng} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})} type="number" step="any" style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Address</label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "#1e293b" }}>Business Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Nature of Business</label>
                    <input value={formData.natureOfBusiness} onChange={e => setFormData({...formData, natureOfBusiness: e.target.value})} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Industry</label>
                    <input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Items Sold</label>
                    <input value={formData.itemsSold} onChange={e => setFormData({...formData, itemsSold: e.target.value})} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Est. Volume/Day</label>
                    <input value={formData.estimateVolumePerDay} onChange={e => setFormData({...formData, estimateVolumePerDay: e.target.value})} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </div>

              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "#1e293b" }}>Owner Details</h4>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Owner Name</label>
                  <input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Phone</label>
                    <input value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} type="tel" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Email</label>
                    <input value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} type="email" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </div>

              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "#1e293b" }}>Shopkeeper Details</h4>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Shopkeeper Name</label>
                  <input value={formData.shopkeeperName} onChange={e => setFormData({...formData, shopkeeperName: e.target.value})} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Phone</label>
                    <input value={formData.shopkeeperPhone} onChange={e => setFormData({...formData, shopkeeperPhone: e.target.value})} type="tel" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#475569", marginBottom: "0.3rem" }}>Email</label>
                    <input value={formData.shopkeeperEmail} onChange={e => setFormData({...formData, shopkeeperEmail: e.target.value})} type="email" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Additional Information</label>
                <textarea value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} rows={2} style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", marginBottom: "0.3rem" }}>Sales Stage</label>
                  <select value={formData.salesStage} onChange={e => setFormData({...formData, salesStage: e.target.value})} style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                    <option value="1 - Lead">1 - Lead</option>
                    <option value="2 - Qualified">2 - Qualified</option>
                    <option value="3 - Proposal">3 - Proposal</option>
                    <option value="4 - Customer">4 - Customer</option>
                    <option value="5 - Churned">5 - Churned</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={onClose} style={{ padding: "0.6rem 1rem", border: "1px solid #cbd5e1", background: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Cancel</button>
                <button type="submit" disabled={isLoading} style={{ padding: "0.6rem 1rem", border: "none", background: "#3b82f6", color: "white", borderRadius: "4px", cursor: isLoading ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                  {isLoading ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          )}

          {tab === "bulk" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>CSV Format Requirements</h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: "1.5" }}>
                  Your CSV must include headers in the first row. Supported headers: 
                  <strong>name, address, lat, lng, phone, email, priority, salesStage, businessType, salesYTD, daysSinceVisit</strong>.
                </p>
              </div>
              
              <div 
                style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "3rem 1rem", textAlign: "center", background: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} color="#94a3b8" style={{ marginBottom: "1rem" }} />
                <div style={{ fontWeight: "bold", color: "#333", marginBottom: "0.3rem" }}>Click to Upload CSV File</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Max file size: 5MB</div>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  style={{ display: "none" }} 
                />
              </div>

              {isLoading && (
                <div style={{ textAlign: "center", color: "#3b82f6", fontWeight: "bold", fontSize: "0.9rem" }}>
                  Processing CSV Upload...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
