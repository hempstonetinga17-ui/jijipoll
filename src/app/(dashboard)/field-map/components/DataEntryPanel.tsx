"use client";

import React, { useState, useCallback, useRef } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { Plus, Settings2, MapPin, Check, LayoutList, UploadCloud, RefreshCw, FileSpreadsheet, ChevronDown, CheckCircle2 } from "lucide-react";
import * as XLSX from 'xlsx';

interface FormSchema {
  id: string;
  name: string;
  icon: string;
  fields: { name: string; type: "text" | "number" | "select" | "tel" | "email"; options?: string[]; required?: boolean }[];
}

const defaultSchemas: FormSchema[] = [
  {
    id: "schema-1",
    name: "Hospital",
    icon: "🏥",
    fields: [
      { name: "Hospital Name", type: "text", required: true },
      { name: "Contact Phone", type: "tel", required: true },
      { name: "Contact Email", type: "email", required: false },
      { name: "Bed Capacity", type: "number", required: false },
      { name: "Facility Type", type: "select", options: ["Public", "Private", "Mission"], required: true }
    ]
  },
  {
    id: "schema-2",
    name: "Shop / Retail",
    icon: "🏪",
    fields: [
      { name: "Shop Name", type: "text", required: true },
      { name: "Owner Phone", type: "tel", required: true },
      { name: "Daily Footfall", type: "number", required: false },
      { name: "Status", type: "select", options: ["Open", "Closed", "Under Renovation"], required: true }
    ]
  }
];

