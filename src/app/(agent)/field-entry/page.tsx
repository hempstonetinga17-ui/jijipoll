"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Phone, CheckSquare, Plus, ArrowLeft, Navigation, Clock, Calendar, User, Loader2, Sparkles } from "lucide-react";
import { optimizeRoute } from "@/app/(dashboard)/field-map/utils/routeOptimizer";

const LocationPickerMap = dynamic(
  () => import("./components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 300, background: "#111827", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="#64748b" />
      </div>
    ),
  }
);

export default function FieldEntryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("route");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [tsForm, setTsForm] = useState({ date: new Date().toISOString().split("T")[0], hours: "", project: "", task: "" });
  const [leaveForm, setLeaveForm] = useState({ type: "PTO", startDate: "", endDate: "", reason: "" });
  const [prospectForm, setProspectForm] = useState({
    name: "", natureOfBusiness: "", itemsSold: "", industry: "", estimateVolumePerDay: "",
    ownerName: "", shopkeeperName: "", ownerPhone: "", shopkeeperPhone: "",
    ownerEmail: "", shopkeeperEmail: "", additionalInfo: "",
    address: "", lat: 0, lng: 0,
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); syncOfflineData(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const syncOfflineData = async () => {
    const queueStr = localStorage.getItem("jijipoll_offline_sync_queue");
    if (queueStr) {
      try {
        const queue = JSON.parse(queueStr);
        if (queue.length > 0) {
          alert(`Successfully synced ${queue.length} offline items to the server!`);
          localStorage.removeItem("jijipoll_offline_sync_queue");
          fetchData();
        }
      } catch (e) { console.error("Sync error", e); }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "route") {
        if (!navigator.onLine) {
          const cached = localStorage.getItem("jijipoll_cached_accounts");
          if (cached) setAccounts(JSON.parse(cached));
          setLoading(false);
          return;
        }
        const res = await fetch("/api/org-dashboard/field-map/accounts");
        let apiAccounts: any[] = [];
        if (res.ok) {
          const data = await res.json();
          apiAccounts = data.accounts || [];
        }
        let shopAccounts: any[] = [];
        try {
          const shopsRes = await fetch("/shops-data.json");
          if (shopsRes.ok) {
            const data = await shopsRes.json();
            if (data && data.shops) {
              shopAccounts = data.shops.map((shop: any, i: number) => ({
                id: shop.id || `sample-${Date.now()}-${i}`,
                name: shop.name || `Shop ${i}`,
                company: shop.name || `Shop ${i}`,
                phone: shop.phone || "",
                email: "",
                businessType: shop.channel || shop.industry || "Retail",
                lat: shop.lat,
                lng: shop.lng,
                address: shop.territory ? `Territory: ${shop.territory}` : `Lat: ${shop.lat?.toFixed(4)}, Lng: ${shop.lng?.toFixed(4)}`,
                notes: ["Auto-imported from shops-data.json", `Owner: ${shop.ownerName || "N/A"}`],
                createdAt: new Date().toISOString(),
              }));
            }
          }
        } catch (e) { console.error("Failed to fetch shops-data.json", e); }
        const combined = [...apiAccounts, ...shopAccounts];
        setAccounts(combined);
        localStorage.setItem("jijipoll_cached_accounts", JSON.stringify(combined));
      } else if (activeTab === "timesheet") {
        const res = await fetch("/api/hr/timesheets");
        if (res.ok) { const data = await res.json(); setTimesheets(data.records || []); }
      } else if (activeTab === "leave") {
        const res = await fetch("/api/hr/leave");
        if (res.ok) { const data = await res.json(); setLeaves(data.records || []); }
      }
    } catch (err) {
      console.error(err);
      if (activeTab === "route") {
        const cached = localStorage.getItem("jijipoll_cached_accounts");
        if (cached) setAccounts(JSON.parse(cached));
      }
    } finally { setLoading(false); }
  };

  const submitTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/timesheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tsForm) });
      if (res.ok) { alert("Timesheet submitted!"); setTsForm({ date: new Date().toISOString().split("T")[0], hours: "", project: "", task: "" }); fetchData(); }
    } catch { alert("Error submitting timesheet"); } finally { setSubmitting(false); }
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(leaveForm) });
      if (res.ok) { alert("Leave request submitted!"); setLeaveForm({ type: "PTO", startDate: "", endDate: "", reason: "" }); fetchData(); }
    } catch { alert("Error submitting leave request"); } finally { setSubmitting(false); }
  };

  const S: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif", paddingBottom: "80px", color: "#e2e8f0" },
    header: { background: "linear-gradient(135deg, #1e3a8a, #1e40af)", color: "white", padding: "1rem 1rem 2rem", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" },
    card: { background: "#111827", border: "1px solid #1e2d45", padding: "1rem", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", marginBottom: "0.8rem" },
    input: { width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #1e2d45", background: "#1a2235", color: "#e2e8f0", fontFamily: "inherit" },
    btn: { width: "100%", padding: "1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#111827", borderTop: "1px solid #1e2d45", display: "flex", padding: "0.5rem", zIndex: 50, paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" },
  };

  if (loading && accounts.length === 0 && timesheets.length === 0 && leaves.length === 0) {
    return <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" color="#3b82f6" /></div>;
  }

  // Account detail view
  if (selectedAccount) {
    return (
      <div style={S.page}>
        <div style={{ ...S.header, borderRadius: 0, padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => setSelectedAccount(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><ArrowLeft size={24} /></button>
          <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Visit Details</h1>
        </div>
        <div style={{ padding: "1rem" }}>
          <div style={S.card}>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", color: "#e2e8f0" }}>{selectedAccount.name}</h2>
            <div style={{ color: "#64748b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem" }}>
              <MapPin size={16} /> {selectedAccount.address || "No address"}
            </div>
            {selectedAccount.lat && selectedAccount.lng && (
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedAccount.lat},${selectedAccount.lng}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.8rem", background: "#1a2235", color: "#3b82f6", textDecoration: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "0.95rem", border: "1px solid #1e2d45" }}>
                <Navigation size={18} /> Get Directions
              </a>
            )}
          </div>
          <div style={S.card}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckSquare size={18} color="#3b82f6" /> Log Visit
            </h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visit notes..." style={{ ...S.input, minHeight: "120px", marginBottom: "1rem" }} />
            <button onClick={() => setSelectedAccount(null)} style={S.btn}>Save Visit</button>
          </div>
        </div>
      </div>
    );
  }

  // Add prospect view
  if (showAddProspect) {
    return (
      <div style={S.page}>
        <div style={{ ...S.header, borderRadius: 0, padding: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => setShowAddProspect(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><ArrowLeft size={24} /></button>
          <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Add Prospect</h1>
        </div>
        <div style={{ padding: "1rem" }}>
          <div style={S.card}>
            <button type="button" onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => { setProspectForm(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude })); alert(`Location captured: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`); },
                  (err) => alert("Could not fetch location. " + err.message)
                );
              } else { alert("Geolocation not supported."); }
            }} style={{ width: "100%", padding: "1rem", background: "#1a2235", border: "1px dashed #3b82f6", borderRadius: "8px", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Navigation size={18} /> Capture My Current Location
            </button>
            {prospectForm.lat !== 0 && (
              <div style={{ fontSize: "0.8rem", color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "0.5rem", borderRadius: "6px", marginBottom: "1rem", textAlign: "center" }}>
                Lat: {prospectForm.lat.toFixed(5)}, Lng: {prospectForm.lng.toFixed(5)}
              </div>
            )}
            <div style={{ marginBottom: "1.5rem" }}>
              <label>Select Location on Map</label>
              <LocationPickerMap lat={prospectForm.lat} lng={prospectForm.lng} onChange={(lat, lng) => setProspectForm({ ...prospectForm, lat, lng })} />
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", borderBottom: "1px solid #1e2d45", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Business Details</h3>
            {[
              { label: "Business Name *", key: "name", type: "text" },
              { label: "Nature of Business", key: "natureOfBusiness", type: "text", placeholder: "e.g. Retail, Wholesale" },
              { label: "Industry", key: "industry", type: "text", placeholder: "e.g. FMCG, Electronics" },
              { label: "Items Sold", key: "itemsSold", type: "text", placeholder: "e.g. Groceries, Mobile Phones" },
              { label: "Est. Volume per Day (Sales)", key: "estimateVolumePerDay", type: "text", placeholder: "e.g. 50,000 KES" },
              { label: "Physical Address", key: "address", type: "text", placeholder: "e.g. Moi Avenue, Biashara Street" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label>{label}</label>
                <input type={type} value={(prospectForm as any)[key]} onChange={e => setProspectForm({ ...prospectForm, [key]: e.target.value })} placeholder={placeholder} style={S.input} />
              </div>
            ))}

            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", borderBottom: "1px solid #1e2d45", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Owner Details</h3>
            {[
              { label: "Owner Name", key: "ownerName", type: "text" },
              { label: "Owner Phone", key: "ownerPhone", type: "tel" },
              { label: "Owner Email", key: "ownerEmail", type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label>{label}</label>
                <input type={type} value={(prospectForm as any)[key]} onChange={e => setProspectForm({ ...prospectForm, [key]: e.target.value })} style={S.input} />
              </div>
            ))}

            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", borderBottom: "1px solid #1e2d45", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Shopkeeper Details</h3>
            {[
              { label: "Shopkeeper Name", key: "shopkeeperName", type: "text" },
              { label: "Shopkeeper Phone", key: "shopkeeperPhone", type: "tel" },
              { label: "Shopkeeper Email", key: "shopkeeperEmail", type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label>{label}</label>
                <input type={type} value={(prospectForm as any)[key]} onChange={e => setProspectForm({ ...prospectForm, [key]: e.target.value })} style={S.input} />
              </div>
            ))}

            <div style={{ marginBottom: "1.5rem" }}>
              <label>Additional Information (Notes)</label>
              <textarea value={prospectForm.additionalInfo} onChange={e => setProspectForm({ ...prospectForm, additionalInfo: e.target.value })} placeholder="Any other relevant details..." style={{ ...S.input, minHeight: "80px" }} />
            </div>

            <button onClick={() => {
              if (!prospectForm.name) { alert("Business Name is required"); return; }
              if (prospectForm.lat === 0 || prospectForm.lng === 0) { alert("GPS Coordinates are required."); return; }
              const newAccount = { id: `offline-${Date.now()}`, ...prospectForm, createdAt: new Date().toISOString() };
              const queueStr = localStorage.getItem("jijipoll_offline_sync_queue");
              const queue = queueStr ? JSON.parse(queueStr) : [];
              queue.push(newAccount);
              localStorage.setItem("jijipoll_offline_sync_queue", JSON.stringify(queue));
              const newAccounts = [newAccount, ...accounts];
              setAccounts(newAccounts);
              localStorage.setItem("jijipoll_cached_accounts", JSON.stringify(newAccounts));
              alert(isOnline ? "Prospect saved and queued for sync!" : "Offline — saved locally, will sync when online.");
              setShowAddProspect(false);
              setProspectForm({ name: "", natureOfBusiness: "", itemsSold: "", industry: "", estimateVolumePerDay: "", ownerName: "", shopkeeperName: "", ownerPhone: "", shopkeeperPhone: "", ownerEmail: "", shopkeeperEmail: "", additionalInfo: "", address: "", lat: 0, lng: 0 });
            }} style={S.btn}>Save Prospect</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Route Tab */}
      {activeTab === "route" && (
        <>
          <div style={S.header}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: "bold" }}>My Territory</h1>
              {!isOnline && <span style={{ background: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" }}>OFFLINE</span>}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
          </div>
          <div style={{ padding: "1rem", marginTop: "-1.5rem" }}>
            <button onClick={() => {
              if (accounts.length < 2) return;
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const startLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    const stops = accounts.map((acc, i) => ({ account: acc, id: `stop-${i}`, order: i, visited: false, estimatedDurationMin: 30 }));
                    const optimized = optimizeRoute(stops, startLocation);
                    setAccounts(optimized.stops.map((s: any) => s.account));
                    alert("Route optimized based on your current location!");
                  },
                  () => {
                    const stops = accounts.map((acc, i) => ({ account: acc, id: `stop-${i}`, order: i, visited: false, estimatedDurationMin: 30 }));
                    const optimized = optimizeRoute(stops, null);
                    setAccounts(optimized.stops.map((s: any) => s.account));
                    alert("Route optimized!");
                  }
                );
              }
            }} style={{ width: "100%", padding: "0.8rem", background: "#111827", color: "#3b82f6", border: "1px solid #3b82f6", borderRadius: "8px", fontWeight: "bold", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem", boxShadow: "0 0 12px rgba(59,130,246,0.2)" }}>
              <Sparkles size={18} /> Optimize My Route
            </button>
            {accounts.map((acc, i) => (
              <div key={acc.id} onClick={() => setSelectedAccount(acc)} style={{ ...S.card, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ width: "28px", height: "28px", background: "rgba(59,130,246,0.15)", color: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.9rem", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#e2e8f0", display: "flex", justifyContent: "space-between" }}>
                    {acc.name}
                    {acc.id.startsWith("offline") && <span style={{ fontSize: "0.7rem", background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "2px 6px", borderRadius: "4px" }}>Pending Sync</span>}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}><MapPin size={14} /> {acc.address || "No address"}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAddProspect(true)} style={{ position: "fixed", bottom: "80px", right: "20px", width: "56px", height: "56px", background: "#3b82f6", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(59,130,246,0.5)", border: "none", cursor: "pointer", zIndex: 40 }}>
            <Plus size={28} />
          </button>
        </>
      )}

      {/* Timesheet Tab */}
      {activeTab === "timesheet" && (
        <div style={{ padding: "1rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "#e2e8f0" }}>Log Hours</h2>
          <form onSubmit={submitTimesheet} style={S.card}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}><label>Date</label><input type="date" required value={tsForm.date} onChange={e => setTsForm({ ...tsForm, date: e.target.value })} style={S.input} /></div>
              <div style={{ width: "100px" }}><label>Hours</label><input type="number" step="0.5" required value={tsForm.hours} onChange={e => setTsForm({ ...tsForm, hours: e.target.value })} placeholder="8" style={S.input} /></div>
            </div>
            <div style={{ marginBottom: "1rem" }}><label>Project / Client</label><input type="text" value={tsForm.project} onChange={e => setTsForm({ ...tsForm, project: e.target.value })} placeholder="e.g. Downtown Sector" style={S.input} /></div>
            <div style={{ marginBottom: "1rem" }}><label>Notes</label><textarea value={tsForm.task} onChange={e => setTsForm({ ...tsForm, task: e.target.value })} placeholder="What did you work on?" rows={2} style={S.input} /></div>
            <button type="submit" disabled={submitting} style={S.btn}>{submitting ? "Submitting..." : "Submit Timesheet"}</button>
          </form>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#64748b" }}>Recent Submissions</h3>
          {timesheets.map(ts => (
            <div key={ts.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{new Date(ts.date).toLocaleDateString()}</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{ts.hours} Hours {ts.project && `• ${ts.project}`}</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.5rem", borderRadius: "4px", background: ts.status === "APPROVED" ? "rgba(16,185,129,0.15)" : ts.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "#1a2235", color: ts.status === "APPROVED" ? "#10b981" : ts.status === "REJECTED" ? "#ef4444" : "#64748b" }}>
                {ts.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === "leave" && (
        <div style={{ padding: "1rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "#e2e8f0" }}>Request Leave</h2>
          <form onSubmit={submitLeave} style={S.card}>
            <div style={{ marginBottom: "1rem" }}><label>Leave Type</label><select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })} style={S.input}><option value="PTO">Paid Time Off</option><option value="SICK">Sick Leave</option><option value="MATERNITY">Maternity/Paternity</option><option value="UNPAID">Unpaid Leave</option></select></div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}><label>Start Date</label><input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} style={S.input} /></div>
              <div style={{ flex: 1 }}><label>End Date</label><input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} style={S.input} /></div>
            </div>
            <div style={{ marginBottom: "1rem" }}><label>Reason</label><textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Optional details..." rows={2} style={S.input} /></div>
            <button type="submit" disabled={submitting} style={S.btn}>{submitting ? "Submitting..." : "Submit Request"}</button>
          </form>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#64748b" }}>My Requests</h3>
          {leaves.map(lv => (
            <div key={lv.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{lv.type} Leave</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{new Date(lv.startDate).toLocaleDateString()} - {new Date(lv.endDate).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.5rem", borderRadius: "4px", background: lv.status === "APPROVED" ? "rgba(16,185,129,0.15)" : lv.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "#1a2235", color: lv.status === "APPROVED" ? "#10b981" : lv.status === "REJECTED" ? "#ef4444" : "#64748b" }}>
                {lv.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div style={{ padding: "2rem 1rem", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1e40af)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold", margin: "0 auto 1rem", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>A</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#e2e8f0" }}>Field Agent</h2>
          <p style={{ color: "#64748b", margin: 0 }}>JijiPoll Agent App</p>
          <div style={{ marginTop: "2rem", background: "#111827", borderRadius: "12px", border: "1px solid #1e2d45", overflow: "hidden", textAlign: "left" }}>
            <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", color: "#e2e8f0" }}><User size={18} color="#64748b" /> My Profile</div>
            <div style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", color: "#ef4444", cursor: "pointer", borderTop: "1px solid #1e2d45" }} onClick={() => router.push("/")}>
              <ArrowLeft size={18} /> Back to Dashboard
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={S.nav}>
        {[
          { id: "route",     icon: <MapPin size={24} />,    label: "Route"   },
          { id: "timesheet", icon: <Clock size={24} />,     label: "Hours"   },
          { id: "leave",     icon: <Calendar size={24} />,  label: "Leave"   },
          { id: "profile",   icon: <User size={24} />,      label: "Profile" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: activeTab === tab.id ? "#3b82f6" : "#475569", cursor: "pointer" }}>
            {tab.icon}
            <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
