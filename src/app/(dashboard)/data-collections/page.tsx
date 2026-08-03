"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Mic, FileText, Video, Star, Image, Users,
  TrendingUp, Clock, CheckCircle, XCircle,
  ChevronRight, Plus, Filter, RefreshCw,
  Globe, Volume2, MessageSquare, Brain
} from "lucide-react"

interface TaskStats {
  id: string
  title: string
  taskType: string
  status: string
  targetCount: number
  rewardPerItem: number
  domain?: string
  language?: { name: string; code: string }
  _count: {
    audioSubmissions: number
    textSubmissions: number
    videoSubmissions: number
    evalSubmissions: number
  }
}

const DATA_TYPE_CONFIG = {
  AUDIO: {
    label: "Audio & Speech",
    icon: Mic,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    description: "Voice recordings, monologues, conversational speech"
  },
  TEXT: {
    label: "Text & NLP",
    icon: FileText,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    border: "rgba(6,182,212,0.25)",
    description: "Translations, corpus, RLHF prompts, transcriptions"
  },
  VIDEO: {
    label: "Vision & Video",
    icon: Video,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    description: "Object detection, scene understanding, egocentric"
  },
  PHOTO: {
    label: "Geo Photos",
    icon: Image,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    description: "Business storefronts, landmarks, field imagery"
  },
  EVAL: {
    label: "LLM Evaluation",
    icon: Brain,
    color: "#f06135",
    bg: "rgba(240,97,53,0.12)",
    border: "rgba(240,97,53,0.25)",
    description: "Human ratings for AI model outputs across languages"
  },
}

const DOMAINS = [
  { label: "Agriculture", emoji: "🌾", color: "#84cc16" },
  { label: "Healthcare", emoji: "🏥", color: "#ef4444" },
  { label: "Law & Justice", emoji: "⚖️", color: "#8b5cf6" },
  { label: "Education", emoji: "📚", color: "#3b82f6" },
  { label: "Finance", emoji: "💰", color: "#f59e0b" },
  { label: "Public Services", emoji: "🏛️", color: "#06b6d4" },
]

const LANGUAGES = [
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪", count: 0 },
  { code: "ki", name: "Kikuyu", native: "Gĩkũyũ", flag: "🇰🇪", count: 0 },
  { code: "luo", name: "Luo", native: "Dholuo", flag: "🇰🇪", count: 0 },
  { code: "luh", name: "Luhya", native: "Luluhya", flag: "🇰🇪", count: 0 },
  { code: "kam", name: "Kamba", native: "Kĩkamba", flag: "🇰🇪", count: 0 },
  { code: "mer", name: "Meru", native: "Kimeru", flag: "🇰🇪", count: 0 },
  { code: "som", name: "Somali", native: "Soomaali", flag: "🇸🇴", count: 0 },
  { code: "mas", name: "Maasai", native: "Maa", flag: "🇰🇪", count: 0 },
  { code: "gir", name: "Giriama", native: "Kigiriama", flag: "🇰🇪", count: 0 },
  { code: "kal", name: "Kalenjin", native: "Nandi", flag: "🇰🇪", count: 0 },
  { code: "en", name: "English", native: "English", flag: "🌍", count: 0 },
]

