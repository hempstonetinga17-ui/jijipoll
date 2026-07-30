"use client"
import { useState, useEffect, useRef } from "react"
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
  
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

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
          customFeatures: customFeatures ? JSON.stringify({ note: customFeatures }) : undefined
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
      setErrorMessage(err.message || "Something went wrong")
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

      <main className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Geolocation Section */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${location ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Geolocation</h3>
                {gettingLocation ? (
                  <p className="text-sm text-gray-500 animate-pulse">Acquiring satellite lock...</p>
                ) : locationError ? (
                  <p className="text-sm text-red-500 font-medium">{locationError}</p>
                ) : (
                  <p className="text-sm text-green-600 font-medium tracking-tight">
                    {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Photo (Required)</h3>
            
            {preview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                <img src={preview} alt="Capture" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 active:scale-95 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#f06135] transition hover:text-[#f06135]"
              >
                <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Tap to take or upload a photo</span>
              </button>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*" 
              capture="environment" // Suggests native camera on mobile
              className="hidden" 
            />
          </div>

          {/* Details Section */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block font-bold text-gray-900 mb-2">Category</label>
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
              <label className="block font-bold text-gray-900 mb-1">Contact Info (Optional)</label>
              <input
                type="text"
                placeholder="Phone number, email, or name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f06135]/50 focus:border-[#f06135] transition"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-900 mb-1">Features / Notes (Optional)</label>
              <textarea
                placeholder="e.g. They use Point of Sale XYZ"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f06135]/50 focus:border-[#f06135] transition resize-none h-24"
                value={customFeatures}
                onChange={e => setCustomFeatures(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={!location || !file || status === "uploading" || status === "submitting"}
            className={`w-full py-4 rounded-xl font-black text-lg transition shadow-xl flex justify-center items-center gap-2 sticky bottom-6 ${
              !location || !file
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
