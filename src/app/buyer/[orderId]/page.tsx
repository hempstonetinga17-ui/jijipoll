"use client"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, ShieldCheck, FileKey, AlertTriangle, Key } from "lucide-react"

export default function OrderDownload() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const email = searchParams.get("email")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadInfo, setDownloadInfo] = useState<any>(null)

  useEffect(() => {
    if (!email) {
      router.push("/buyer")
      return
    }
    // We don't auto-fetch, user must click to generate the fresh URL.
  }, [email, router])

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${params.orderId}/download?email=${encodeURIComponent(email || "")}`)
      const data = await res.json()
      
      if (res.ok) {
        setDownloadInfo(data)
        // Trigger download
        const a = document.createElement("a")
        a.href = data.downloadUrl
        a.download = `${data.datasetName.replace(/\s+/g, '_')}_v${data.version}.zip` // Just a fallback if R2 doesn't force
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        setError(data.error || "Failed to generate download link")
      }
    } catch (e) {
      console.error(e)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!email) return null

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-20">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/buyer" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to My Datasets
          </Link>
          <div className="flex items-center gap-2 font-medium text-sm text-neutral-500">
            Order #{String(params.orderId).slice(-8)}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 md:p-12">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-black text-center mb-2">Ready for Download</h1>
          <p className="text-neutral-500 text-center mb-10 max-w-md mx-auto">
            Your license has been verified. The download link generated below will expire in 72 hours for security.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 font-medium">{error}</div>
            </div>
          )}

          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="text-sm font-bold text-neutral-500">Authorized Email</div>
              <div className="text-sm font-medium">{email}</div>
            </div>
            {downloadInfo?.licenseHash && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-bold text-neutral-500 flex items-center gap-1"><Key className="w-3 h-3"/> License Hash</div>
                <div className="text-xs font-mono bg-neutral-200 px-2 py-1 rounded text-neutral-700 max-w-[200px] truncate" title={downloadInfo.licenseHash}>
                  {downloadInfo.licenseHash}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-[#f06135] hover:bg-[#e05024] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#f06135]/30 flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Download className="w-6 h-6" />}
            {loading ? "Generating Secure Link..." : "Download Dataset"}
          </button>
          
          <p className="text-xs text-center text-neutral-400 mt-6 flex items-center justify-center gap-1">
            <FileKey className="w-3 h-3" /> Downloads are logged for license compliance.
          </p>
        </div>
      </div>
    </div>
  )
}
