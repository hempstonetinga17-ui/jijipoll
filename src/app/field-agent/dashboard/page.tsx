"use client"
export const dynamic = "force-dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AgentDashboard() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status ?? "loading"
  const router = useRouter()
  
  const [stats, setStats] = useState({
    points: 0,
    submissionsToday: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/field-agent/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch stats from backend
      fetch("/api/field-agent/stats")
        .then(res => res.json())
        .then(data => {
          setStats(data)
          setLoading(false)
        })
        .catch(err => {
          console.error("Failed to load stats", err)
          setLoading(false)
        })
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f06135]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-900 font-black text-xl tracking-tighter">
          <img src="/jijipoll.png" alt="Jijipoll Logo" className="h-8 w-auto" />
          JIJIPOLL
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600">Capture data and earn rewards.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Earnings</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-green-600">{stats.points}</span>
              <span className="text-gray-500 font-medium mb-1">KSh</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">1 Point = 1 KSh. Points are awarded upon verification.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Daily Limit</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-[#f06135]">{stats.submissionsToday}</span>
              <span className="text-xl font-bold text-gray-400 mb-1">/ 15</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Maximum 15 submissions allowed per day.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-[#f06135]/10 text-[#f06135] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to collect data?</h2>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Enable location services and capture points of interest around you.
          </p>
          
          <Link 
            href="/field-agent/capture"
            className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl ${
              stats.submissionsToday >= 15 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none' 
                : 'bg-[#f06135] text-white hover:bg-[#d35400] hover:scale-105 active:scale-95'
            }`}
          >
            Capture Location Data
          </Link>

          {stats.submissionsToday >= 15 && (
            <p className="text-red-500 text-sm mt-4 font-medium">
              You've reached your daily limit. Great work! Come back tomorrow.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
