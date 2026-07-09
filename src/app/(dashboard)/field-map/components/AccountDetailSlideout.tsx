"use client";

import React, { useState } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { X, Building2, Phone, Mail, Calendar, Navigation, MapPin, CheckCircle2, Clock, CheckSquare } from "lucide-react";

export function AccountDetailSlideout() {
  const { state, dispatch } = useFieldMap();
  const [activeTab, setActiveTab] = useState<"details" | "history" | "checkin">("details");
  const [noteText, setNoteText] = useState("");

  const account = state.selectedAccount;

  if (!account) return null;

  const closeSlideout = () => dispatch({ type: "SET_SELECTED_ACCOUNT", account: null });
  
  const addToRoute = () => {
    dispatch({ type: "ADD_ROUTE_STOP", account });
    dispatch({ type: "SET_ACTIVE_TAB", tab: "routes" });
  };

  const handleCheckIn = () => {
    if (!noteText.trim()) {
      alert("Please enter a check-in note");
      return;
    }
    // In a real app we'd dispatch a checkin action here
    alert("Checked in successfully!");
    setNoteText("");
    setActiveTab("history");
  };

  return (
    <div style={{ 
      width: "350px", 
      background: "white", 
      boxShadow: "-2px 0 10px rgba(0,0,0,0.1)", 
      display: "flex", 
      flexDirection: "column", 
      zIndex: 40,
      borderLeft: "1px solid #e2e8f0"
    }}>
      {/* Header */}
      <div style={{ padding: "1.5rem 1rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
        <button 
          onClick={closeSlideout}
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", color: "#1e293b", paddingRight: "2rem" }}>{account.name}</h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
          <Building2 size={16} /> {account.company || "No Company"}
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            onClick={addToRoute}
            style={{ flex: 1, padding: "0.6rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Navigation size={16} /> Add to Route
          </button>
          <button 
            onClick={() => setActiveTab("checkin")}
            style={{ flex: 1, padding: "0.6rem", background: "white", color: "#22c55e", border: "1px solid #22c55e", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <MapPin size={16} /> Record Visit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
        <button onClick={() => setActiveTab("details")} style={{ flex: 1, padding: "0.8rem", background: activeTab === "details" ? "white" : "#f8fafc", border: "none", borderBottom: activeTab === "details" ? "2px solid #3b82f6" : "2px solid transparent", fontWeight: activeTab === "details" ? "bold" : "normal", cursor: "pointer", color: activeTab === "details" ? "#3b82f6" : "#64748b" }}>Details</button>
        <button onClick={() => setActiveTab("history")} style={{ flex: 1, padding: "0.8rem", background: activeTab === "history" ? "white" : "#f8fafc", border: "none", borderBottom: activeTab === "history" ? "2px solid #3b82f6" : "2px solid transparent", fontWeight: activeTab === "history" ? "bold" : "normal", cursor: "pointer", color: activeTab === "history" ? "#3b82f6" : "#64748b" }}>History</button>
        <button onClick={() => setActiveTab("checkin")} style={{ flex: 1, padding: "0.8rem", background: activeTab === "checkin" ? "white" : "#f8fafc", border: "none", borderBottom: activeTab === "checkin" ? "2px solid #3b82f6" : "2px solid transparent", fontWeight: activeTab === "checkin" ? "bold" : "normal", cursor: "pointer", color: activeTab === "checkin" ? "#3b82f6" : "#64748b" }}>Action</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {activeTab === "details" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div>
              <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Contact Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Phone size={16} color="#64748b" /> {account.phone || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Mail size={16} color="#64748b" /> {account.email || "—"}</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}><MapPin size={16} color="#64748b" style={{ marginTop: "2px" }} /> <span style={{ flex: 1 }}>{account.address || "—"}</span></div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Sales Status</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.2rem" }}>Stage</div>
                  <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#333" }}>{account.salesStage}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.2rem" }}>Priority</div>
                  <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#333" }}>{account.priority}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.2rem" }}>YTD Sales</div>
                  <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#22c55e" }}>${account.salesYTD.toLocaleString()}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.2rem" }}>Type</div>
                  <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#333" }}>{account.businessType}</div>
                </div>
              </div>
            </div>

            {(account.customFields?.natureOfBusiness || account.customFields?.industry || account.customFields?.itemsSold || account.customFields?.estimateVolumePerDay) && (
              <div>
                <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Business Details</h3>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#333" }}>
                  {account.customFields?.natureOfBusiness && <div><strong>Nature:</strong> {account.customFields.natureOfBusiness}</div>}
                  {account.customFields?.industry && <div><strong>Industry:</strong> {account.customFields.industry}</div>}
                  {account.customFields?.itemsSold && <div><strong>Items:</strong> {account.customFields.itemsSold}</div>}
                  {account.customFields?.estimateVolumePerDay && <div><strong>Est. Volume:</strong> {account.customFields.estimateVolumePerDay}</div>}
                </div>
              </div>
            )}

            {(account.customFields?.ownerName || account.customFields?.ownerPhone || account.customFields?.ownerEmail) && (
              <div>
                <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Owner Details</h3>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#333" }}>
                  {account.customFields?.ownerName && <div><strong>Name:</strong> {account.customFields.ownerName}</div>}
                  {account.customFields?.ownerPhone && <div><strong>Phone:</strong> {account.customFields.ownerPhone}</div>}
                  {account.customFields?.ownerEmail && <div><strong>Email:</strong> {account.customFields.ownerEmail}</div>}
                </div>
              </div>
            )}

            {(account.customFields?.shopkeeperName || account.customFields?.shopkeeperPhone || account.customFields?.shopkeeperEmail) && (
              <div>
                <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Shopkeeper Details</h3>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#333" }}>
                  {account.customFields?.shopkeeperName && <div><strong>Name:</strong> {account.customFields.shopkeeperName}</div>}
                  {account.customFields?.shopkeeperPhone && <div><strong>Phone:</strong> {account.customFields.shopkeeperPhone}</div>}
                  {account.customFields?.shopkeeperEmail && <div><strong>Email:</strong> {account.customFields.shopkeeperEmail}</div>}
                </div>
              </div>
            )}

            {account.customFields?.additionalInfo && (
              <div>
                <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Additional Info</h3>
                <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#333", whiteSpace: "pre-wrap" }}>
                  {account.customFields.additionalInfo}
                </div>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Next Step</h3>
              <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", color: "#1e3a8a", marginBottom: "0.5rem" }}>
                  <Calendar size={16} /> {account.nextStepDate}
                </div>
                <div style={{ color: "#1e40af", fontSize: "0.9rem" }}>{account.nextStep}</div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Notes</h3>
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#333", whiteSpace: "pre-wrap" }}>
                {account.notes.join('\n\n') || "No notes."}
              </div>
            </div>

          </div>
        )}

        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ borderLeft: "2px solid #e2e8f0", paddingLeft: "1rem", marginLeft: "0.5rem" }}>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <div style={{ position: "absolute", left: "-1.35rem", top: 0, width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6", border: "2px solid white" }} />
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.2rem" }}>Yesterday</div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", marginBottom: "0.2rem" }}>Phone Call</div>
                <div style={{ fontSize: "0.85rem", color: "#475569" }}>Discussed new product line. Requested proposal.</div>
              </div>
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <div style={{ position: "absolute", left: "-1.35rem", top: 0, width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.2rem" }}>{account.daysSinceVisit} days ago</div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", marginBottom: "0.2rem" }}>In-Person Visit</div>
                <div style={{ fontSize: "0.85rem", color: "#475569" }}>Dropped off samples. Met with manager.</div>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-1.35rem", top: 0, width: "12px", height: "12px", borderRadius: "50%", background: "#cbd5e1", border: "2px solid white" }} />
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.2rem" }}>Initial Creation</div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333" }}>Account Created</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "checkin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Log Activity</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.4rem" }}>Activity Type</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={{ flex: 1, padding: "0.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}><MapPin size={14}/> Visit</button>
                  <button style={{ flex: 1, padding: "0.5rem", background: "white", color: "#333", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}><Phone size={14}/> Call</button>
                  <button style={{ flex: 1, padding: "0.5rem", background: "white", color: "#333", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}><Mail size={14}/> Email</button>
                </div>
              </div>

              <textarea 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Meeting notes..." 
                rows={5} 
                style={{ width: "100%", padding: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1", marginBottom: "1rem", resize: "vertical", fontFamily: "inherit" }} 
              />
              
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.4rem" }}>Next Step Update</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="date" style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} defaultValue={account.nextStepDate} />
                  <select style={{ flex: 2, padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} defaultValue={account.nextStep}>
                    <option>follow up</option>
                    <option>phone call</option>
                    <option>proposal</option>
                    <option>close</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleCheckIn}
                style={{ width: "100%", padding: "0.8rem", background: "#22c55e", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <CheckSquare size={16} /> Save Activity
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
