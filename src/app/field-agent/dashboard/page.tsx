"use client"
export const dynamic = "force-dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  Star, CheckCircle2, XCircle, Clock, TrendingUp,
  AlertTriangle, FileCheck, MapPin, MessageCircle,
  Mic, FileText, Video, Brain, Camera, Plus,
  LayoutDashboard, Wallet, ChevronRight,
  Zap, Award, BarChart2, LogOut, Bell, Settings,
  ArrowUpRight, Shield, Activity, Menu, Eye, EyeOff
} from "lucide-react"

type Stats = {
  points: number
  status: string
  submissionsToday: number
  total: number
  pending: number
  approved: number
  rejected: number
  decided: number
  approvalRate: number
  averageGrade: number
  grade: string
}

type Submission = {
  id: string
  status: string
  category: string
  type?: string
  info?: string
  latitude: number
  longitude: number
  photoUrl: string
  feedback: string | null
  grade: number | null
  createdAt: string
}

const GRADE_META: Record<string, { label: string; color: string; ring: string; glow: string }> = {
  A: { label: "Excellent", color: "#10b981", ring: "rgba(16,185,129,0.25)", glow: "0 0 20px rgba(16,185,129,0.4)" },
  B: { label: "Good",      color: "#3b82f6", ring: "rgba(59,130,246,0.25)", glow: "0 0 20px rgba(59,130,246,0.4)" },
  C: { label: "Average",   color: "#f59e0b", ring: "rgba(245,158,11,0.25)", glow: "0 0 20px rgba(245,158,11,0.4)" },
  D: { label: "Poor",      color: "#ef4444", ring: "rgba(239,68,68,0.25)",  glow: "0 0 20px rgba(239,68,68,0.4)"  },
  "N/A": { label: "No Data", color: "#64748b", ring: "rgba(100,116,139,0.25)", glow: "none" },
}

