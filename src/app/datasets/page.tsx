"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Database, Filter, Search, ChevronRight, Activity, Download, FileText, Image as ImageIcon, Headphones, Tag } from "lucide-react"

export default function DatasetsCatalog() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("")
  
  useEffect(() => {
    fetchDatasets()
  }, [typeFilter])
  
  const fetchDatasets = async () => {
    setLoading(true)
    try {
      const url = new URL("/api/datasets", window.location.origin)
      if (typeFilter) url.searchParams.set("type", typeFilter)
      const res = await fetch(url.toString())
      const data = await res.json()
      setDatasets(data.datasets || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "AUDIO": return <Headphones className="w-5 h-5 text-blue-500" />
      case "PHOTO": return <ImageIcon className="w-5 h-5 text-emerald-500" />
      case "TEXT": return <FileText className="w-5 h-5 text-amber-500" />
      default: return <Database className="w-5 h-5 text-purple-500" />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f06135] to-[#f58f70] flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-neutral-900">JijiPoll<span className="text-[#f06135]">Data</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-neutral-600">
            <Link href="/" className="hover:text-neutral-900 transition">Platform</Link>
            <Link href="/datasets" className="text-[#f06135]">Datasets</Link>
            <Link href="/buyer" className="hover:text-neutral-900 transition">My Purchases</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-neutral-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-neutral-900 to-neutral-900"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            High-Quality AI Training Data<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f06135] to-[#f58f70]">From the Ground Up</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            Curated, QA-certified datasets collected by our network of field agents across East Africa. Perfect for training robust, inclusive AI models.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setTypeFilter("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${typeFilter === "" ? "bg-neutral-200 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  All Types
                </button>
                <button 
                  onClick={() => setTypeFilter("AUDIO")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${typeFilter === "AUDIO" ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  Audio / Speech
                </button>
                <button 
                  onClick={() => setTypeFilter("PHOTO")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${typeFilter === "PHOTO" ? "bg-emerald-50 text-emerald-700" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  Photos / Vision
                </button>
                <button 
                  onClick={() => setTypeFilter("TEXT")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${typeFilter === "TEXT" ? "bg-amber-50 text-amber-700" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  Text / NLP
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Available Datasets</h2>
              <div className="text-sm text-neutral-500 font-medium">Showing {datasets.length} results</div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-80 border border-neutral-100 shadow-sm animate-pulse"></div>
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 border-dashed p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No datasets found</h3>
                <p className="text-neutral-500 mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {datasets.map(d => (
                  <Link href={`/datasets/${d.id}`} key={d.id} className="group flex flex-col bg-white rounded-3xl border border-neutral-200 shadow-sm hover:shadow-xl hover:border-[#f06135]/30 transition-all duration-300 overflow-hidden">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {getTypeIcon(d.dataType)}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
                            v{d.version}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                            d.qualityTier === "A" ? "bg-green-100 text-green-700" :
                            d.qualityTier === "B" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-700"
                          }`}>
                            Tier {d.qualityTier}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-neutral-900 mb-2 leading-tight group-hover:text-[#f06135] transition-colors line-clamp-2">
                        {d.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-6 line-clamp-2">
                        {d.description || "High-quality dataset collected by JijiPoll."}
                      </p>
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Activity className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span className="font-medium">{d.itemCount.toLocaleString()} items</span>
                          {d.totalDurationSecs && (
                            <span className="text-neutral-400">({Math.round(d.totalDurationSecs/3600*10)/10}h)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span className="font-medium truncate">{d.languages.join(", ") || "Global"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-4 border-t border-neutral-100 flex items-center justify-between mt-auto">
                      <div className="font-black text-lg text-neutral-900">
                        ${d.priceUsd} <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Base</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#f06135] font-bold text-sm">
                        View details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
