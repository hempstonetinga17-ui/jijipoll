"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const CATEGORIES = [
  { id: "BUSINESS", label: "🏪 Business / Shop" },
  { id: "WATER_FEATURE", label: "🚰 Water Feature" },
  { id: "CHURCH", label: "⛪ Church / Mosque" },
  { id: "BUILDING", label: "🏢 Building" },
  { id: "OTHER", label: "📌 Other" },
]

export default function AgentCapture() {
  const router = useRouter()
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [gettingLocation, setGettingLocation] = useState(true)

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  
  const [category, setCategory] = useState("BUSINESS")
  const [contactInfo, setContactInfo] = useState("")
  const [customFeatures, setCustomFeatures] = useState("")
  
  const [status, setStatus] = useState<"idle" | "uploading" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setGettingLocation(false)
        },
        (error) => {
          console.error(error)
          setLocationError("Could not access location. Please enable location services to proceed.")
          setGettingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setLocationError("Geolocation is not supported by your browser.")
      setGettingLocation(false)
    }
  }, [])

  const openCamera = useCallback(async () => {
    setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      // attach stream after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err: any) {
      setCameraError("Could not access camera. Please allow camera permission and try again.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOpen(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      if (!blob) return
      const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })
      setFile(capturedFile)
      setPreview(URL.createObjectURL(capturedFile))
      stopCamera()
    }, "image/jpeg", 0.92)
  }, [stopCamera])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const uploadFileToR2 = async (fileToUpload: File): Promise<string> => {
    // Upload via server-side proxy to avoid CORS issues with direct R2 access
    const form = new FormData()
    form.append("file", fileToUpload)

    const res = await fetch("/api/field-agent/upload", {
      method: "POST",
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Failed to upload image")
    }

    const { publicUrl } = await res.json()
    return publicUrl
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) {
      setErrorMessage("Location is required")
      return
    }
    if (!file) {
      setErrorMessage("A photo is required")
      return
    }
    if (!contactInfo.trim()) {
      setErrorMessage("Contact info is required")
      return
    }
    if (!customFeatures.trim()) {
      setErrorMessage("Features / Notes are required")
      return
    }

    try {
      setErrorMessage("")
      setStatus("uploading")
      
      const uploadedUrl = await uploadFileToR2(file)
      
      setStatus("submitting")

      const submitRes = await fetch("/api/field-agent/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          category,
          photoUrl: uploadedUrl,
          contactInfo,
          customFeatures: { note: customFeatures }
        })
      })

      if (!submitRes.ok) {
        const errorData = await submitRes.json()
        throw new Error(errorData.error || "Submission failed")
      }

      setStatus("success")
      
    } catch (err: any) {
      console.error(err)
      setStatus("error")
      // Provide a clearer error message for network errors (like CORS, offline, or connection reset)
      if (err.message === "Failed to fetch") {
        setErrorMessage("Network error: Could not connect to the server. Please check your internet connection or server status.")
      } else {
        setErrorMessage(err.message || "Something went wrong")
      }
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your data is pending verification. You will earn <strong className="text-[#f06135]">10 KShs</strong> once approved by an admin!
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setFile(null)
                setPreview(null)
                setContactInfo("")
                setCustomFeatures("")
                setStatus("idle")
              }}
              className="w-full bg-[#f06135] text-white font-bold py-3 rounded-xl hover:bg-[#d35400] transition"
            >
              Capture Another
            </button>
            <Link 
              href="/field-agent/dashboard"
              className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/field-agent/dashboard" className="text-gray-500 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900">New Capture</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column (Photo & Geolocation) */}
          <div className="space-y-6">
          
          {/* Geolocation Section */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">📍 GPS Location <span className="text-red-500">*</span></h3>
            {gettingLocation ? (
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#f06135] rounded-full animate-spin" />
                <span className="text-sm animate-pulse">Acquiring satellite lock...</span>
              </div>
            ) : locationError ? (
              <p className="text-sm text-red-500 font-medium">{locationError}</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-600 font-bold">Location locked ✓</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Latitude</p>
                    <p className="text-sm font-bold text-gray-900 font-mono">{location?.lat.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Longitude</p>
                    <p className="text-sm font-bold text-gray-900 font-mono">{location?.lng.toFixed(6)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">These coordinates will be recorded with your submission.</p>
              </div>
            )}
          </div>

          {/* Photo Section — camera capture only, no file upload */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">📸 Photo <span className="text-red-500">*</span></h3>

            {/* Live camera viewfinder */}
            {cameraOpen && (
              <div className="relative rounded-xl overflow-hidden bg-black mb-3" style={{ aspectRatio: "16/9" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Crosshair overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-white/60 rounded-lg" />
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/30 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-white text-[#f06135] px-8 py-2.5 rounded-full font-black text-sm shadow-xl hover:bg-gray-100 active:scale-95 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="4" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Capture
                  </button>
                </div>
              </div>
            )}

            {/* Captured preview */}
            {!cameraOpen && preview && (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ aspectRatio: "16/9" }}>
                <img src={preview} alt="Captured" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-red-600 active:scale-95 transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4l16 16M4 20L20 4" />
                  </svg>
                  Retake
                </button>
              </div>
            )}

            {/* Open camera button */}
            {!cameraOpen && !preview && (
              <button
                type="button"
                onClick={openCamera}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#f06135] hover:text-[#f06135] transition"
                style={{ aspectRatio: "16/9" }}
              >
                <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold text-sm">Open Camera</span>
                <span className="text-xs mt-1 opacity-60">Camera capture only — no uploads</span>
              </button>
            )}

            {cameraError && (
              <p className="mt-2 text-sm text-red-500 font-medium">{cameraError}</p>
            )}

            {/* Hidden canvas for snapshot */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          </div>

          {/* Right Column (Details) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block font-bold text-gray-900 mb-2">Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-3 rounded-lg text-sm font-medium border text-left transition ${
                      category === cat.id 
                        ? 'border-[#f06135] bg-[#f06135]/5 text-[#f06135] ring-1 ring-[#f06135]' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-900 mb-1">Contact Info <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="Phone number, email, or name"
                className="w-full px-4 py-3 bg-white text-gray-900 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f06135]/50 focus:border-[#f06135] transition shadow-sm placeholder:text-gray-400"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-900 mb-1">Features / Notes <span className="text-red-500">*</span></label>
              <textarea
                required
                placeholder="e.g. They use Point of Sale XYZ"
                className="w-full px-4 py-3 bg-white text-gray-900 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f06135]/50 focus:border-[#f06135] transition resize-none h-24 shadow-sm placeholder:text-gray-400"
                value={customFeatures}
                onChange={e => setCustomFeatures(e.target.value)}
              />
            </div>
          </div>
          </div>
          
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "uploading" || status === "submitting"}
            className={`w-full py-4 rounded-xl font-black text-lg transition shadow-xl flex justify-center items-center gap-2 sticky bottom-6 ${
              status === "uploading" || status === "submitting"
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#f06135] text-white hover:bg-[#d35400] active:scale-[0.98]'
            }`}
          >
            {status === "uploading" ? "Uploading Photo..." : 
             status === "submitting" ? "Saving..." : 
             "Submit Data"}
          </button>
        </form>
      </main>
    </div>
  )
}
