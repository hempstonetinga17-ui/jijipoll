"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { ArrowLeft, Download, ShoppingCart, CheckCircle, Database, Lock, Activity, ShieldCheck } from "lucide-react"

export default function DatasetDetail() {
  const params = useParams()
  const router = useRouter()
  const [dataset, setDataset] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [licenseType, setLicenseType] = useState("RESEARCH")
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [sampleDownloading, setSampleDownloading] = useState(false)

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const res = await fetch(`/api/datasets/${params.datasetId}`)
        if (!res.ok) {
          router.push("/datasets")
          return
        }
        const data = await res.json()
        setDataset(data.dataset)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDataset()
  }, [params.datasetId, router])

  const downloadSample = async () => {
    setSampleDownloading(true)
    try {
      const res = await fetch(`/api/datasets/${params.datasetId}/sample`)
      const data = await res.json()
      if (data.url) {
        // Trigger download
        const a = document.createElement("a")
        a.href = data.url
        a.download = `${data.name.replace(/\s+/g, '_')}_sample.zip` // or whatever format
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        alert(data.error || "Failed to download sample")
      }
    } catch (e) {
      console.error(e)
      alert("Error downloading sample")
    } finally {
      setSampleDownloading(false)
    }
  }

  const handlePurchase = async () => {
    setPurchaseLoading(true)
    // Normally we'd collect user details via a modal/form here.
    // For this implementation, we'll prompt or use mock data.
    const buyerEmail = prompt("Enter your email address for the order:")
    if (!buyerEmail) {
      setPurchaseLoading(false)
      return
    }
    const buyerName = prompt("Enter your full name:") || "Guest Buyer"

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: dataset.id,
          buyerName,
          buyerEmail,
          licenseType
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Order created! Order ID: ${data.orderId}. Please complete payment (manual step for now).`)
        router.push(`/buyer`) // Redirect to buyer portal
      } else {
        alert(data.error || "Failed to create order")
      }
    } catch (e) {
      console.error(e)
      alert("Error creating order")
    } finally {
      setPurchaseLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f06135] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!dataset) return null

  // Calculate price based on license
  const priceMultiplier = licenseType === "EXCLUSIVE" ? 7.5 : licenseType === "COMMERCIAL" ? 1.0 : 0.5
  const displayPrice = (dataset.priceUsd * priceMultiplier).toFixed(2)

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/datasets" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#f06135] to-[#f58f70] flex items-center justify-center">
              <Database className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">JijiPoll</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Dataset Card) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#f06135]/10 text-[#f06135] px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                  {dataset.dataType}
                </span>
                <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                  {dataset.format}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold tracking-wide flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> QA Certified
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">{dataset.name}</h1>
              <p className="text-lg text-neutral-500 mb-8 max-w-2xl">{dataset.description}</p>
              
              <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#f06135]">
                <ReactMarkdown>{dataset.datasetCard || "No detailed dataset card available."}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar (Purchase & Stats) */}
          <div className="lg:col-span-1 space-y-6 relative">
            <div className="sticky top-24 space-y-6">
              
              {/* License & Purchase Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl shadow-neutral-200/50">
                <h3 className="font-bold text-lg mb-4">Select License</h3>
                <div className="space-y-3 mb-6">
                  {["RESEARCH", "COMMERCIAL", "EXCLUSIVE"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setLicenseType(type)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        licenseType === type ? "border-[#f06135] bg-[#f06135]/5" : "border-neutral-100 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex shrink-0 items-center justify-center ${
                        licenseType === type ? "border-[#f06135]" : "border-neutral-300"
                      }`}>
                        {licenseType === type && <div className="w-2 h-2 rounded-full bg-[#f06135]" />}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${licenseType === type ? "text-[#f06135]" : "text-neutral-900"}`}>
                          {type.charAt(0) + type.slice(1).toLowerCase()} License
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {type === "RESEARCH" ? "Non-commercial use. Attribution required." : 
                           type === "COMMERCIAL" ? "Full commercial rights. Non-exclusive." : 
                           "12-month exclusive lock. Full rights."}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-end justify-between mb-6">
                  <div className="text-sm font-medium text-neutral-500">Total Price</div>
                  <div className="text-3xl font-black text-neutral-900">${displayPrice}</div>
                </div>

                <button 
                  onClick={handlePurchase}
                  disabled={purchaseLoading}
                  className="w-full bg-[#f06135] hover:bg-[#e05024] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#f06135]/30 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {purchaseLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <ShoppingCart className="w-5 h-5" />}
                  {purchaseLoading ? "Processing..." : "Purchase Access"}
                </button>
                <p className="text-xs text-center text-neutral-400 mt-4">Secure checkout. Access links delivered via email.</p>
              </div>

              {/* Sample Card */}
              {dataset.sampleUrl && (
                <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10 blur-xl"></div>
                  <h3 className="font-bold text-lg mb-2 relative z-10">Try Before You Buy</h3>
                  <p className="text-sm text-neutral-400 mb-6 relative z-10">Download a free 5% representative sample of this dataset to evaluate quality and formatting.</p>
                  <button 
                    onClick={downloadSample}
                    disabled={sampleDownloading}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition border border-white/10 flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
                  >
                    {sampleDownloading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Download className="w-4 h-4" />}
                    Download Free Sample
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
