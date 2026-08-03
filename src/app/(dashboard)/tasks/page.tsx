"use client"
import { useState, useEffect } from "react"
import { Plus, X, Mic, FileText, Video, Image, Brain, ChevronDown, Check, Globe, Calendar } from "lucide-react"

const TASK_TYPES = [
  { value: "AUDIO", label: "Audio & Speech", icon: Mic, color: "#8b5cf6" },
  { value: "TEXT", label: "Text & NLP", icon: FileText, color: "#06b6d4" },
  { value: "VIDEO", label: "Video & Vision", icon: Video, color: "#f59e0b" },
  { value: "PHOTO", label: "Geo Photo", icon: Image, color: "#10b981" },
  { value: "EVAL", label: "LLM Evaluation", icon: Brain, color: "#f06135" },
]

const DOMAINS = ["agriculture", "law", "health", "education", "finance", "public", "general"]

const AUDIO_PROMPTS_EA = [
  "Sema jina lako na mahali unapoishi.",
  "Eleza shughuli yako ya kila siku.",
  "Je, mkulima anapanda nini wakati wa mvua?",
  "Soma sentensi hii kwa sauti: Hospitali iko karibu na soko.",
  "Bonyeza kitufe cha kujisajili kwenye programu.",
]

const TEXT_PROMPTS_EA = [
  "Translate to Swahili: The patient needs immediate medical attention.",
  "Write a sentence about farming maize in Western Kenya.",
  "Describe how a mobile money transfer works in your language.",
  "What is the role of a community health worker? Answer in your local language.",
]

interface Task {
  id: string
  title: string
  taskType: string
  domain?: string
  status: string
  targetCount: number
  rewardPerItem: number
  language?: { name: string }
  createdAt: string
  _count: { audioSubmissions: number; textSubmissions: number; videoSubmissions: number; evalSubmissions: number }
}

