"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, FileCheck, CreditCard, LayoutDashboard, CheckCircle, XCircle,
  Trash2, LogOut, TrendingUp, AlertTriangle, ShieldOff, ChevronRight,
  Star, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      if (!["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
        router.push("/");
      } else {
        fetchData();
      }
    }
  }, [sessionStatus, router, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes, wRes, agentsRes] = await Promise.all([
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/submissions").then(r => r.json()),
        fetch("/api/admin/withdrawals").then(r => r.json()),
        fetch("/api/admin/agents").then(r => r.json()),
      ]);
      setUsers(usersRes.users || []);
      setSubmissions(subsRes.submissions || []);
      setWithdrawals(wRes.withdrawals || []);
      setAgents(agentsRes.agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, data: any) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const processSubmission = async (submissionId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this submission?`)) return;
    const feedbackStr = prompt(`Enter optional feedback for this ${action.toLowerCase()}:`);
    if (feedbackStr === null) return; // cancelled

    try {
      await fetch("/api/admin/verify-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action, feedback: feedbackStr || undefined }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm("Are you sure you want to completely delete this submission?")) return;
    try {
      await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const processWithdrawal = async (withdrawalId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    try {
      await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to process withdrawal. Check if agent has enough points.");
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#f06135] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === "PENDING").length;
  const pendingAgents = users.filter(u => u.role === "AGENT" && u.status === "PENDING").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "PENDING").length;
  const flaggedAgents = agents.filter(a => a.status === "FLAGGED").length;
  const suspendedAgents = agents.filter(a => a.status === "SUSPENDED").length;
  const todaySubs = submissions.filter(s => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const navItems = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users, badge: pendingAgents },
    { key: "submissions", label: "Submissions", icon: FileCheck, badge: pendingSubmissions },
    { key: "withdrawals", label: "Withdrawals", icon: CreditCard, badge: pendingWithdrawals },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-[#f06135]">KijijiPoll</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${
                activeTab === key
                  ? "bg-[#f06135]/10 text-[#f06135]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge != null && badge > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}

          {/* Agents Management — links to separate page */}
          <Link
            href="/admin/agents"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm text-gray-600 hover:bg-gray-100"
          >
            <TrendingUp className="w-4 h-4" />
            Agent Performance
            {(flaggedAgents + suspendedAgents) > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {flaggedAgents + suspendedAgents}
              </span>
            )}
            <ChevronRight className="w-3 h-3 ml-0.5 opacity-50" />
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {activeTab === "overview" ? "Dashboard Overview" : activeTab}
            </h2>
            <p className="text-xs text-gray-400">
              Welcome back, {session?.user?.name || session?.user?.email || "Admin"} ({session?.user?.role})
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Activity className="w-3.5 h-3.5" />
            {new Date().toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
          </div>
        </div>

        <div className="p-8">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: "Total Agents", value: agents.length, sub: `${agents.filter(a => a.status === "ACTIVE").length} active`, icon: Users, color: "text-[#f06135]", bg: "bg-orange-50" },
                  { label: "Submissions Today", value: todaySubs, sub: `${submissions.length} all-time`, icon: FileCheck, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Pending Verifications", value: pendingSubmissions, sub: "awaiting review", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Flagged / Suspended", value: flaggedAgents + suspendedAgents, sub: `${flaggedAgents} flagged · ${suspendedAgents} suspended`, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                      </div>
                    </div>
                    <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">{kpi.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-bold text-gray-700 text-sm mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => setActiveTab("submissions")} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 text-left hover:border-[#f06135]/40 hover:shadow-md transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                        <FileCheck className="w-4 h-4 text-[#f06135]" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-[#f06135] transition">Review Submissions</div>
                        <div className="text-xs text-gray-400">{pendingSubmissions} pending</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#f06135] transition" />
                    </div>
                  </button>
                  <Link href="/admin/agents" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 text-left hover:border-[#f06135]/40 hover:shadow-md transition group flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm group-hover:text-[#f06135] transition">View All Agents</div>
                      <div className="text-xs text-gray-400">{agents.length} agents tracked</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#f06135] transition" />
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-bold text-gray-700 text-sm mb-3">Recent Submissions</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {submissions.slice(0, 8).map((s) => (
                    <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === "VERIFIED" ? "bg-green-500" : s.status === "REJECTED" ? "bg-red-500" : "bg-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{s.agent?.name || s.agent?.email || "Unknown"}</span>
                        <span className="text-xs text-gray-400 ml-2">{s.category}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${s.status === "VERIFIED" ? "bg-green-100 text-green-700" : s.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.status}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(s.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                  {submissions.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No submissions yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-500 text-sm">Name / Email</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Role</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Status</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Points</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900 text-sm">{u.name || "N/A"}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                          <div className="text-xs text-gray-300">{u.phoneNumber}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "SUPERVISOR" ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : u.status === "SUSPENDED" ? "bg-red-100 text-red-700" : u.status === "FLAGGED" ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-600"}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-gray-900 text-sm">{u.points}</td>
                        <td className="p-4 text-right space-x-2">
                          {u.status === "PENDING" && (
                            <button onClick={() => updateUser(u.id, { status: "ACTIVE" })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.status === "ACTIVE" && u.id !== currentUserId && (
                            <button onClick={() => updateUser(u.id, { status: "SUSPENDED" })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.status === "SUSPENDED" && (
                            <button onClick={() => updateUser(u.id, { status: "ACTIVE" })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.role !== "ADMIN" && session?.user?.role === "ADMIN" && (
                            <button onClick={() => updateUser(u.id, { role: "ADMIN" })} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 font-bold">
                              Make Admin
                            </button>
                          )}
                          {(u.role === "AGENT" || u.role === "SUPERVISOR") && (
                            <Link href={`/admin/agents/${u.id}`} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold inline-flex items-center gap-1">
                              Profile <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SUBMISSIONS ── */}
          {activeTab === "submissions" && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-500 text-sm">Agent</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Category / Info</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Photo</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Status</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {submissions.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900 text-sm">{s.agent?.name || "Unknown"}</div>
                          <div className="text-xs text-gray-400">{s.agent?.email || s.agent?.phoneNumber}</div>
                          {(s.agent?.role === "AGENT" || s.agent?.role === "SUPERVISOR") && (
                            <Link href={`/admin/agents/${s.agentId}`} className="text-xs text-[#f06135] hover:underline">View profile</Link>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900 text-sm">{s.category}</div>
                          <div className="text-xs text-gray-400">{s.contactInfo}</div>
                        </td>
                        <td className="p-4">
                          <a href={s.photoUrl} target="_blank" rel="noreferrer" className="text-[#f06135] hover:underline text-sm font-medium">View Photo</a>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.status === "VERIFIED" ? "bg-green-100 text-green-700" : s.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {s.status === "PENDING" && (
                            <>
                              <button onClick={() => processSubmission(s.id, "APPROVE")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => processSubmission(s.id, "REJECT")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => deleteSubmission(s.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── WITHDRAWALS ── */}
          {activeTab === "withdrawals" && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-500 text-sm">Agent</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Amount (Ksh)</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Available Points</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm">Status</th>
                      <th className="p-4 font-semibold text-gray-500 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {withdrawals.map(w => (
                      <tr key={w.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900 text-sm">{w.agent?.name || "Unknown"}</div>
                          <div className="text-xs text-gray-400">{w.agent?.phoneNumber}</div>
                        </td>
                        <td className="p-4 font-black text-gray-900">Ksh {w.amount}</td>
                        <td className="p-4 font-medium text-gray-500 text-sm">{w.agent?.points} pts</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${w.status === "APPROVED" ? "bg-green-100 text-green-700" : w.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {w.status === "PENDING" && (
                            <>
                              <button onClick={() => processWithdrawal(w.id, "APPROVE")} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-bold">
                                Approve & Pay
                              </button>
                              <button onClick={() => processWithdrawal(w.id, "REJECT")} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-bold">
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