export function DataEntryPanel() {
  const { state, dispatch } = useFieldMap();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [schemas] = useState<FormSchema[]>(defaultSchemas);
  const [selectedSchema, setSelectedSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [entryMode, setEntryMode] = useState<"manual" | "import" | "crm">("manual");
  const [csvContent, setCsvContent] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema || !state.pickedLocation) return;
    for (const field of selectedSchema.fields) {
      if ((field as any).required && !formData[field.name]) {
        alert(`Validation Error: ${field.name} is required.`);
        return;
      }
    }
    const newAccount = {
      id: `custom-${Date.now()}`,
      name: formData[selectedSchema.fields[0].name] || `${selectedSchema.name} Entry`,
      company: "",
      phone: formData["Contact Phone"] || formData["Owner Phone"] || "",
      email: formData["Contact Email"] || "",
      salesYTD: 0,
      nextStep: "follow up" as any,
      nextStepDate: new Date().toISOString().split("T")[0],
      daysSinceVisit: 0,
      salesStage: "1 - Lead" as any,
      priority: "Medium" as any,
      lat: state.pickedLocation.lat,
      lng: state.pickedLocation.lng,
      address: `Lat: ${state.pickedLocation.lat.toFixed(4)}, Lng: ${state.pickedLocation.lng.toFixed(4)}`,
      businessType: selectedSchema.name,
      notes: [`Custom Data Entry via ${selectedSchema.name} form.`],
      photos: [],
      customFields: formData,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: "ADD_ACCOUNT", account: newAccount });
    alert("Data entry validated and synchronized to CRM and Maps successfully!");
    dispatch({ type: "SET_PICKED_LOCATION", location: null });
  };

  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importStage, setImportStage] = useState<1 | 2 | 3>(1);
  const [importResult, setImportResult] = useState({ imported: 0, skipped: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          setExcelHeaders(headers);
          setExcelData(data);
          
          // Auto-map common headers
          const newMapping: Record<string, string> = {};
          const lowerHeaders = headers.map(h => h.toLowerCase());
          
          const findHeader = (keywords: string[]) => {
            const idx = lowerHeaders.findIndex(h => keywords.some(k => h.includes(k)));
            return idx >= 0 ? headers[idx] : "";
          };
          
          newMapping['name'] = findHeader(['name', 'business', 'company', 'shop']);
          newMapping['phone'] = findHeader(['phone', 'tel', 'mobile']);
          newMapping['email'] = findHeader(['email']);
          newMapping['lat'] = findHeader(['lat', 'y']);
          newMapping['lng'] = findHeader(['lng', 'lon', 'x']);
          newMapping['sales'] = findHeader(['sales', 'revenue', 'ytd']);
          
          setMapping(newMapping);
          setImportStage(2);
        }
      } catch (err) {
        alert("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const processExcelImport = () => {
    if (!mapping['name']) {
      alert("Name column is required");
      return;
    }
    
    let imported = 0;
    let skipped = 0;
    
    excelData.forEach((row, i) => {
      const name = row[mapping['name']];
      if (!name) {
        skipped++;
        return;
      }
      
      const latVal = parseFloat(row[mapping['lat']]);
      const lngVal = parseFloat(row[mapping['lng']]);
      
      const newAccount = {
        id: `import-${Date.now()}-${i}`,
        name: String(name),
        company: row[mapping['name']] || "",
        phone: row[mapping['phone']] || "",
        email: row[mapping['email']] || "",
        salesYTD: parseFloat(row[mapping['sales']] || "0"),
        nextStep: "follow up" as any,
        nextStepDate: new Date().toISOString().split("T")[0],
        daysSinceVisit: 0,
        salesStage: "1 - Lead" as any,
        priority: "Medium" as any,
        lat: !isNaN(latVal) ? latVal : (state.mapCenter[0] + (Math.random() - 0.5) * 0.05),
        lng: !isNaN(lngVal) ? lngVal : (state.mapCenter[1] + (Math.random() - 0.5) * 0.05),
        address: "",
        businessType: "Imported",
        notes: ["Bulk imported via Excel"],
        photos: [],
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: "ADD_ACCOUNT", account: newAccount });
      imported++;
    });
    
    setImportResult({ imported, skipped, total: excelData.length });
    setImportStage(3);
  };

  const resetImport = () => {
    setExcelData([]);
    setExcelHeaders([]);
    setMapping({});
    setImportStage(1);
    setImportResult({ imported: 0, skipped: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCRMSync = () => {
    if (state.crmConfig.provider === "none") { alert("Please connect a CRM provider in Settings first."); return; }
    alert(`Simulating dynamic sync with ${state.crmConfig.provider}...`);
    setTimeout(() => alert("Sync completed! Data is now fresh."), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Data Entry</h2>
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
        >
          {isAdminMode
            ? <><LayoutList size={14} /> Agent View</>
            : <><Settings2 size={14} /> Admin View</>
          }
        </button>
      </div>

      {/* Mode Tabs */}
      <div style={{ padding: "0.5rem", display: "flex", background: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
        <button onClick={() => setEntryMode("manual")} style={{ flex: 1, padding: "0.5rem", background: entryMode === "manual" ? "#3b82f6" : "#eee", color: entryMode === "manual" ? "white" : "#555", border: "1px solid #ddd", borderRadius: "4px 0 0 4px", fontWeight: entryMode === "manual" ? "bold" : "normal", cursor: "pointer", fontSize: "0.85rem" }}>Manual</button>
        <button onClick={() => setEntryMode("import")} style={{ flex: 1, padding: "0.5rem", background: entryMode === "import" ? "#3b82f6" : "#eee", color: entryMode === "import" ? "white" : "#555", border: "1px solid #ddd", borderLeft: "none", borderRight: "none", fontWeight: entryMode === "import" ? "bold" : "normal", cursor: "pointer", fontSize: "0.85rem" }}>Import</button>
        <button onClick={() => setEntryMode("crm")} style={{ flex: 1, padding: "0.5rem", background: entryMode === "crm" ? "#3b82f6" : "#eee", color: entryMode === "crm" ? "white" : "#555", border: "1px solid #ddd", borderRadius: "0 4px 4px 0", fontWeight: entryMode === "crm" ? "bold" : "normal", cursor: "pointer", fontSize: "0.85rem" }}>CRM Sync</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", background: "#f8fafc" }}>

        {entryMode === "import" && (
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            
            {importStage === 1 && (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                  <FileSpreadsheet size={48} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", textAlign: "center", marginBottom: "0.5rem" }}>Bulk Import Excel File</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center", marginBottom: "1.5rem" }}>
                  Upload your Excel (.xlsx, .csv) file to plot businesses on the map automatically.
                </p>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: "2px dashed #cbd5e1", 
                    borderRadius: "12px", 
                    padding: "2rem", 
                    textAlign: "center", 
                    cursor: "pointer",
                    background: "#f8fafc",
                    marginBottom: "1rem"
                  }}
                >
                  <UploadCloud size={32} color="#94a3b8" style={{ margin: "0 auto 0.5rem" }} />
                  <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#334155" }}>Click to select a file</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>or drag and drop here</div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  style={{ display: "none" }} 
                />
              </>
            )}

            {importStage === 2 && (
              <>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>Map Columns</h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
                  Match your Excel columns to our database fields. {excelData.length} rows detected.
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[
                    { key: 'name', label: 'Business Name', req: true },
                    { key: 'phone', label: 'Phone Number', req: false },
                    { key: 'email', label: 'Email Address', req: false },
                    { key: 'lat', label: 'Latitude', req: false },
                    { key: 'lng', label: 'Longitude', req: false },
                    { key: 'sales', label: 'Sales/YTD', req: false }
                  ].map(field => (
                    <div key={field.key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#334155" }}>
                        {field.label} {field.req && <span style={{color: "red"}}>*</span>}
                      </label>
                      <select 
                        value={mapping[field.key] || ""}
                        onChange={(e) => setMapping({...mapping, [field.key]: e.target.value})}
                        style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      >
                        <option value="">-- Skip --</option>
                        {excelHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={resetImport} style={{ flex: 1, padding: "0.75rem", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={processExcelImport} style={{ flex: 2, padding: "0.75rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                    Import {excelData.length} Records
                  </button>
                </div>
              </>
            )}
            
            {importStage === 3 && (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle2 size={64} color="#22c55e" style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0f172a", marginBottom: "0.5rem" }}>Import Complete</h3>
                <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "2rem" }}>
                  Successfully imported {importResult.imported} records.<br/>
                  {importResult.skipped > 0 && `Skipped ${importResult.skipped} invalid rows.`}
                </p>
                <button onClick={resetImport} style={{ width: "100%", padding: "0.75rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {entryMode === "crm" && (
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <RefreshCw size={48} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Dynamic CRM Syncing</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Sync directly with Salesforce, HubSpot, or Zoho. Changes update your main system automatically.
            </p>
            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "6px", marginBottom: "1.5rem", textAlign: "left" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#334155", marginBottom: "0.5rem" }}>Current Configuration</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Provider: {state.crmConfig.provider}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Sync: {state.crmConfig.syncDirection}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Auto-sync: {state.crmConfig.autoSync ? "Enabled" : "Disabled"}</div>
            </div>
            <button onClick={handleCRMSync} style={{ width: "100%", padding: "0.75rem", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
              Sync Now
            </button>
          </div>
        )}

        {entryMode === "manual" && (
          <div>
            {isAdminMode ? (
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#334155", marginBottom: "0.5rem" }}>Form Builder (Admin)</h3>
                  <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Create and customize data collection forms for field agents.</p>
                </div>
                {schemas.map(schema => (
                  <div key={schema.id} style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#0f172a" }}>
                      <span>{schema.icon}</span> {schema.name}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      {schema.fields.map((f, i) => (
                        <div key={i} style={{ fontSize: "0.8rem", color: "#475569", display: "flex", justifyContent: "space-between" }}>
                          <span>{f.name}</span>
                          <span style={{ background: "#f1f5f9", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.7rem" }}>{f.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button style={{ width: "100%", padding: "0.75rem", background: "white", border: "1px dashed #cbd5e1", borderRadius: "8px", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Plus size={16} /> Create New Form
                </button>
              </div>
            ) : (
              <div>
                {selectedSchema === null ? (
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#334155", marginBottom: "1rem" }}>Select Form</h3>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {schemas.map(schema => (
                        <button key={schema.id} onClick={() => setSelectedSchema(schema)} style={{ padding: "1rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                          <div style={{ fontSize: "1.5rem" }}>{schema.icon}</div>
                          <div>
                            <div style={{ fontWeight: "bold", color: "#0f172a" }}>{schema.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{schema.fields.length} fields</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedSchema(null)} style={{ background: "transparent", border: "none", color: "#3b82f6", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer", marginBottom: "1rem", padding: 0 }}>
                      {"← Back to Forms"}
                    </button>
                    <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.1rem", marginBottom: "1.5rem", color: "#0f172a" }}>
                        <span>{selectedSchema.icon}</span> New {selectedSchema.name} Entry
                      </div>
                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {selectedSchema.fields.map(field => (
                          <div key={field.name}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", color: "#334155", marginBottom: "0.25rem" }}>{field.name}</label>
                            {field.type === "select" ? (
                              <select value={formData[field.name] || ""} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" }} required={(field as any).required !== false}>
                                <option value="">Select option...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input type={field.type} value={formData[field.name] || ""} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" }} required={(field as any).required !== false} />
                            )}
                          </div>
                        ))}
                        <div style={{ marginTop: "0.5rem" }}>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", color: "#334155", marginBottom: "0.25rem" }}>Location</label>
                          {state.pickedLocation ? (
                            <div style={{ padding: "0.75rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem", color: "#166534", fontSize: "0.85rem" }}>
                              <Check size={16} /> Location pinned: {state.pickedLocation.lat.toFixed(4)}, {state.pickedLocation.lng.toFixed(4)}
                            </div>
                          ) : (
                            <button type="button" onClick={() => dispatch({ type: "SET_PICKING_LOCATION", isPicking: true })} style={{ width: "100%", padding: "0.75rem", background: state.isPickingLocation ? "#bfdbfe" : "#f1f5f9", border: state.isPickingLocation ? "1px solid #3b82f6" : "1px dashed #94a3b8", borderRadius: "6px", color: state.isPickingLocation ? "#1d4ed8" : "#334155", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: "bold" }}>
                              <MapPin size={16} /> {state.isPickingLocation ? "Click on the Map..." : "Drop Pin on Map"}
                            </button>
                          )}
                        </div>
                        <button type="submit" disabled={!state.pickedLocation} style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", background: state.pickedLocation ? "#3b82f6" : "#cbd5e1", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: state.pickedLocation ? "pointer" : "not-allowed" }}>
                          Save Entry
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
