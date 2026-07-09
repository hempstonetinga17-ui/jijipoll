"use client";

import React, { useState } from "react";
import { useFieldMap } from "../context/FieldMapContext";
import { Calendar as CalendarIcon, Clock, Plus, ExternalLink } from "lucide-react";

export function SchedulePanel() {
  const { state } = useFieldMap();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [routeStartTime, setRouteStartTime] = useState("08:00");
  const [showRouteSchedule, setShowRouteSchedule] = useState(true);

  // Mock week for mini calendar
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const dates = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + 1 + i);
    return {
      day: weekDays[i],
      date: d.getDate(),
      fullDate: d.toISOString().split('T')[0],
      isToday: d.toDateString() === today.toDateString()
    };
  });

  const appointmentsForDay = state.appointments.filter(a => a.date === selectedDate);
  const followUps = state.accounts.filter(a => a.nextStepDate >= selectedDate).sort((a, b) => a.nextStepDate.localeCompare(b.nextStepDate)).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1rem", background: "#1e3a8a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Schedule</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", padding: "4px 8px", borderRadius: "4px" }}
        >
          <Plus size={16}/> New
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        
        {/* Mini Calendar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          {dates.map((d, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedDate(d.fullDate)}
              style={{ 
                display: "flex", flexDirection: "column", alignItems: "center", 
                padding: "0.5rem 0.2rem", width: "13%", borderRadius: "8px",
                background: selectedDate === d.fullDate ? "#3b82f6" : d.isToday ? "#eff6ff" : "transparent",
                color: selectedDate === d.fullDate ? "white" : d.isToday ? "#3b82f6" : "#555",
                fontWeight: selectedDate === d.fullDate || d.isToday ? "bold" : "normal",
                cursor: "pointer",
                border: d.isToday && selectedDate !== d.fullDate ? "1px solid #bfdbfe" : "1px solid transparent"
              }}
            >
              <span style={{ fontSize: "0.7rem", textTransform: "uppercase", marginBottom: "0.2rem" }}>{d.day}</span>
              <span style={{ fontSize: "1.1rem" }}>{d.date}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => setShowRouteSchedule(true)}
            style={{ flex: 1, padding: "0.5rem", background: showRouteSchedule ? "#3b82f6" : "#f1f5f9", color: showRouteSchedule ? "white" : "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}
          >
            Route Schedule
          </button>
          <button 
            onClick={() => setShowRouteSchedule(false)}
            style={{ flex: 1, padding: "0.5rem", background: !showRouteSchedule ? "#3b82f6" : "#f1f5f9", color: !showRouteSchedule ? "white" : "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}
          >
            Fixed Appointments
          </button>
        </div>

        {showRouteSchedule ? (
          <div>
            <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Day Start Time</span>
                <input 
                  type="time" 
                  value={routeStartTime}
                  onChange={e => setRouteStartTime(e.target.value)}
                  style={{ padding: "0.3rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Setting your start time will dynamically schedule your optimized route, calculating travel buffers.</p>
            </div>

            {state.routeStops.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "2rem" }}>
                <Clock size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: "0.9rem" }}>No route stops selected.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
                {(() => {
                  let currentMinutes = parseInt(routeStartTime.split(':')[0]) * 60 + parseInt(routeStartTime.split(':')[1]);
                  
                  return state.routeStops.map((stop, index) => {
                    // Travel time to this stop
                    const travelMin = index === 0 ? 0 : (stop.estimatedArrivalMin || 0);
                    
                    if (travelMin > 0) {
                      currentMinutes += travelMin;
                    }
                    
                    const arrivalHour = Math.floor(currentMinutes / 60);
                    const arrivalMin = currentMinutes % 60;
                    const formattedArrival = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;
                    
                    currentMinutes += stop.estimatedDurationMin;
                    
                    const departureHour = Math.floor(currentMinutes / 60);
                    const departureMin = currentMinutes % 60;
                    const formattedDeparture = `${departureHour.toString().padStart(2, '0')}:${departureMin.toString().padStart(2, '0')}`;
                    
                    return (
                      <React.Fragment key={stop.id}>
                        {travelMin > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0 1rem", color: "#64748b" }}>
                            <div style={{ width: "2px", height: "20px", background: "#cbd5e1", marginLeft: "25px" }} />
                            <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              🚗 {travelMin} min travel buffer
                            </div>
                          </div>
                        )}
                        <div style={{ display: "flex", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "8px", borderLeft: "4px solid #f59e0b", background: "white" }}>
                          <div style={{ paddingRight: "1rem", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "90px" }}>
                            <span style={{ fontWeight: "bold", color: "#333", fontSize: "0.9rem" }}>{formattedArrival}</span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>until {formattedDeparture}</span>
                          </div>
                          <div style={{ paddingLeft: "1rem", flex: 1 }}>
                            <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{stop.account.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>Meeting: {stop.estimatedDurationMin} min</div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        ) : (
          <div>
            {showAddForm && (
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1rem", fontSize: "0.9rem" }}>New Appointment</h4>
                <select style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                  <option value="">Select Account...</option>
                  {state.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem" }}>
                  <input type="time" style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                  <select style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <textarea placeholder="Notes..." rows={2} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.8rem", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button onClick={() => setShowAddForm(false)} style={{ padding: "0.4rem 0.8rem", border: "1px solid #cbd5e1", background: "white", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => setShowAddForm(false)} style={{ padding: "0.4rem 0.8rem", border: "none", background: "#3b82f6", color: "white", borderRadius: "4px", cursor: "pointer" }}>Save</button>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem" }}>
              Appointments ({appointmentsForDay.length})
            </h3>
            
            {appointmentsForDay.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "2rem" }}>
                <CalendarIcon size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: "0.9rem" }}>No appointments scheduled for this day.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
                {appointmentsForDay.map(apt => (
                  <div key={apt.id} style={{ display: "flex", padding: "0.8rem", border: "1px solid #e2e8f0", borderRadius: "8px", borderLeft: "4px solid #3b82f6", background: "white" }}>
                    <div style={{ paddingRight: "1rem", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "70px" }}>
                      <span style={{ fontWeight: "bold", color: "#333" }}>{apt.time}</span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{apt.durationMin} min</span>
                    </div>
                    <div style={{ paddingLeft: "1rem", flex: 1 }}>
                      <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{apt.accountName}</div>
                      {apt.notes && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>{apt.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button style={{ width: "100%", padding: "0.8rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", marginBottom: "2rem" }}>
              <ExternalLink size={16} /> Export Route to Calendar
            </button>

            <h3 style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={14} /> Upcoming Follow-ups
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {followUps.map(acc => (
                <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem", background: "#f8fafc", borderRadius: "6px", fontSize: "0.85rem" }}>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#333" }}>{acc.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{acc.nextStep}</div>
                  </div>
                  <div style={{ fontWeight: "bold", color: acc.nextStepDate === selectedDate ? "#ef4444" : "#3b82f6" }}>
                    {acc.nextStepDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