const TYPE_CFG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  AUDIO: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", icon: Mic },
  TEXT:  { color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)", icon: FileText },
  VIDEO: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: Video },
  PHOTO: { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", icon: Image },
  EVAL:  { color: "#f06135", bg: "rgba(240,97,53,0.12)", border: "rgba(240,97,53,0.25)", icon: Brain },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState("ACTIVE")

  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "AUDIO",
    domain: "",
    prompts: [] as string[],
    promptInput: "",
    targetCount: 100,
    rewardPerItem: 5,
    deadline: "",
    isPublic: true,
  })

  const loadTasks = () => {
    setLoading(true)
    fetch(`/api/tasks?status=${statusFilter}`)
      .then(r => r.json())
      .then(data => { setTasks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadTasks() }, [statusFilter])

  const addPrompt = () => {
    if (form.promptInput.trim()) {
      setForm(f => ({ ...f, prompts: [...f.prompts, f.promptInput.trim()], promptInput: "" }))
    }
  }

  const loadDefaultPrompts = () => {
    const defaults = form.taskType === "AUDIO" ? AUDIO_PROMPTS_EA : TEXT_PROMPTS_EA
    setForm(f => ({ ...f, prompts: Array.from(new Set([...f.prompts, ...defaults])) }))
  }

  const handleCreate = async () => {
    if (!form.title || !form.taskType) return
    setCreating(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          taskType: form.taskType,
          domain: form.domain || null,
          prompts: form.prompts,
          targetCount: form.targetCount,
          rewardPerItem: form.rewardPerItem,
          deadline: form.deadline || null,
          isPublic: form.isPublic,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        setForm({ title: "", description: "", taskType: "AUDIO", domain: "", prompts: [], promptInput: "", targetCount: 100, rewardPerItem: 5, deadline: "", isPublic: true })
        loadTasks()
      }
    } finally {
      setCreating(false)
    }
  }

  const patch = async (id: string, data: object) => {
    await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    loadTasks()
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0d1117 100%)", color: "#e2e8f0", padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9" }}>Collection Tasks</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#475569", fontSize: "0.85rem" }}>Create and manage data collection tasks assigned to agents</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.25rem", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.4)", borderRadius: "10px", color: "#f06135", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          <Plus size={15} /> Create Task
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["ACTIVE", "DRAFT", "PAUSED", "CLOSED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "0.45rem 1rem", borderRadius: "8px", border: "1px solid", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              background: statusFilter === s ? "rgba(240,97,53,0.15)" : "rgba(255,255,255,0.04)",
              borderColor: statusFilter === s ? "rgba(240,97,53,0.4)" : "rgba(255,255,255,0.08)",
              color: statusFilter === s ? "#f06135" : "#475569" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Tasks grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#475569" }}>Loading…</div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#475569" }}>
          <p style={{ fontWeight: 600 }}>No {statusFilter.toLowerCase()} tasks</p>
          <button onClick={() => setShowCreate(true)} style={{ marginTop: "1rem", padding: "0.5rem 1.25rem", background: "rgba(240,97,53,0.12)", border: "1px solid rgba(240,97,53,0.3)", borderRadius: "8px", color: "#f06135", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>Create your first task</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {tasks.map(task => {
            const cfg = TYPE_CFG[task.taskType] ?? TYPE_CFG.AUDIO
            const Icon = cfg.icon
            const total = (task._count?.audioSubmissions ?? 0) + (task._count?.textSubmissions ?? 0) + (task._count?.videoSubmissions ?? 0) + (task._count?.evalSubmissions ?? 0)
            const pct = Math.min(100, Math.round((total / task.targetCount) * 100))
            return (
              <div key={task.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={cfg.color} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#e2e8f0" }}>{task.title}</p>
                      <p style={{ margin: 0, fontSize: "0.7rem", color: "#475569", textTransform: "capitalize" }}>{task.taskType} {task.domain ? `· ${task.domain}` : ""}</p>
                    </div>
                  </div>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 700, background: task.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)', color: task.status === 'ACTIVE' ? '#10b981' : '#64748b', border: task.status === 'ACTIVE' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(100,116,139,0.2)' }}>{task.status}</span>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.72rem", color: "#475569" }}>Progress</span>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>{total} / {task.targetCount}</span>
                  </div>
                  <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: "3px", transition: "width 0.4s" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>KES {task.rewardPerItem}/item</span>
                  {task.language && <span style={{ fontSize: "0.72rem", color: "#475569" }}>{task.language.name}</span>}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {task.status === 'ACTIVE' && (
                    <button onClick={() => patch(task.id, { status: 'PAUSED' })} style={{ flex: 1, padding: "0.4rem", borderRadius: "7px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Pause</button>
                  )}
                  {task.status === 'PAUSED' && (
                    <button onClick={() => patch(task.id, { status: 'ACTIVE' })} style={{ flex: 1, padding: "0.4rem", borderRadius: "7px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Resume</button>
                  )}
                  <button onClick={() => patch(task.id, { status: 'CLOSED' })} style={{ flex: 1, padding: "0.4rem", borderRadius: "7px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#ef4444", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>Close</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <>
          <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 900 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(620px, calc(100vw - 2rem))", maxHeight: "90vh", overflowY: "auto", background: "linear-gradient(145deg, #0f172a, #1e293b)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", zIndex: 901, padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" }}>Create Collection Task</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Task Type selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Data Type *</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {TASK_TYPES.map(tt => {
                    const Icon = tt.icon
                    const sel = form.taskType === tt.value
                    return (
                      <button key={tt.value} onClick={() => setForm(f => ({ ...f, taskType: tt.value }))}
                        style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.85rem", borderRadius: "8px", border: `1px solid ${sel ? tt.color : 'rgba(255,255,255,0.1)'}`, background: sel ? `${tt.color}20` : 'rgba(255,255,255,0.04)', color: sel ? tt.color : '#64748b', fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                        <Icon size={12} /> {tt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Record Swahili Agriculture Sentences"
                  style={{ width: "100%", padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Instructions for agents completing this task…"
                  rows={3}
                  style={{ width: "100%", padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>

              {/* Domain + Reward row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Domain</label>
                  <select value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                    style={{ width: "100%", padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: form.domain ? "#e2e8f0" : "#475569", fontSize: "0.85rem", outline: "none" }}>
                    <option value="">Select domain</option>
                    {DOMAINS.map(d => <option key={d} value={d} style={{ background: "#1e293b" }}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reward (KES/item)</label>
                  <input type="number" value={form.rewardPerItem} onChange={e => setForm(f => ({ ...f, rewardPerItem: parseInt(e.target.value) || 5 }))} min={1}
                    style={{ width: "100%", padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Target count + Deadline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Count</label>
                  <input type="number" value={form.targetCount} onChange={e => setForm(f => ({ ...f, targetCount: parseInt(e.target.value) || 100 }))} min={1}
                    style={{ width: "100%", padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    style={{ width: "100%", padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Prompts/Scripts */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Prompts / Scripts ({form.prompts.length})</label>
                  <button onClick={loadDefaultPrompts} style={{ fontSize: "0.7rem", color: "#f06135", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Load EA defaults</button>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input value={form.promptInput} onChange={e => setForm(f => ({ ...f, promptInput: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addPrompt()}
                    placeholder="Type a prompt and press Enter…"
                    style={{ flex: 1, padding: "0.6rem 0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#e2e8f0", fontSize: "0.85rem", outline: "none" }} />
                  <button onClick={addPrompt} style={{ padding: "0.6rem 0.9rem", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", borderRadius: "10px", color: "#f06135", cursor: "pointer" }}><Plus size={14} /></button>
                </div>
                {form.prompts.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "150px", overflowY: "auto" }}>
                    {form.prompts.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ flex: 1, fontSize: "0.8rem", color: "#94a3b8" }}>{p}</span>
                        <button onClick={() => setForm(f => ({ ...f, prompts: f.prompts.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex" }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating || !form.title}
                  style={{ flex: 2, padding: "0.75rem", borderRadius: "10px", background: creating ? 'rgba(240,97,53,0.1)' : "rgba(240,97,53,0.2)", border: "1px solid rgba(240,97,53,0.4)", color: "#f06135", fontWeight: 700, cursor: creating || !form.title ? "not-allowed" : "pointer", opacity: creating || !form.title ? 0.6 : 1 }}>
                  {creating ? "Creating…" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