const TYPE_META: Record<string, { icon: any; color: string; bg: string; label: string; glow: string }> = {
  "Audio Recording": { icon: Mic,      color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "Audio",  glow: "rgba(167,139,250,0.3)" },
  "Text Entry":      { icon: FileText, color: "#22d3ee", bg: "rgba(34,211,238,0.12)",  label: "Text",   glow: "rgba(34,211,238,0.3)"  },
  "Video Vision":    { icon: Video,    color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Video",  glow: "rgba(251,146,60,0.3)"  },
  "AI Evaluation":   { icon: Brain,    color: "#facc15", bg: "rgba(250,204,21,0.12)",  label: "Eval",   glow: "rgba(250,204,21,0.3)"  },
  "Photo Capture":   { icon: Camera,   color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Photo",  glow: "rgba(52,211,153,0.3)"  },
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; icon: any }> = {
    VERIFIED:  { bg: "rgba(16,185,129,0.12)",  color: "#10b981", icon: CheckCircle2 },
    APPROVED:  { bg: "rgba(16,185,129,0.12)",  color: "#10b981", icon: CheckCircle2 },
    REJECTED:  { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", icon: XCircle },
    PENDING:   { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", icon: Clock },
  }
  const cfg = map[status] || { bg: "rgba(100,116,139,0.12)", color: "#64748b", icon: Clock }
  const Icon = cfg.icon
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "10px", fontWeight: 700,
      border: `1px solid ${cfg.color}30`,
    }}>
      <Icon size={10} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

// Animated circular progress ring
function RingProgress({ pct, color, size = 80, stroke = 7 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  )
}

export default function AgentDashboard() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const authStatus = sessionResult?.status ?? "loading"
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview")
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDetailedStats, setShowDetailedStats] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/field-agent/login")
  }, [authStatus, router])

  useEffect(() => {
    if (authStatus === "authenticated") {
      if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPERVISOR") {
        router.push("/admin")
        return
      }
      Promise.all([
        fetch("/api/field-agent/stats").then(r => r.json()),
        fetch("/api/field-agent/submissions").then(r => r.json()),
      ])
        .then(([statsData, submissionsData]) => {
          setStats(statsData)
          setSubmissions(submissionsData.submissions || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [authStatus])

  const handleWithdraw = async () => {
    if (!stats || stats.points < 500) {
      alert("You need at least 500 KSh to request a withdrawal.")
      return
    }
    const amt = prompt(`How much would you like to withdraw?\n(Min: 500, Max: ${stats.points} KSh)`)
    if (!amt || isNaN(Number(amt)) || Number(amt) < 500) {
      if (amt && Number(amt) < 500) alert("Minimum withdrawal is 500 KSh.")
      return
    }
    if (Number(amt) > stats.points) return alert("Insufficient points!")
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amt) }),
      })
      const data = await res.json()
      if (data.success) { alert("Withdrawal requested!"); window.location.reload() }
      else alert(data.error || "Failed to request withdrawal")
    } catch { alert("An error occurred") }
  }

  if (authStatus === "loading" || loading || !stats) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d1f30 100%)",
        gap: "1.25rem"
      }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "3px solid rgba(16,185,129,0.15)"
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#10b981",
            animation: "spin 0.8s linear infinite"
          }} />
          <div style={{
            position: "absolute", inset: "10px", borderRadius: "50%",
            background: "rgba(16,185,129,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Camera size={20} color="#10b981" />
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em" }}>
          Loading workspace…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const gMeta   = GRADE_META[stats.grade] || GRADE_META["N/A"]
  const isTraining  = stats.status === "TRAINING"
  const isSuspended = stats.status === "SUSPENDED"
  const dailyPct    = Math.min(((stats?.submissionsToday ?? 0) / 15) * 100, 100)
  const progressPct = Math.min((stats.decided / 50) * 100, 100)
  const approvalPct = stats.decided > 0 ? stats.approvalRate : 0
  const userName    = session?.user?.name?.split(" ")[0] || "Agent"
  const initials    = (session?.user?.name || "A").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2)

  const statCards = [
    {
      label: "Today's Captures",
      value: `${stats?.submissionsToday ?? 0}`,
      sub: `of 15 daily`,
      icon: Zap,
      color: "#f97316",
      pct: dailyPct,
      bg: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.2)",
    },
    {
      label: "Approval Rate",
      value: stats.decided > 0 ? `${stats.approvalRate}%` : "—",
      sub: `${stats.approved} approved`,
      icon: TrendingUp,
      color: "#3b82f6",
      pct: approvalPct,
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      label: "Quality Grade",
      value: stats.grade,
      sub: gMeta.label,
      icon: Award,
      color: gMeta.color,
      pct: stats.decided > 0 ? stats.averageGrade : 0,
      bg: `${gMeta.color}12`,
      border: `${gMeta.color}30`,
    },
    {
      label: "Total Submitted",
      value: `${stats.total}`,
      sub: `${stats.pending} pending`,
      icon: BarChart2,
      color: "#a78bfa",
      pct: stats.total > 0 ? Math.min((stats.approved / stats.total) * 100, 100) : 0,
      bg: "rgba(167,139,250,0.08)",
      border: "rgba(167,139,250,0.2)",
    },
  ]

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050d1a 0%, #0a1628 40%, #0f1e35 100%)",
      paddingBottom: "5rem",
      fontFamily: "'Inter', -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 15px rgba(16,185,129,0.3); } 50% { box-shadow: 0 0 30px rgba(16,185,129,0.6); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.15s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.2s ease both; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; border: none; background: none; }
        .nav-btn { transition: all 0.2s ease; cursor: pointer; border: none; background: none; font-family: inherit; }
      `}</style>

      {/* ── Top Header ───────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(5,13,26,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0.875rem 1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "10px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(16,185,129,0.4)",
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.8rem" }}>KP</span>
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.9rem", lineHeight: 1 }}>KijijiPoll</div>
            <div style={{ color: "#10b981", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Agent Portal</div>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Desktop nav tabs */}
          <div style={{
            display: "none",
            alignItems: "center", gap: "0.25rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px", padding: "4px",
          }} className="lg-flex">
            {(["overview", "activity"] as const).map(tab => (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.4rem 0.875rem",
                  borderRadius: "8px",
                  fontSize: "0.78rem", fontWeight: 700,
                  color: activeTab === tab ? "#fff" : "#64748b",
                  background: activeTab === tab
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "transparent",
                  boxShadow: activeTab === tab ? "0 2px 8px rgba(16,185,129,0.4)" : "none",
                }}
              >
                {tab === "overview" ? "Overview" : "Activity"}
              </button>
            ))}
          </div>

          {/* Avatar & Hamburger */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ position: "relative" }}>
                <button className="nav-btn" style={{
                  padding: "0.4rem", borderRadius: "8px", color: "#64748b",
                  background: "rgba(255,255,255,0.04)"
                }}>
                  <Bell size={18} />
                </button>
                <div style={{
                  position: "absolute", top: 4, right: 4, width: 8, height: 8,
                  borderRadius: "50%", background: "#ef4444", border: "2px solid #050d1a"
                }} />
              </div>

              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #1e3a52, #2d5a3d)",
                border: "2px solid rgba(16,185,129,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#10b981", fontWeight: 800, fontSize: "0.75rem",
              }}>
                {initials}
              </div>

              <button
                className="nav-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                  padding: "0.4rem", borderRadius: "8px", color: "rgba(255,255,255,0.7)",
                  background: isMenuOpen ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center"
                }}
              >
                <Menu size={18} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="fade-up-1" style={{
                position: "absolute", top: "calc(100% + 0.5rem)", right: 0,
                width: 200, background: "rgba(10,22,40,0.95)",
                backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", padding: "0.5rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)", zIndex: 100,
                display: "flex", flexDirection: "column", gap: "2px"
              }}>
                <button className="nav-btn" onClick={() => { setShowDetailedStats(!showDetailedStats); setIsMenuOpen(false); }} style={{
                  width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
                  textAlign: "left"
                }}>
                  {showDetailedStats ? <EyeOff size={15} /> : <Eye size={15} />}
                  {showDetailedStats ? "Hide Stats" : "Show Stats"}
                </button>
                <button className="nav-btn" style={{
                  width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
                  textAlign: "left"
                }}>
                  <Settings size={15} /> Settings
                </button>
                <button className="nav-btn" onClick={handleWithdraw} style={{
                  width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
                  textAlign: "left"
                }}>
                  <Wallet size={15} /> Withdrawals
                </button>
                <button className="nav-btn" style={{
                  width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 600,
                  textAlign: "left"
                }}>
                  <MessageCircle size={15} /> Chat Support
                </button>
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <button
                  className="nav-btn"
                  onClick={() => import("next-auth/react").then(m => m.signOut({ callbackUrl: "/field-agent/login" }))}
                  style={{
                    width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    color: "#ef4444", fontSize: "0.8rem", fontWeight: 600,
                    textAlign: "left", background: "rgba(239,68,68,0.05)"
                  }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────── */}
      <div style={{
        padding: "2rem 1.25rem 1.5rem",
        background: "linear-gradient(160deg, rgba(16,185,129,0.06) 0%, transparent 60%)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        position: "relative", overflow: "hidden",
      }} className="fade-up">
        {/* Decorative glow orbs */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -20, left: "30%",
          width: 120, height: 120, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>
          Good day,
        </p>
        <h1 style={{ color: "#f1f5f9", fontWeight: 900, fontSize: "1.75rem", margin: "0 0 0.5rem", lineHeight: 1.1 }}>
          {userName} 👋
        </h1>

        {/* Earnings hero card */}
        <div style={{
          marginTop: "1.25rem",
          background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "20px",
          padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
              Total Earnings
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
              <span style={{ color: "#10b981", fontWeight: 900, fontSize: "2.5rem", lineHeight: 1 }}>
                {(stats?.points ?? 0).toLocaleString()}
              </span>
              <span style={{ color: "rgba(16,185,129,0.6)", fontWeight: 700, fontSize: "1rem" }}>KSh</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: "0.5rem 0 0", fontWeight: 600 }}>
              {(stats?.points ?? 0) >= 500 ? "Ready to withdraw 🎉" : `${500 - (stats?.points ?? 0)} KSh more to unlock withdrawal`}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute" }}>
                <RingProgress pct={(stats?.points ?? 0) > 0 ? 100 : 0} color="#10b981" />
              </div>
              <Wallet size={24} color="#10b981" />
            </div>
            {(stats?.points ?? 0) >= 500 && (
              <button
                onClick={handleWithdraw}
                className="nav-btn"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", fontWeight: 700, fontSize: "0.72rem",
                  padding: "0.5rem 1rem", borderRadius: "10px",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
                }}
              >
                Withdraw
              </button>
            )}
          </div>
        </div>


      </div>

      {/* ── Main Content ──────────────────────────── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.25rem 1rem 0" }}>

        {/* ── Status Alerts ──────────────────────── */}
        {isTraining && (
          <div className="fade-up-1" style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "16px", padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex", gap: "1rem", alignItems: "flex-start",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Shield size={16} color="#3b82f6" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "#93c5fd", fontWeight: 800, fontSize: "0.875rem", margin: "0 0 0.25rem" }}>Training Phase</h3>
              <p style={{ color: "rgba(147,197,253,0.6)", fontSize: "0.75rem", margin: "0 0 0.75rem" }}>
                Complete 50 reviewed submissions with ≥70% approval to become ACTIVE.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700, color: "#93c5fd", marginBottom: "0.5rem" }}>
                <span>Progress</span><span>{Math.min(stats.decided, 50)} / 50</span>
              </div>
              <div style={{ background: "rgba(59,130,246,0.12)", borderRadius: "999px", height: 6 }}>
                <div style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1)", height: 6, borderRadius: "999px", width: `${progressPct}%`, transition: "width 1s ease" }} />
              </div>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="fade-up-1" style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "16px", padding: "1rem 1.25rem",
            marginBottom: "1.25rem", display: "flex", gap: "0.875rem", alignItems: "flex-start",
          }}>
            <XCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ color: "#fca5a5", fontWeight: 800, fontSize: "0.875rem", margin: "0 0 0.25rem" }}>Account Suspended</h3>
              <p style={{ color: "rgba(252,165,165,0.6)", fontSize: "0.75rem", margin: 0 }}>
                Your account has been suspended due to low approval ratings. Please contact support.
              </p>
            </div>
          </div>
        )}

        {(stats?.submissionsToday ?? 0) >= 15 && (
          <div className="fade-up-1" style={{
            background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)",
            borderRadius: "12px", padding: "0.875rem 1.25rem",
            marginBottom: "1.25rem", textAlign: "center",
            color: "#fde68a", fontWeight: 700, fontSize: "0.82rem",
          }}>
            🎉 Daily limit reached — 15/15 captures! Great work. Come back tomorrow.
          </div>
        )}

        {/* ── Stat Cards Grid ──────────────────────── */}
        {showDetailedStats && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.875rem",
              marginBottom: "1.5rem",
            }}>
              {statCards.map((card, i) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.label}
                    className={`card-hover fade-up-${i + 1}`}
                    style={{
                      background: card.bg,
                      border: `1px solid ${card.border}`,
                      borderRadius: "18px",
                      padding: "1rem 1.125rem",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    {/* Subtle glow accent */}
                    <div style={{
                      position: "absolute", top: -20, right: -20,
                      width: 80, height: 80, borderRadius: "50%",
                      background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
                        {card.label}
                      </p>
                      <div style={{
                        width: 28, height: 28, borderRadius: "8px",
                        background: `${card.color}15`, border: `1px solid ${card.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={13} color={card.color} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ color: card.color, fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>{card.value}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 600, marginTop: "0.2rem" }}>{card.sub}</div>
                      </div>
                      <div style={{ position: "relative", width: 44, height: 44 }}>
                        <RingProgress pct={card.pct} color={card.color} size={44} stroke={4} />
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.55rem", fontWeight: 800, color: card.color,
                        }}>
                          {Math.round(card.pct)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Quick Stats Row ─────────────────────── */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem", marginBottom: "1.5rem",
            }}>
              <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={16} color="#f59e0b" />
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 700 }}>PENDING</div>
                    <div style={{ color: "#f8fafc", fontSize: "0.9rem", fontWeight: 800 }}>{stats?.pending ?? 0}</div>
                  </div>
                </div>
              <div style={{ flex: 1, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 700 }}>APPROVED</div>
                    <div style={{ color: "#f8fafc", fontSize: "0.9rem", fontWeight: 800 }}>{stats?.approved ?? 0}</div>
                  </div>
                </div>
              <div style={{ flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <XCircle size={16} color="#ef4444" />
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 700 }}>REJECTED</div>
                    <div style={{ color: "#f8fafc", fontSize: "0.9rem", fontWeight: 800 }}>{stats?.rejected ?? 0}</div>
                  </div>
                </div>
            </div>
          </>
        )}

        {/* ── Activity Tab Toggle (mobile) ─────────── */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", padding: "4px",
          marginBottom: "1.25rem", gap: "4px",
        }}>
          {(["overview", "activity"] as const).map(tab => (
            <button
              key={tab}
              className="tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "0.6rem",
                borderRadius: "10px", fontSize: "0.8rem", fontWeight: 700,
                color: activeTab === tab ? "#fff" : "#475569",
                background: activeTab === tab
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "transparent",
                boxShadow: activeTab === tab ? "0 2px 12px rgba(16,185,129,0.35)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              {tab === "overview"
                ? <><LayoutDashboard size={14} />Overview</>
                : <><Activity size={14} />Activity</>
              }
            </button>
          ))}
        </div>

        {/* ── Overview Tab ────────────────────────── */}
        {activeTab === "overview" && (
          <div className="fade-up">
            {/* Recent Activity Preview */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "18px", overflow: "hidden", marginBottom: "1rem",
            }}>
              <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Activity size={16} color="#10b981" />
                  <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.9rem" }}>Recent Activity</span>
                </div>
                <button
                  className="nav-btn"
                  onClick={() => setActiveTab("activity")}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    color: "#10b981", fontSize: "0.72rem", fontWeight: 700,
                  }}
                >
                  View all <ChevronRight size={13} />
                </button>
              </div>

              {submissions.length === 0 ? (
                <div style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "16px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
                  }}>
                    <Camera size={24} color="rgba(255,255,255,0.2)" />
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>No submissions yet</p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", marginTop: "0.25rem" }}>Start capturing to see activity</p>
                </div>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {submissions.slice(0, 5).map((sub: any, idx) => {
                    const meta = TYPE_META[sub.type] || TYPE_META["Photo Capture"]
                    const Icon = meta?.icon || Camera
                    return (
                      <li key={sub.id} style={{
                        display: "flex", alignItems: "center", gap: "0.875rem",
                        padding: "0.875rem 1.25rem",
                        borderBottom: idx < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        transition: "background 0.15s",
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: "10px",
                          background: meta?.bg || "rgba(255,255,255,0.06)",
                          border: `1px solid ${meta?.glow || "rgba(255,255,255,0.1)"}40`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <Icon size={17} color={meta?.color || "#64748b"} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                            <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {sub.type || "Photo Capture"}
                            </span>
                            <StatusPill status={sub.status} />
                          </div>
                          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sub.info || sub.category}
                            {sub.grade !== null && sub.grade !== undefined && ` · ${sub.grade}% quality`}
                          </p>
                        </div>
                        <time style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", fontWeight: 600, flexShrink: 0 }}>
                          {new Date(sub.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}
                        </time>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Tips / Info card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))",
              border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: "16px", padding: "1.125rem",
              display: "flex", gap: "0.875rem", alignItems: "flex-start",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "8px",
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Zap size={15} color="#3b82f6" />
              </div>
              <div>
                <p style={{ color: "#93c5fd", fontWeight: 700, fontSize: "0.82rem", margin: "0 0 0.25rem" }}>Pro Tip</p>
                <p style={{ color: "rgba(147,197,253,0.55)", fontSize: "0.72rem", margin: 0, lineHeight: 1.6 }}>
                  Submit diverse data types (Audio, Text, Photo) to boost your quality grade and unlock higher rewards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Activity Tab ─────────────────────────── */}
        {activeTab === "activity" && (
          <div className="fade-up">
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "1rem",
            }}>
              <h2 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>All Submissions</h2>
              <span style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 700,
                padding: "0.3rem 0.75rem", borderRadius: "999px",
              }}>
                {submissions.length} total
              </span>
            </div>

            {submissions.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "18px", padding: "4rem 1.25rem", textAlign: "center",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
                }}>
                  <Camera size={24} color="rgba(255,255,255,0.2)" />
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600, margin: 0 }}>No submissions yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {submissions.map((sub: any) => {
                  const meta = TYPE_META[sub.type] || TYPE_META["Photo Capture"]
                  const Icon = meta?.icon || Camera
                  return (
                    <div key={sub.id} className="card-hover" style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "16px", padding: "1rem 1.125rem",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "11px",
                          background: meta?.bg || "rgba(255,255,255,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <Icon size={18} color={meta?.color || "#64748b"} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <span style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "0.85rem" }}>{sub.type || "Photo Capture"}</span>
                            <StatusPill status={sub.status} />
                          </div>
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", margin: "0 0 0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sub.info || sub.category}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                            <time style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", fontWeight: 600 }}>
                              {new Date(sub.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                            </time>
                            {sub.grade !== null && sub.grade !== undefined && (
                              <span style={{
                                background: "rgba(16,185,129,0.1)", color: "#10b981",
                                fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
                              }}>{sub.grade}% quality</span>
                            )}
                            {sub.category && (
                              <span style={{
                                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)",
                                fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px",
                                textTransform: "uppercase",
                              }}>{sub.category}</span>
                            )}
                          </div>
                          {sub.feedback && (
                            <div style={{
                              marginTop: "0.625rem",
                              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                              borderRadius: "10px", padding: "0.5rem 0.75rem",
                              display: "flex", gap: "0.5rem", alignItems: "flex-start",
                            }}>
                              <MessageCircle size={12} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0, marginTop: 1 }} />
                              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as any}>
                                {sub.feedback}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Floating Action Button ─────────────────── */}
      <Link
        href={stats.submissionsToday >= 15 ? "#" : "/field-agent/capture"}
        aria-disabled={stats.submissionsToday >= 15}
        style={{
          position: "fixed", bottom: "5.5rem", right: "1.25rem", zIndex: 40,
          display: "flex", alignItems: "center", gap: "0.5rem",
          fontWeight: 800, fontSize: "0.85rem",
          padding: "0.875rem 1.375rem", borderRadius: "999px",
          background: stats.submissionsToday >= 15
            ? "rgba(100,116,139,0.3)"
            : "linear-gradient(135deg, #f97316, #ea580c)",
          color: stats.submissionsToday >= 15 ? "#475569" : "#fff",
          boxShadow: stats.submissionsToday >= 15 ? "none" : "0 8px 30px rgba(249,115,22,0.45), 0 2px 8px rgba(0,0,0,0.3)",
          pointerEvents: stats.submissionsToday >= 15 ? "none" : "auto",
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <Plus size={18} />
        New Capture
      </Link>

      {/* ── WhatsApp Support Button ─────────────────── */}
      <a
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: "5.5rem", left: "1.25rem", zIndex: 40,
          width: 46, height: 46, borderRadius: "14px",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          transition: "transform 0.2s ease",
          textDecoration: "none",
        }}
        title="WhatsApp Support"
      >
        <MessageCircle size={20} color="#fff" />
      </a>

      {/* ── Mobile Bottom Nav ─────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(5,13,26,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", padding: "0.5rem 1rem",
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
      }}>
        <button
          className="nav-btn"
          onClick={() => setActiveTab("overview")}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "0.25rem",
            padding: "0.4rem 0",
            color: activeTab === "overview" ? "#10b981" : "rgba(255,255,255,0.25)",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "8px",
            background: activeTab === "overview" ? "rgba(16,185,129,0.12)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>
            <LayoutDashboard size={17} />
          </div>
          <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>Overview</span>
        </button>

        {/* Center gap for FAB */}
        <div style={{ flex: 1 }} />

        <button
          className="nav-btn"
          onClick={() => setActiveTab("activity")}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "0.25rem",
            padding: "0.4rem 0",
            color: activeTab === "activity" ? "#10b981" : "rgba(255,255,255,0.25)",
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "8px",
            background: activeTab === "activity" ? "rgba(16,185,129,0.12)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>
            <Activity size={17} />
          </div>
          <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>Activity</span>
        </button>
      </nav>
    </div>
  )
}
