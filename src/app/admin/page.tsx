"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, FileCheck, CreditCard, LayoutDashboard, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchData();
      }
    }
  }, [sessionStatus, router, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes, wRes] = await Promise.all([
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/submissions").then(r => r.json()),
        fetch("/api/admin/withdrawals").then(r => r.json()),
      ]);
      setUsers(usersRes.users || []);
      setSubmissions(subsRes.submissions || []);
      setWithdrawals(wRes.withdrawals || []);
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
    try {
      await fetch("/api/admin/verify-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action }),
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const pendingSubmissions = submissions.filter(s => s.status === "PENDING").length;
  const pendingAgents = users.filter(u => u.role === "AGENT" && u.status === "PENDING").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "PENDING").length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-[#f06135]">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === "overview" ? "bg-[#f06135]/10 text-[#f06135]" : "text-gray-600 hover:bg-gray-100"}`}>
            <LayoutDashboard className="w-5 h-5" /> Overview
          </button>
          <button onClick={() => setActiveTab("users")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === "users" ? "bg-[#f06135]/10 text-[#f06135]" : "text-gray-600 hover:bg-gray-100"}`}>
            <Users className="w-5 h-5" /> Users {pendingAgents > 0 && <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingAgents}</span>}
          </button>
          <button onClick={() => setActiveTab("submissions")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === "submissions" ? "bg-[#f06135]/10 text-[#f06135]" : "text-gray-600 hover:bg-gray-100"}`}>
            <FileCheck className="w-5 h-5" /> Submissions {pendingSubmissions > 0 && <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingSubmissions}</span>}
          </button>
          <button onClick={() => setActiveTab("withdrawals")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === "withdrawals" ? "bg-[#f06135]/10 text-[#f06135]" : "text-gray-600 hover:bg-gray-100"}`}>
            <CreditCard className="w-5 h-5" /> Withdrawals {pendingWithdrawals > 0 && <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingWithdrawals}</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-gray-500 font-medium mb-2">Total Users</div>
                <div className="text-4xl font-black text-gray-900">{users.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-gray-500 font-medium mb-2">Total Submissions</div>
                <div className="text-4xl font-black text-gray-900">{submissions.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-gray-500 font-medium mb-2">Pending Withdrawals</div>
                <div className="text-4xl font-black text-[#f06135]">{pendingWithdrawals}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">User Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Name / Email</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Points</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{u.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-xs text-gray-400">{u.phoneNumber}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : u.status === "SUSPENDED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-900">{u.points}</td>
                      <td className="p-4 text-right space-x-2">
                        {u.status === "PENDING" && (
                          <button onClick={() => updateUser(u.id, { status: "ACTIVE" })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {u.status === "ACTIVE" && u.id !== session.user.id && (
                          <button onClick={() => updateUser(u.id, { status: "SUSPENDED" })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {u.status === "SUSPENDED" && (
                          <button onClick={() => updateUser(u.id, { status: "ACTIVE" })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {u.role !== "ADMIN" && (
                          <button onClick={() => updateUser(u.id, { role: "ADMIN" })} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Data Submissions</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Agent</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Category / Info</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Photo</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{s.agent?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{s.agent?.email || s.agent?.phoneNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{s.category}</div>
                        <div className="text-sm text-gray-500">{s.contactInfo}</div>
                      </td>
                      <td className="p-4">
                        <a href={s.photoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm font-medium">View Photo</a>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.status === "VERIFIED" ? "bg-green-100 text-green-700" : s.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {s.status === "PENDING" && (
                          <>
                            <button onClick={() => processSubmission(s.id, "APPROVE")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => processSubmission(s.id, "REJECT")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteSubmission(s.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Withdrawal Requests</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Agent</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Amount (Ksh)</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Available Points</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{w.agent?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{w.agent?.phoneNumber}</div>
                      </td>
                      <td className="p-4 font-black text-gray-900">Ksh {w.amount}</td>
                      <td className="p-4 font-medium text-gray-500">{w.agent?.points} pts</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${w.status === "APPROVED" ? "bg-green-100 text-green-700" : w.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
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
  );
}
