"use client";

import React, { useState, useMemo } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { TrendingUp, Car, CheckCircle, Target, Download, PieChart as PieIcon, Map as MapIcon, Layers } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ReportsPanel() {
  const { state } = useFieldMap();
  const [tab, setTab] = useState<"activity" | "mileage" | "performance" | "analytics">("analytics");
  
  const { activityReports, mileageTotal } = state;
  const todayReport = activityReports[0] || { visitsCompleted: 0, leadsCapture: 0, dealsWon: 0, mileageKm: 0, checkIns: 0 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Reporting</h2>
      </div>

      <div style={{ padding: "0.5rem", display: "flex", background: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
        {["activity", "mileage", "performance", "analytics"].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t as any)}
            style={{ 
              flex: 1, padding: "0.5rem", fontSize: "0.85rem",
              background: tab === t ? "#3b82f6" : "#eee", 
              color: tab === t ? "white" : "#555", 
              border: "1px solid #ddd", 
              fontWeight: tab === t ? "bold" : "normal", 
              cursor: "pointer",
              textTransform: "capitalize",
              borderRadius: t === "activity" ? "4px 0 0 4px" : t === "analytics" ? "0 4px 4px 0" : "0"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", background: "#f8fafc" }}>
        
        {tab === "analytics" && <AnalyticsView accounts={state.filteredAccounts} />}
        
        {tab === "activity" && (
          <div>
            <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>Today's Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "2rem" }}>
              <SummaryCard icon={<CheckCircle size={20} color="#22c55e" />} title="Visits" value={todayReport.visitsCompleted} />
              <SummaryCard icon={<Target size={20} color="#3b82f6" />} title="Leads" value={todayReport.leadsCapture} />
              <SummaryCard icon={<TrendingUp size={20} color="#f59e0b" />} title="Deals" value={todayReport.dealsWon} />
              <SummaryCard icon={<Car size={20} color="#8b5cf6" />} title="Distance" value={`${todayReport.mileageKm} km`} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", margin: 0 }}>Weekly Activity</h3>
              <button style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.8rem", fontWeight: "bold" }}>
                <Download size={14} /> Export
              </button>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", color: "#666" }}>
                  <th style={{ padding: "0.5rem 0" }}>Date</th>
                  <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Visits</th>
                  <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Leads</th>
                </tr>
              </thead>
              <tbody>
                {activityReports.slice(0, 7).map((report, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.6rem 0", fontWeight: i === 0 ? "bold" : "normal" }}>
                      {i === 0 ? "Today" : report.date.substring(5)}
                    </td>
                    <td style={{ padding: "0.6rem 0", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <span>{report.visitsCompleted}</span>
                        <div style={{ width: "40px", height: "4px", background: "#eee", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, report.visitsCompleted * 10)}%`, height: "100%", background: "#22c55e" }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.6rem 0", textAlign: "right" }}>{report.leadsCapture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "mileage" && (
          <div>
            <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center", marginBottom: "2rem" }}>
              <Car size={32} color="#3b82f6" style={{ margin: "0 auto 0.5rem" }} />
              <div style={{ fontSize: "0.9rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Total Mileage (MTD)</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1e293b", margin: "0.5rem 0" }}>{mileageTotal.toFixed(1)} <span style={{ fontSize: "1.2rem", color: "#94a3b8" }}>km</span></div>
              <div style={{ fontSize: "0.9rem", color: "#22c55e", fontWeight: "bold" }}>~ Kes {(mileageTotal * 35).toLocaleString()} Est. Expense</div>
            </div>

            <button style={{ width: "100%", padding: "0.8rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", marginBottom: "2rem" }}>
              <Download size={16} /> Generate IRS/KRA Compliant Report
            </button>

            <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "1rem" }}>Daily Breakdown</h3>
            {activityReports.slice(0, 5).map((report, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0", borderBottom: "1px solid #eee" }}>
                <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: i === 0 ? "bold" : "normal" }}>{i === 0 ? "Today" : report.date}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#3b82f6" }}>{report.mileageKm} km</span>
              </div>
            ))}
          </div>
        )}

        {tab === "performance" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "conic-gradient(#22c55e 78%, #e2e8f0 0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b" }}>78</span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Score</span>
                </div>
              </div>
              <div style={{ color: "#22c55e", fontWeight: "bold", fontSize: "0.9rem" }}>Top 15% of team</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "2rem" }}>
              <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", marginBottom: "0.5rem" }}>Conversion Rate</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>24%</div>
                <div style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.2rem" }}>+2% this month</div>
              </div>
              <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", marginBottom: "0.5rem" }}>Avg Deal Size</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>$4.2k</div>
                <div style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.2rem" }}>+$300 this month</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) {
  return (
    <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>{value}</div>
    </div>
  );
}

function AnalyticsView({ accounts }: { accounts: any[] }) {
  const geoContacts = useMemo(() => accounts.filter(c => c.lat && c.lng), [accounts]);
  
  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    accounts.forEach(c => {
      const ind = c.businessType || "Other";
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [accounts]);

  const salesStageData = useMemo(() => {
    const counts: Record<string, number> = {};
    accounts.forEach(c => {
      const st = c.salesStage || "Unknown";
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  const territoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    accounts.forEach(c => {
      const t = c.territory || "Unassigned";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [accounts]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1'];

  if (accounts.length === 0) {
    return <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No data available for analysis.</div>;
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <SummaryCard icon={<Layers size={20} color="#3b82f6" />} title="Total Accounts" value={accounts.length} />
        <SummaryCard icon={<MapIcon size={20} color="#10b981" />} title="Mapped" value={geoContacts.length} />
      </div>

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PieIcon size={18} color="#8b5cf6" /> Business Types
        </h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={industryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {industryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} Accounts`, 'Count']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={18} color="#3b82f6" /> Pipeline Overview
        </h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MapIcon size={18} color="#10b981" /> Top Territories
        </h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={territoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{fontSize: 10}} angle={-45} textAnchor="end" />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value: any) => [`${value} Accounts`, 'Count']} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
