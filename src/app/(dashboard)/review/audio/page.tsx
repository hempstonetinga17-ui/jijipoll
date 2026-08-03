"use client"
import { useState, useEffect, useRef } from "react"
import { Mic, Play, Pause, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight, MessageSquare, Volume2, Globe, Clock, User } from "lucide-react"

interface AudioSub {
  id: string
  scriptPrompt?: string
  audioUrl: string
  durationSecs?: number
  dialect?: string
  audioType: string
  environment: string
  speakerGender?: string
  speakerAge?: string
  status: string
  grade?: number
  feedback?: string
  language?: { name: string; code: string }
  agent: { id: string; name?: string; phoneNumber?: string }
  task?: { title: string }
  annotations: { id: string; grade?: number; notes?: string; phoneticMarking?: string; culturalNote?: string; approved?: boolean; annotator: { name?: string } }[]
  createdAt: string
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.1rem", color: (hovered || value) >= n ? "#f59e0b" : "#334155", transition: "color 0.1s" }}>
          <Star size={18} fill={(hovered || value) >= n ? "#f59e0b" : "none"} />
        </button>
      ))}
    </div>
  )
}

export default function AudioReviewPage() {
  const [items, setItems] = useState<AudioSub[]>([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [grade, setGrade] = useState(0)
  const [notes, setNotes] = useState("")
  const [phonetic, setPhonetic] = useState("")
  const [cultural, setCultural] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const audioRef = useRef<HTMLAudioElement>(null)

  const load = () => {
    setLoading(true)
    fetch(`/api/submissions/audio?status=${statusFilter}&limit=50`)
      .then(r => r.json())
      .then(data => { setItems(data.submissions ?? []); setIdx(0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  const current = items[idx]

  const resetForm = () => { setGrade(0); setNotes(""); setPhonetic(""); setCultural(""); setPlaying(false) }

  const navigate = (dir: number) => {
    resetForm()
    setIdx(i => Math.max(0, Math.min(items.length - 1, i + dir)))
  }

  const submitAnnotation = async (approved: boolean) => {
    if (!current) return
    setSubmitting(true)
    await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionType: 'audio',
        submissionId: current.id,
        grade: grade * 20, // convert 1-5 stars to 0-100
        approved,
        notes,
        phoneticMarking: phonetic,
        culturalNote: cultural,
        feedback: notes,
        labels: [],
      }),
    })
    setSubmitting(false)
    load()
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>Loading submissions…</div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0d1117 100%)", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mic size={16} color="#8b5cf6" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#f1f5f9" }}>Audio Review Queue</h1>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#475569" }}>{items.length} submissions · {idx + 1} of {items.length}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {['PENDING','APPROVED','REJECTED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "0.35rem 0.85rem", borderRadius: "7px", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", border: "1px solid",
                background: statusFilter === s ? (s === 'APPROVED' ? 'rgba(16,185,129,0.15)' : s === 'REJECTED' ? 'rgba(239,68,68,0.12)' : 'rgba(139,92,246,0.15)') : 'rgba(255,255,255,0.04)',
                borderColor: statusFilter === s ? (s === 'APPROVED' ? 'rgba(16,185,129,0.4)' : s === 'REJECTED' ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.4)') : 'rgba(255,255,255,0.08)',
                color: statusFilter === s ? (s === 'APPROVED' ? '#10b981' : s === 'REJECTED' ? '#ef4444' : '#8b5cf6') : '#475569' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", flexDirection: "column", gap: "1rem" }}>
          <Mic size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontWeight: 600 }}>No {statusFilter.toLowerCase()} audio submissions</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
          {/* Main review panel */}
          <div style={{ padding: "2rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {current && (
              <>
                {/* Task info */}
                {current.task && (
                  <div style={{ fontSize: "0.72rem", color: "#475569" }}>Task: <span style={{ color: "#94a3b8", fontWeight: 600 }}>{current.task.title}</span></div>
                )}

                {/* Script prompt */}
                {current.scriptPrompt && (
                  <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "1.25rem" }}>
                    <p style={{ margin: "0 0 0.4rem", fontSize: "0.68rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em" }}>Script / Prompt</p>
                    <p style={{ margin: 0, fontSize: "1rem", color: "#e2e8f0", lineHeight: 1.6 }}>{current.scriptPrompt}</p>
                  </div>
                )}

                {/* Audio player */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: playing ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)", border: `2px solid ${playing ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                    onClick={togglePlay}>
                    {playing ? <Pause size={32} color="#8b5cf6" /> : <Play size={32} color="#94a3b8" style={{ marginLeft: "4px" }} />}
                  </div>
                  {current.durationSecs && (
                    <span style={{ fontSize: "0.8rem", color: "#475569" }}>{Math.round(current.durationSecs)}s</span>
                  )}
                  <audio ref={audioRef} src={current.audioUrl} onEnded={() => setPlaying(false)} style={{ display: "none" }} />
                </div>

                {/* Metadata badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {[
                    { label: current.language?.name ?? 'Unknown Lang', icon: <Globe size={11} /> },
                    { label: current.dialect ?? 'Standard', icon: <Volume2 size={11} /> },
                    { label: current.audioType, icon: <MessageSquare size={11} /> },
                    { label: current.environment, icon: <Volume2 size={11} /> },
                    { label: current.speakerGender ?? 'Unknown', icon: <User size={11} /> },
                    { label: current.speakerAge ?? 'Unknown age', icon: <Clock size={11} /> },
                  ].map(({ label, icon }) => (
                    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.65rem", borderRadius: "7px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", fontSize: "0.72rem", color: "#64748b" }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Annotation sidebar */}
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", background: "rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Annotation Panel</h3>

            {/* Agent info */}
            {current && (
              <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "#475569" }}>Submitted by</p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>{current.agent?.name ?? current.agent?.phoneNumber ?? 'Unknown'}</p>
              </div>
            )}

            {/* Quality stars */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase" }}>Quality Rating</label>
              <StarRating value={grade} onChange={setGrade} />
            </div>

            {/* Phonetic notes */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.4rem", textTransform: "uppercase" }}>Phonetic/Dialectal Notes</label>
              <textarea value={phonetic} onChange={e => setPhonetic(e.target.value)} rows={2}
                placeholder="IPA notes, dialectal markers, pronunciation issues…"
                style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "#e2e8f0", fontSize: "0.82rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {/* Cultural notes */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.4rem", textTransform: "uppercase" }}>Cultural Note</label>
              <textarea value={cultural} onChange={e => setCultural(e.target.value)} rows={2}
                placeholder="Regional context, cultural accuracy, community relevance…"
                style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "#e2e8f0", fontSize: "0.82rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {/* General feedback */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.4rem", textTransform: "uppercase" }}>Feedback to Agent</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="What should the agent improve? Be specific and constructive."
                style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "#e2e8f0", fontSize: "0.82rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {/* Previous annotations */}
            {current?.annotations?.length > 0 && (
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase" }}>Previous Annotations</label>
                {current.annotations.map(a => (
                  <div key={a.id} style={{ padding: "0.6rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "0.4rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{a.annotator?.name ?? 'Annotator'}</span>
                      <span style={{ fontSize: "0.7rem", color: a.approved ? '#10b981' : '#ef4444' }}>{a.approved ? '✓ Approved' : '✗ Rejected'}</span>
                    </div>
                    {a.notes && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>{a.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Approve/Reject buttons */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => submitAnnotation(false)} disabled={submitting}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
                <XCircle size={14} /> Reject
              </button>
              <button onClick={() => submitAnnotation(true)} disabled={submitting}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.82rem" }}>
                <CheckCircle size={14} /> Approve
              </button>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => navigate(-1)} disabled={idx === 0}
                style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.85rem", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: idx === 0 ? '#334155' : '#94a3b8', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: "0.78rem", fontWeight: 600 }}>
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: "0.75rem", color: "#475569" }}>{idx + 1} / {items.length}</span>
              <button onClick={() => navigate(1)} disabled={idx >= items.length - 1}
                style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.85rem", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: idx >= items.length - 1 ? '#334155' : '#94a3b8', cursor: idx >= items.length - 1 ? 'not-allowed' : 'pointer', fontSize: "0.78rem", fontWeight: 600 }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
