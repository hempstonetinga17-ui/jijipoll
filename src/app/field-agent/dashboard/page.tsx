"use client"
export const dynamic = "force-dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Star, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle, FileCheck, MapPin, ExternalLink, MessageCircle } from "lucide-react"

type Stats = {
  points: number;
  status: string;
  submissionsToday: number;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  decided: number;
  approvalRate: number;
  averageGrade: number;
  grade: string;
}

type Submission = {
  id: string;
  status: string;
  category: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  feedback: string | null;
  grade: number | null;
  createdAt: string;
};

const GRADE_META: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  A: { label: "Excellent", emoji: "🟢", bg: "bg-green-50", text: "text-green-700" },
  B: { label: "Good", emoji: "🔵", bg: "bg-blue-50", text: "text-blue-700" },
  C: { label: "Average", emoji: "🟡", bg: "bg-amber-50", text: "text-amber-700" },
  D: { label: "Poor", emoji: "🔴", bg: "bg-red-50", text: "text-red-700" },
  "N/A": { label: "No Data", emoji: "⚪", bg: "bg-gray-50", text: "text-gray-500" },
};

export default function AgentDashboard() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status ?? "loading"
  const router = useRouter()
  
  const [stats, setStats] = useState<Stats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/field-agent/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPERVISOR") {
        router.push("/admin");
        return;
      }
      // Fetch stats and submissions from backend
      Promise.all([
        fetch("/api/field-agent/stats").then(res => res.json()),
        fetch("/api/field-agent/submissions").then(res => res.json())
      ])
        .then(([statsData, submissionsData]) => {
          setStats(statsData)
          setSubmissions(submissionsData.submissions || [])
          setLoading(false)
        })
        .catch(err => {
          console.error("Failed to load dashboard data", err)
          setLoading(false)
        })
    }
  }, [status])

  if (status === "loading" || loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f06135]"></div>
      </div>
    )
  }

  const gMeta = GRADE_META[stats.grade] || GRADE_META["N/A"];
  const isTraining = stats.status === "TRAINING";

  const handleWithdraw = async () => {
    if (stats.points < 500) {
      alert("You need at least 500 KSh to request a withdrawal.");
      return;
    }
    const amt = prompt("How much would you like to withdraw? (Min: 500, Max: " + stats.points + ")");
    if (!amt || isNaN(Number(amt)) || Number(amt) < 500) {
        if (amt && Number(amt) < 500) alert("Minimum withdrawal is 500 KSh.");
        return;
    }
    if (Number(amt) > stats.points) return alert("Insufficient points!");
    
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amt) })
      });
      const data = await res.json();
      if (data.success) {
        alert("Withdrawal requested successfully!");
        window.location.reload();
      } else {
        alert(data.error || "Failed to request withdrawal");
      }
    } catch(e) {
      alert("An error occurred");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-900 font-black text-xl tracking-tighter">
          <img src="/kijijipoll.png" alt="Kijijipoll Logo" className="h-8 w-auto" />
          KIJIJIPOLL
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden sm:block">
            {session?.user?.name || session?.user?.email}
          </span>
          <button 
            onClick={() => {
              import("next-auth/react").then(mod => mod.signOut({ callbackUrl: "/field-agent/login" }));
            }}
            className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-xl transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Agent Dashboard</h1>
            <p className="text-gray-600 font-medium">Capture data and earn rewards.</p>
          </div>
          
          <Link 
            href="/field-agent/capture"
            className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-base transition shadow-lg ${
              stats.submissionsToday >= 15 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none' 
                : 'bg-[#f06135] text-white hover:bg-[#d35400] hover:scale-105 active:scale-95'
            }`}
          >
            + New Capture
          </Link>
        </div>

        {isTraining && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900">Training Phase</h3>
                <p className="text-blue-800/80 text-sm mt-1 mb-4">
                  Complete your first 50 reviewed submissions with an approval rate of at least 70% to become an ACTIVE agent.
                </p>
                <div className="flex justify-between text-sm font-bold text-blue-900 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(stats.decided, 50)} / 50</span>
                </div>
                <div className="w-full bg-blue-200/50 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all" 
                    style={{ width: `${Math.min((stats.decided / 50) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {stats.status === "SUSPENDED" && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 shadow-sm flex gap-4 text-red-700">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                    <h3 className="font-bold text-lg">Account Suspended</h3>
                    <p className="text-sm mt-1">Your account has been suspended due to low approval ratings. You can no longer submit data.</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Earnings Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Star className="w-4 h-4"/> Earnings</h3>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-3xl font-black text-green-600">{stats.points}</span>
              <span className="text-sm font-bold text-gray-400">KSh</span>
            </div>
            {stats.points >= 500 && (
              <button 
                onClick={handleWithdraw}
                className="mt-3 w-full bg-green-50 text-green-700 font-bold py-1.5 rounded-lg hover:bg-green-100 transition text-xs"
              >
                Withdraw
              </button>
            )}
            {stats.points > 0 && stats.points < 500 && (
                <div className="text-[10px] text-gray-400 mt-2 font-medium bg-gray-50 p-1.5 rounded text-center">
                    Min withdrawal: 500 KSh
                </div>
            )}
          </div>

          {/* Daily Limit Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Today's Captures</h3>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-3xl font-black text-[#f06135]">{stats.submissionsToday}</span>
              <span className="text-lg font-bold text-gray-300">/ 15</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                <div 
                className="bg-[#f06135] h-1.5 rounded-full" 
                style={{ width: `${(stats.submissionsToday / 15) * 100}%` }} 
                />
            </div>
          </div>

          {/* Approval Rate Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> Approval Rate</h3>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-3xl font-black text-gray-900">{stats.decided > 0 ? `${stats.approvalRate}%` : "—"}</span>
            </div>
            <div className="flex gap-2 text-xs font-semibold mt-3 text-gray-500">
                <span className="text-green-600">{stats.approved} ✓</span>
                <span className="text-red-600">{stats.rejected} ✗</span>
            </div>
          </div>

          {/* Grade Card */}
          <div className={`${gMeta.bg} p-5 rounded-2xl border border-white/50 shadow-sm flex flex-col justify-between`}>
            <h3 className={`text-xs font-bold ${gMeta.text} opacity-70 uppercase tracking-wider mb-2`}>Quality Grade</h3>
            <div className="flex items-center gap-3 mt-auto">
              <span className="text-4xl">{gMeta.emoji}</span>
              <div>
                <div className={`text-2xl font-black ${gMeta.text}`}>
                  {stats.decided > 0 ? `${stats.averageGrade.toFixed(1)}%` : "N/A"}
                </div>
                <div className={`text-xs font-bold ${gMeta.text} opacity-80`}>{gMeta.label} ({stats.grade})</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Link when limit reached */}
        {stats.submissionsToday >= 15 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center text-amber-700 font-semibold text-sm shadow-sm mb-8">
                You've reached your daily limit of 15 submissions. Great work! Come back tomorrow.
            </div>
        )}

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#f06135]" />
            <h2 className="font-bold text-gray-900 text-lg">Recent Captures</h2>
          </div>
          {submissions.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No captures yet. Start collecting!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-500 text-xs">Date</th>
                    <th className="p-4 font-semibold text-gray-500 text-xs">Category</th>
                    <th className="p-4 font-semibold text-gray-500 text-xs">Location</th>
                    <th className="p-4 font-semibold text-gray-500 text-xs">Status</th>
                    <th className="p-4 font-semibold text-gray-500 text-xs">Grade</th>
                    <th className="p-4 font-semibold text-gray-500 text-xs">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md">{sub.category}</span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {sub.latitude.toFixed(4)}, {sub.longitude.toFixed(4)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                            sub.status === "VERIFIED" ? "bg-green-100 text-green-700" :
                            sub.status === "REJECTED" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {sub.grade !== null && sub.grade !== undefined ? (
                          <span className="text-xs font-bold text-gray-700">{sub.grade}%</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {sub.feedback ? (
                          <div className="flex items-start gap-1.5 text-xs text-gray-600 max-w-xs">
                            <MessageCircle className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
                            <span className="truncate" title={sub.feedback}>{sub.feedback}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

