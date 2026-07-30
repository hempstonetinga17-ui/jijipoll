"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Search, ChevronRight, Star, AlertTriangle, ShieldOff,
  CheckCircle2, Clock, ArrowLeft
} from "lucide-react";

type AgentStats = {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  grade: string;
  rate: number | null;
  color: string;
};

type Agent = {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: string;
  status: string;
  points: number;
  createdAt: string;
  stats: AgentStats;
};

const GRADE_STYLES: Record<string, string> = {
  A: "bg-green-100 text-green-700 border border-green-200",
  B: "bg-blue-100 text-blue-700 border border-blue-200",
  C: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  D: "bg-red-100 text-red-700 border border-red-200",
  "N/A": "bg-gray-100 text-gray-500 border border-gray-200",
};

const GRADE_EMOJI: Record<string, string> = {
  A: "🟢",
  B: "🔵",
  C: "🟡",
  D: "🔴",
  "N/A": "⚪",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  FLAGGED: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const ROLE_STYLES: Record<string, string> = {
  SUPERVISOR: "bg-purple-100 text-purple-700",
  AGENT: "bg-blue-100 text-blue-700",
};

export default function AgentsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [filtered, setFiltered] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterGrade, setFilterGrade] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/login");
    else if (sessionStatus === "authenticated" && session.user.role !== "ADMIN") router.push("/");
  }, [sessionStatus, session, router]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user.role === "ADMIN") {
      fetchAgents();
    }
  }, [sessionStatus, session, fetchAgents]);

  useEffect(() => {
    let result = [...agents];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.phoneNumber?.includes(q)
      );
    }
    if (filterStatus !== "ALL") result = result.filter((a) => a.status === filterStatus);
    if (filterGrade !== "ALL") result = result.filter((a) => a.stats.grade === filterGrade);
    if (filterRole !== "ALL") result = result.filter((a) => a.role === filterRole);
    setFiltered(result);
  }, [agents, search, filterStatus, filterGrade, filterRole]);

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#f06135] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading agents…</p>
        </div>
      </div>
    );
  }

  const totalActive = agents.filter((a) => a.status === "ACTIVE").length;
  const totalFlagged = agents.filter((a) => a.status === "FLAGGED").length;
  const totalSuspended = agents.filter((a) => a.status === "SUSPENDED").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#f06135] transition font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Panel
          </Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#f06135]" />
            <h1 className="text-lg font-bold text-gray-900">Agent Management</h1>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            {agents.length} agents total
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Agents", value: agents.length, icon: Users, color: "text-[#f06135]", bg: "bg-orange-50" },
            { label: "Active", value: totalActive, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "Flagged", value: totalFlagged, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Suspended", value: totalSuspended, icon: ShieldOff, color: "text-red-600", bg: "bg-red-50" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-500 font-medium">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f06135]/30 focus:border-[#f06135]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f06135]/30 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="FLAGGED">Flagged</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f06135]/30 bg-white"
          >
            <option value="ALL">All Grades</option>
            <option value="A">🟢 Grade A (≥90%)</option>
            <option value="B">🔵 Grade B (80–89%)</option>
            <option value="C">🟡 Grade C (70–79%)</option>
            <option value="D">🔴 Grade D (&lt;70%)</option>
            <option value="N/A">⚪ No Data</option>
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f06135]/30 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="AGENT">Agent</option>
            <option value="SUPERVISOR">Supervisor</option>
          </select>
          {(search || filterStatus !== "ALL" || filterGrade !== "ALL" || filterRole !== "ALL") && (
            <button
              onClick={() => { setSearch(""); setFilterStatus("ALL"); setFilterGrade("ALL"); setFilterRole("ALL"); }}
              className="text-sm text-gray-500 hover:text-[#f06135] transition font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No agents found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-500 text-sm">Agent</th>
                  <th className="p-4 font-semibold text-gray-500 text-sm">Role</th>
                  <th className="p-4 font-semibold text-gray-500 text-sm">Submissions</th>
                  <th className="p-4 font-semibold text-gray-500 text-sm">Approval Rate</th>
                  <th className="p-4 font-semibold text-gray-500 text-sm">Grade</th>
                  <th className="p-4 font-semibold text-gray-500 text-sm">Status</th>
                  <th className="p-4 font-semibold text-gray-500 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50/60 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f06135] to-orange-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {(agent.name || agent.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{agent.name || "—"}</div>
                          <div className="text-xs text-gray-400">{agent.email || agent.phoneNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${ROLE_STYLES[agent.role] || "bg-gray-100 text-gray-600"}`}>
                        {agent.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-gray-900">{agent.stats.total}</div>
                      <div className="text-xs text-gray-400">{agent.stats.pending} pending</div>
                    </td>
                    <td className="p-4">
                      {agent.stats.rate !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${agent.stats.rate >= 80 ? "bg-green-500" : agent.stats.rate >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${agent.stats.rate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{agent.stats.rate}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> No data
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${GRADE_STYLES[agent.stats.grade]}`}>
                        <span>{GRADE_EMOJI[agent.stats.grade]}</span>
                        {agent.stats.grade}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STATUS_STYLES[agent.status] || "bg-gray-100 text-gray-600"}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/agents/${agent.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f06135] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition"
                      >
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Showing {filtered.length} of {agents.length} agents
          </p>
        )}
      </div>
    </div>
  );
}
