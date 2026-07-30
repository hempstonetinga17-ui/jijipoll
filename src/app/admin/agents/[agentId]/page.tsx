"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, Star, AlertTriangle, ShieldOff,
  CheckCircle2, XCircle, Shield, UserCheck, UserX, MapPin,
  TrendingUp, FileCheck, Clock, BarChart2, ChevronDown, ExternalLink
} from "lucide-react";

// Leaflet is browser-only — lazy-load to avoid SSR issues
const AgentMap = dynamic(() => import("./AgentMap"), { ssr: false, loading: () => (
  <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
    Loading map…
  </div>
)});

type Submission = {
  id: string;
  status: string;
  category: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  contactInfo: string | null;
  createdAt: string;
};

type AgentDetail = {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: string;
  status: string;
  points: number;
  createdAt: string;
};

type Stats = {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  rate: number | null;
  grade: string;
  gradeColor: string;
};

const GRADE_META: Record<string, { label: string; emoji: string; bg: string; text: string; bar: string }> = {
  A: { label: "Excellent", emoji: "🟢", bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  B: { label: "Good", emoji: "🔵", bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  C: { label: "Average", emoji: "🟡", bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" },
  D: { label: "Poor", emoji: "🔴", bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
  "N/A": { label: "No Data", emoji: "⚪", bg: "bg-gray-50", text: "text-gray-500", bar: "bg-gray-300" },
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  FLAGGED: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const SUB_STATUS_STYLES: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
};

export default function AgentProfilePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams<{ agentId: string }>();

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/login");
    else if (sessionStatus === "authenticated" && session.user.role !== "ADMIN") router.push("/");
  }, [sessionStatus, session, router]);

  const fetchAgent = useCallback(async () => {
    if (!params.agentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/agents/${params.agentId}`);
      const data = await res.json();
      setAgent(data.agent);
      setStats(data.stats);
      setSubmissions(data.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [params.agentId]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user.role === "ADMIN") {
      fetchAgent();
    }
  }, [sessionStatus, session, fetchAgent]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerify = async (submissionId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(`verify-${submissionId}`);
    try {
      const res = await fetch("/api/admin/verify-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Submission ${action === "APPROVE" ? "approved" : "rejected"} successfully`, true);
      fetchAgent();
    } catch (e: any) {
      showToast(e.message || "Action failed", false);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async (role: "AGENT" | "SUPERVISOR") => {
    setActionLoading("promote");
    try {
      const res = await fetch(`/api/admin/agents/${params.agentId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Role updated to ${role}`, true);
      fetchAgent();
    } catch (e: any) {
      showToast(e.message || "Action failed", false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetStatus = async (status: string) => {
    setActionLoading(`status-${status}`);
    try {
      const res = await fetch(`/api/admin/agents/${params.agentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Status set to ${status}`, true);
      fetchAgent();
    } catch (e: any) {
      showToast(e.message || "Action failed", false);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#f06135] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading agent profile…</p>
        </div>
      </div>
    );
  }

  if (!agent || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <User className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Agent not found.</p>
          <Link href="/admin/agents" className="text-[#f06135] font-semibold mt-2 inline-block">
            ← Back to agents
          </Link>
        </div>
      </div>
    );
  }

  const grade = stats.grade;
  const gMeta = GRADE_META[grade] || GRADE_META["N/A"];
  const joinDate = new Date(agent.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  const locatedSubs = submissions.filter((s) => s.latitude && s.longitude);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 flex-wrap">
          <Link href="/admin/agents" className="flex items-center gap-1.5 text-gray-500 hover:text-[#f06135] transition font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            All Agents
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-bold text-gray-900 truncate">{agent.name || agent.email || "Agent"}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f06135] to-orange-400 flex items-center justify-center text-white text-3xl font-black shrink-0">
              {(agent.name || agent.email || "?")[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-black text-gray-900">{agent.name || "Unnamed Agent"}</h1>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLES[agent.status] || "bg-gray-100 text-gray-600"}`}>
                  {agent.status}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${agent.role === "SUPERVISOR" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {agent.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {agent.email && (
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{agent.email}</span>
                )}
                {agent.phoneNumber && (
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{agent.phoneNumber}</span>
                )}
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Joined {joinDate}</span>
                <span className="flex items-center gap-1.5 text-[#f06135] font-semibold">
                  <Star className="w-4 h-4" />{agent.points} pts
                </span>
              </div>
            </div>

            {/* Grade Badge */}
            <div className={`${gMeta.bg} px-6 py-4 rounded-2xl text-center min-w-[110px]`}>
              <div className="text-3xl mb-1">{gMeta.emoji}</div>
              <div className={`text-2xl font-black ${gMeta.text}`}>Grade {grade}</div>
              <div className={`text-xs font-semibold ${gMeta.text} opacity-70`}>{gMeta.label}</div>
              {stats.rate !== null && (
                <div className={`text-sm font-black ${gMeta.text} mt-1`}>{stats.rate}%</div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, icon: BarChart2, color: "text-gray-700", bg: "bg-gray-50" },
            { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            {
              label: "Approval Rate",
              value: stats.rate !== null ? `${stats.rate}%` : "—",
              icon: TrendingUp,
              color: stats.rate !== null && stats.rate >= 80 ? "text-green-600" : stats.rate !== null && stats.rate >= 70 ? "text-amber-600" : "text-red-600",
              bg: "bg-gray-50"
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Map + Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Map */}
            {locatedSubs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#f06135]" />
                  <h2 className="font-bold text-gray-900">Capture Locations</h2>
                  <span className="ml-auto text-xs text-gray-400">{locatedSubs.length} pins</span>
                </div>
                <AgentMap submissions={locatedSubs} />
              </div>
            )}

            {/* Submissions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#f06135]" />
                <h2 className="font-bold text-gray-900">Submissions</h2>
                <span className="ml-auto text-xs text-gray-400">{submissions.length} total</span>
              </div>
              {submissions.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">No submissions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-3 font-semibold text-gray-500 text-xs">Date</th>
                        <th className="p-3 font-semibold text-gray-500 text-xs">Category</th>
                        <th className="p-3 font-semibold text-gray-500 text-xs">Location</th>
                        <th className="p-3 font-semibold text-gray-500 text-xs">Photo</th>
                        <th className="p-3 font-semibold text-gray-500 text-xs">Status</th>
                        <th className="p-3 font-semibold text-gray-500 text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-3 text-gray-600 whitespace-nowrap">
                            {new Date(sub.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="p-3">
                            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-md">{sub.category}</span>
                          </td>
                          <td className="p-3 text-gray-500 text-xs">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {sub.latitude.toFixed(4)}, {sub.longitude.toFixed(4)}
                            </span>
                          </td>
                          <td className="p-3">
                            <a
                              href={sub.photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[#f06135] hover:underline font-medium text-xs"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="p-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${SUB_STATUS_STYLES[sub.status] || "bg-gray-100 text-gray-600"}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {sub.status === "PENDING" && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleVerify(sub.id, "APPROVE")}
                                  disabled={actionLoading === `verify-${sub.id}`}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleVerify(sub.id, "REJECT")}
                                  disabled={actionLoading === `verify-${sub.id}`}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Admin Actions Panel */}
          <div className="space-y-4">
            {/* Performance Grading Card */}
            <div className={`${gMeta.bg} rounded-2xl border border-gray-100 p-5`}>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#f06135]" /> Performance Grade
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "🟢 Grade A", range: "≥ 90%", active: grade === "A" },
                  { label: "🔵 Grade B", range: "80–89%", active: grade === "B" },
                  { label: "🟡 Grade C (Flagged)", range: "70–79%", active: grade === "C" },
                  { label: "🔴 Grade D (Suspended)", range: "< 70%", active: grade === "D" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center py-1.5 px-2 rounded-lg transition ${row.active ? "bg-white shadow-sm font-semibold" : "text-gray-500"}`}
                  >
                    <span>{row.label}</span>
                    <span className="text-xs">{row.range}</span>
                  </div>
                ))}
              </div>
              {stats.rate !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Current rate</span>
                    <span className="font-bold">{stats.rate}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${gMeta.bar}`}
                      style={{ width: `${stats.rate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Role Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f06135]" /> Role Management
              </h3>
              <div className="space-y-2">
                {agent.role !== "SUPERVISOR" ? (
                  <button
                    onClick={() => handlePromote("SUPERVISOR")}
                    disabled={actionLoading === "promote"}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    Promote to Supervisor
                  </button>
                ) : (
                  <button
                    onClick={() => handlePromote("AGENT")}
                    disabled={actionLoading === "promote"}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Demote to Agent
                  </button>
                )}
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f06135]" /> Account Status
              </h3>
              <div className="space-y-2">
                {agent.status !== "ACTIVE" && (
                  <button
                    onClick={() => handleSetStatus("ACTIVE")}
                    disabled={!!actionLoading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Restore as Active
                  </button>
                )}
                {agent.status !== "FLAGGED" && (
                  <button
                    onClick={() => handleSetStatus("FLAGGED")}
                    disabled={!!actionLoading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Flag Account
                  </button>
                )}
                {agent.status !== "SUSPENDED" && (
                  <button
                    onClick={() => handleSetStatus("SUSPENDED")}
                    disabled={!!actionLoading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    <ShieldOff className="w-4 h-4" />
                    Suspend Account
                  </button>
                )}
              </div>
            </div>

            {/* Performance Note */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">📝 Performance Note</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an internal note about this agent's performance…"
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#f06135]/30 focus:border-[#f06135] resize-none"
              />
              <button
                onClick={() => { alert("Note saved (UI only — extend to persist in DB if needed)"); setNote(""); }}
                disabled={!note.trim()}
                className="mt-2 w-full py-2 text-sm font-semibold text-[#f06135] border border-[#f06135] rounded-xl hover:bg-orange-50 transition disabled:opacity-40"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