export default function DataCollectionsPage() {
  const [tasks, setTasks] = useState<TaskStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")

  useEffect(() => {
    fetch('/api/tasks?status=ACTIVE')
      .then(r => r.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredTasks = filter === "ALL" ? tasks : tasks.filter(t => t.taskType === filter)

  // Aggregate counts
  const totalAudio = tasks.reduce((s, t) => s + (t._count?.audioSubmissions ?? 0), 0)
  const totalText = tasks.reduce((s, t) => s + (t._count?.textSubmissions ?? 0), 0)
  const totalVideo = tasks.reduce((s, t) => s + (t._count?.videoSubmissions ?? 0), 0)
  const totalEval = tasks.reduce((s, t) => s + (t._count?.evalSubmissions ?? 0), 0)

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0d1117 50%, #0a0e1a 100%)", color: "#e2e8f0", padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(240,97,53,0.2)", border: "1px solid rgba(240,97,53,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={18} color="#f06135" />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#f1f5f9" }}>Data Collections</h1>
          </div>
          <p style={{ margin: 0, color: "#475569", fontSize: "0.85rem" }}>AI training data across audio, text, vision & evaluation — East Africa</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => setFilter("ALL")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.35)", borderRadius: "10px", color: "#f06135", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", transition: "all 0.15s" }}>
            All Types
          </button>
        </div>
      </div>

      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Audio Submissions", value: totalAudio.toLocaleString(), icon: Mic, color: "#8b5cf6" },
          { label: "Text Submissions", value: totalText.toLocaleString(), icon: FileText, color: "#06b6d4" },
          { label: "Video Clips", value: totalVideo.toLocaleString(), icon: Video, color: "#f59e0b" },
          { label: "LLM Evals", value: totalEval.toLocaleString(), icon: Brain, color: "#f06135" },
          { label: "Active Tasks", value: tasks.filter(t => t.status === 'ACTIVE').length.toString(), icon: TrendingUp, color: "#10b981" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#475569", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${color}20`, border: `1px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} color={color} />
              </div>
            </div>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{loading ? "—" : value}</span>
          </div>
        ))}
      </div>

      {/* Data type overview cards */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1rem" }}>Collection Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {Object.entries(DATA_TYPE_CONFIG).map(([type, cfg]) => {
            const Icon = cfg.icon
            const count = type === 'AUDIO' ? totalAudio : type === 'TEXT' ? totalText : type === 'VIDEO' ? totalVideo : type === 'EVAL' ? totalEval : 0
            return (
              <button key={type} onClick={() => setFilter(filter === type ? 'ALL' : type)}
                style={{ background: filter === type ? cfg.bg : "rgba(255,255,255,0.03)", border: `1px solid ${filter === type ? cfg.border : 'rgba(255,255,255,0.07)'}`, borderRadius: "14px", padding: "1.25rem", textAlign: "left", cursor: "pointer", transition: "all 0.15s", color: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: filter === type ? cfg.color : "#e2e8f0" }}>{cfg.label}</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#475569", margin: "0 0 0.75rem" }}>{cfg.description}</p>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: filter === type ? cfg.color : "#94a3b8" }}>{loading ? "—" : count.toLocaleString()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Tasks table */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Active Tasks</h2>
          <Link href="/tasks" style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#f06135", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>See all <ChevronRight size={13} /></Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#475569" }}>Loading tasks…</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#475569" }}>
              <Globe size={32} style={{ opacity: 0.3, marginBottom: "0.75rem", display: "block", margin: "0 auto 0.75rem" }} />
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>No active tasks yet</p>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>Create a task to start collecting data</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Task", "Type", "Language", "Domain", "Progress", "Reward", ""].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, i) => {
                    const cfg = DATA_TYPE_CONFIG[task.taskType as keyof typeof DATA_TYPE_CONFIG]
                    const Icon = cfg?.icon ?? Globe
                    const totalSubs = (task._count?.audioSubmissions ?? 0) + (task._count?.textSubmissions ?? 0) + (task._count?.videoSubmissions ?? 0) + (task._count?.evalSubmissions ?? 0)
                    const progress = Math.min(100, Math.round((totalSubs / task.targetCount) * 100))
                    return (
                      <tr key={task.id} style={{ borderBottom: i < filteredTasks.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <td style={{ padding: "0.9rem 1rem" }}>
                          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#e2e8f0" }}>{task.title}</span>
                        </td>
                        <td style={{ padding: "0.9rem 1rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.6rem", borderRadius: "6px", background: cfg?.bg ?? 'rgba(255,255,255,0.05)', border: `1px solid ${cfg?.border ?? 'rgba(255,255,255,0.1)'}`, fontSize: "0.7rem", fontWeight: 700, color: cfg?.color ?? '#94a3b8' }}>
                            <Icon size={10} />{task.taskType}
                          </span>
                        </td>
                        <td style={{ padding: "0.9rem 1rem", color: "#94a3b8", fontSize: "0.82rem" }}>{task.language?.name ?? "—"}</td>
                        <td style={{ padding: "0.9rem 1rem", color: "#94a3b8", fontSize: "0.82rem", textTransform: "capitalize" }}>{task.domain ?? "—"}</td>
                        <td style={{ padding: "0.9rem 1rem", minWidth: "120px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ flex: 1, height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${progress}%`, background: cfg?.color ?? '#f06135', borderRadius: "3px", transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap" }}>{totalSubs}/{task.targetCount}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.9rem 1rem", color: "#10b981", fontSize: "0.82rem", fontWeight: 600 }}>KES {task.rewardPerItem}/item</td>
                        <td style={{ padding: "0.9rem 1rem" }}>
                          <Link href={`/review/${task.taskType.toLowerCase()}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#475569", fontSize: "0.75rem", textDecoration: "none", padding: "0.35rem 0.7rem", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f06135'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,97,53,0.35)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                            Review <ChevronRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Two-col: Languages + Domains */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Languages */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Languages Covered</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {LANGUAGES.map(lang => (
              <div key={lang.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{lang.flag}</span>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0" }}>{lang.name}</span>
                    <span style={{ fontSize: "0.68rem", color: "#475569", marginLeft: "0.4rem" }}>{lang.native}</span>
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#334155", background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "5px" }}>0 items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Domains */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Domain Coverage</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {DOMAINS.map(d => (
              <div key={d.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.82rem", color: "#e2e8f0" }}>{d.emoji} {d.label}</span>
                  <span style={{ fontSize: "0.72rem", color: "#475569" }}>0%</span>
                </div>
                <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ height: "100%", width: "0%", background: d.color, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
