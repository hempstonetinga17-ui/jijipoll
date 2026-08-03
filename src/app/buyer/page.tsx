"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, Download, ExternalLink, Clock, ShieldCheck, Database, FileText } from "lucide-react"

export default function BuyerPortal() {
  const [email, setEmail] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
        setIsAuthenticated(true)
      } else {
        alert(data.error || "Failed to load orders")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200/50 max-w-md w-full border border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f06135] to-[#f58f70] flex items-center justify-center mx-auto mb-6">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-center mb-2">Buyer Portal</h1>
          <p className="text-sm text-neutral-500 text-center mb-8">Enter the email address you used to purchase datasets to access your downloads.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f06135]/50 focus:border-[#f06135] transition"
                placeholder="you@company.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f06135] hover:bg-[#e05024] text-white font-bold py-3 rounded-xl transition flex items-center justify-center disabled:opacity-70"
            >
              {loading ? "Loading..." : "Access My Datasets"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-20">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f06135] to-[#f58f70] flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">JijiPoll<span className="text-[#f06135]">Data</span></span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-neutral-500">{email}</span>
            <button onClick={() => setIsAuthenticated(false)} className="text-[#f06135] hover:underline">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">My Datasets</h1>
            <p className="text-neutral-500">Manage and download your purchased datasets.</p>
          </div>
          <Link href="/datasets" className="bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 font-bold px-4 py-2 rounded-lg transition shadow-sm">
            Browse Catalog
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No orders found</h3>
            <p className="text-neutral-500 mt-1">You haven't purchased any datasets with this email address.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                      order.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-medium text-neutral-400">Order #{order.id.slice(-8)}</span>
                    <span className="text-xs font-medium text-neutral-400">•</span>
                    <span className="text-xs font-medium text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-1">{order.dataset?.name || "Unknown Dataset"}</h3>
                  <div className="text-sm text-neutral-500 mb-6">Version {order.dataset?.version} • {order.dataset?.dataType}</div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 min-w-[140px]">
                      <div className="text-xs text-neutral-500 font-medium mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> License</div>
                      <div className="font-bold text-sm">{order.licenseType}</div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 min-w-[140px]">
                      <div className="text-xs text-neutral-500 font-medium mb-1">Amount Paid</div>
                      <div className="font-bold text-sm">${order.amountUsd}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-8 md:w-72 border-t md:border-t-0 md:border-l border-neutral-100 flex flex-col justify-center">
                  {order.status === "DELIVERED" ? (
                    <>
                      <Link 
                        href={`/buyer/${order.id}?email=${encodeURIComponent(email)}`}
                        className="w-full bg-[#f06135] hover:bg-[#e05024] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#f06135]/30 flex items-center justify-center gap-2 mb-3"
                      >
                        <Download className="w-4 h-4" /> Download Data
                      </Link>
                      <div className="text-xs text-center text-neutral-500 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> License active
                      </div>
                    </>
                  ) : order.status === "PENDING" ? (
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                      <div className="font-bold text-sm text-neutral-900 mb-1">Payment Pending</div>
                      <div className="text-xs text-neutral-500">We're verifying your payment. Your download link will be available here soon.</div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
