"use client"
import { useState, useEffect } from "react"
import { FileText, CheckCircle, XCircle, ChevronLeft, ChevronRight, Star, Globe, Tag } from "lucide-react"

interface TextSub {
  id: string
  sourceText?: string
  submittedText: string
  textType: string
  domain?: string
  status: string
  grade?: number
  feedback?: string
  phoneticNotes?: string
  language?: { name: string; code: string }
  agent: { name?: string; phoneNumber?: string }
  task?: { title: string }
  annotations: any[]
  createdAt: string
}

const TEXT_TYPE_COLORS: Record<string, string> = {
  CORPUS: '#06b6d4',
  TRANSLATION: '#8b5cf6',
  RLHF_PROMPT: '#f06135',
  TRANSCRIPTION: '#10b981',
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

export default function TextReviewPage() {
  const [items, setItems] = useState<TextSub[]>([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [grade, setGrade] = useState(0)
  const [notes, setNotes] = useState("")
  const [phonetic, setPhonetic] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [typeFilter, setTypeFilter] = useState("")

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ status: statusFilter, limit: '50' })
    if (typeFilter) params.set('textType', typeFilter)
    fetch(`/api/submissions/text?${params}`)
      .then(r => r.json())
      .then(data => { setItems(data.submissions ?? []); setIdx(0); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter, typeFilter])

  const current = items[idx]

  const reset = () => { setGrade(0); setNotes(""); setPhonetic("") }

  const navigate = (dir: number) => { reset(); setIdx(i => Math.max(0, Math.min(items.length - 1, i + dir))) }

  const submit = async (approved: boolean) => {
    if (!current) return
    setSubmitting(true)
    await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionType: 'text', submissionId: current.id, grade: grade * 20, approved, notes, phoneticMarking: phonetic, feedback: notes, labels: [] }),
    })
    setSubmitting(false)
    load()
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>Loading…</div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0d1117 100%)", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(6,182,212,0.2)", border: "1px solid rgba(6,182,212,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={16} color="#06b6d4" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#f1f5f9" }}>Text Review Queue</h1>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#475569" }}>{items.length} submissions · {idx + 1} of {items.length}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {['PENDING','APPROVED','REJECTED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "7px", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", border: "1px solid",
                background: statusFilter === s ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                borderColor: statusFilter === s ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.07)',
                color: statusFilter === s ? '#06b6d4' : '#475569' }}>{s}</button>
          ))}
          {['', 'CORPUS', 'TRANSLATION', 'RLHF_PROMPT', 'TRANSCRIPTION'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "7px", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", border: "1px solid",
                background: typeFilter === t ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                borderColor: typeFilter === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                color: typeFilter === t ? '#e2e8f0' : '#475569' }}>{t || 'ALL TYPES'}</button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", flexDirection: "column", gap: "1rem" }}>
          <FileText size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontWeight: 600 }}>No {statusFilter.toLowerCase()} text submissions</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>
          {/* Main text display */}
          <div style={{ padding: "2rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {current && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{ padding: "0.25rem 0.65rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700,
                    background: `${TEXT_TYPE_COLORS[current.textType] ?? '#94a3b8'}18`,
                    border: `1px solid ${TEXT_TYPE_COLORS[current.textType] ?? '#94a3b8'}35`,
                    color: TEXT_TYPE_COLORS[current.textType] ?? '#94a3b8' }}>
                    {current.textType.replace('_', ' ')}
                  </span>
                  {current.language && <span style={{ fontSize: "0.75rem", color: "#475569" }}><Globe size={11} style={{ display: 'inline', marginRight: '0.2rem' }} />{current.language.name}</span>}
                  {current.domain && <span style={{ fontSize: "0.75rem", color: "#475569" }}><Tag size={11} style={{ display: 'inline', marginRight: '0.2rem' }} />{current.domain}</span>}
                </div>

                {/* Source text (for translations) */}
                {current.sourceText && (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem" }}>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Source Text</p>
                    <p style={{ margin: 0, fontSize: "1rem", color: "#94a3b8", lineHeight: 1.7 }}>{current.sourceText}</p>
                  </div>
                )}

                {/* Submitted text */}
                <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.18)", borderRadius: "12px", padding: "1.5rem" }}>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.68rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.06em" }}>Submitted Text</p>
                  <p style={{ margin: 0, fontSize: "1.05rem", color: "#e2e8f0", lineHeight: 1.8 }}>{current.submittedText}</p>
                </div>

                {/* Previous annotations */}
                {current.annotations?.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1rem" }}>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Previous Reviews</p>
                    {current.annotations.map((a: any) => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color: "#64748b" }}>{a.annotator?.name ?? 'Reviewer'}</span>
                        <span style={{ color: a.approved ? '#10b981' : '#ef4444', fontWeight: 600 }}>{a.approved ? '✓ Approved' : '✗ Rejected'} {a.grade ? `· ${a.grade}%` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Annotation sidebar */}
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.2/rem", overflowY: "auto", background: "rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Review Panel</h3>

            {current && (
              <div style={{ padding: "0.7rem", background: "rgba(255,255,255,0.03)", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: 0, fontSize: "0.68rem", color: "#475569" }}>Submitted by</p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>{current.agent?.name ?? current.agent?.phoneNumber ?? 'Unknown'}</p>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.45rem", textTransform: "uppercase" }}>Quality Rating</label>
              <StarRating value={grade} onChange={setGrade} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.4rem", textTransform: "uppercase" }}>Linguistic Notes</label>
              <textarea value={phonetic} onChange={e => setPhonetic(e.target.value)} rows={2}
                placeholder="Grammatical issues, dialectal markers, accuracy…"
                style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "9px", color: "#e2e8f0", fontSize: "0.8rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.4rem", textTransform: "uppercase" }}>Feedback to Agent</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Constructive feedback for the agent…"
                style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "9px", color: "#e2e8f0", fontSize: "0.8rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => submit(false)} disabled={submitting}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "9px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <XCircle size={13} /> Reject
              </button>
              <button onClick={() => submit(true)} disabled={submitting}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "9px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <CheckCircle size={13} /> Approve
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => navigate(-1)} disabled={idx === 0}
                style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.45rem 0.75rem", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: idx === 0 ? '#334155' : '#94a3b8', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: "0.75rem", fontWeight: 600 }}>
                <ChevronLeft size={13} /> Prev
              </button>
              <span style={{ fontSize: "0.72rem", color: "#475569" }}>{idx + 1} / {items.length}</span>
              <button onClick={() => navigate(1)} disabled={idx >= items.length - 1}
                style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.45rem 0.75rem", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: idx >= items.length - 1 ? '#334155' : '#94a3b8', cursor: idx >= items.length - 1 ? 'not-allowed' : 'pointer', fontSize: "0.75rem", fontWeight: 600 }}>
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
