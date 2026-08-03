"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Mic, FileText, Video, Brain, Camera, MapPin, 
  ChevronLeft, Sparkles, Star, Trash2, 
  CheckCircle2, Play, Pause, Square, RefreshCw, MessageSquare
} from "lucide-react"

const CATEGORIES = [
  { id: "BUSINESS", label: "🏪 Business / Shop" },
  { id: "WATER_FEATURE", label: "🚰 Water Feature" },
  { id: "CHURCH", label: "⛪ Church / Mosque" },
  { id: "BUILDING", label: "🏢 Building" },
  { id: "OTHER", label: "📌 Other" },
]

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
}

interface CollectionTask {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  rewardPerItem: number;
  prompts: string[];
  language?: Language;
}

export default function AgentCapture() {
  const router = useRouter()
  
  // Selection state
  const [selectedTaskType, setSelectedTaskType] = useState<"AUDIO" | "TEXT" | "VIDEO" | "EVAL" | "PHOTO" | null>(null)
  const [tasks, setTasks] = useState<CollectionTask[]>([])
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])

  // Location state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [gettingLocation, setGettingLocation] = useState(true)

  // Status and feedback
  const [status, setStatus] = useState<"idle" | "uploading" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // --- Photo State (Geo Photo) ---
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoCategory, setPhotoCategory] = useState("BUSINESS")
  const [photoContactInfo, setPhotoContactInfo] = useState("")
  const [photoNotes, setPhotoNotes] = useState("")

  // --- Audio State (Voice Recording) ---
  const [languageId, setLanguageId] = useState("")
  const [dialect, setDialect] = useState("")
  const [environment, setEnvironment] = useState("INDOOR")
  const [promptIdx, setPromptIdx] = useState(0)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  // --- Text State (Text & Translation) ---
  const [textType, setTextType] = useState("CORPUS")
  const [sourceLanguage, setSourceLanguage] = useState("")
  const [sourceText, setSourceText] = useState("")
  const [submittedText, setSubmittedText] = useState("")
  const [textDomain, setTextDomain] = useState("")

  // --- Video State (Video Vision) ---
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [activityLabel, setActivityLabel] = useState("")
  const [sceneType, setSceneType] = useState("INDOOR")
  const [isEgocentric, setIsEgocentric] = useState(false)
  const [objectLabelsInput, setObjectLabelsInput] = useState("")

  // --- Eval State (AI Evaluation) ---
  const [evalModelName, setEvalModelName] = useState("")
  const [evalPromptText, setEvalPromptText] = useState("")
  const [evalResponseText, setEvalResponseText] = useState("")
  const [evalOverallRating, setEvalOverallRating] = useState(5)
  const [evalRaterNotes, setEvalRaterNotes] = useState("")

  // Fetch languages
  useEffect(() => {
    fetch("/api/languages")
      .then(res => res.json())
      .then(data => {
        setLanguages(data)
        if (data.length > 0) setLanguageId(data[0].id)
      })
      .catch(err => console.error("Error fetching languages", err))
  }, [])

  // Geolocation
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
          setLocationError("Could not access location. Please enable location services.")
          setGettingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setLocationError("Geolocation is not supported by your browser.")
      setGettingLocation(false)
    }
  }, [])

  // Fetch tasks when selected task type changes
  useEffect(() => {
    if (!selectedTaskType) return
    setLoadingTasks(true)
    setSelectedTask(null)
    setTasks([])
    fetch(`/api/tasks?taskType=${selectedTaskType}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data)
        if (data.length > 0) {
          setSelectedTask(data[0])
        }
        setLoadingTasks(false)
      })
      .catch(err => {
        console.error("Error fetching tasks", err)
        setLoadingTasks(false)
      })
  }, [selectedTaskType])

  // Clean stream on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  // File Upload Helper
  const uploadFileToR2 = async (fileToUpload: File): Promise<string> => {
    const form = new FormData()
    form.append("file", fileToUpload)

    const res = await fetch("/api/field-agent/upload", {
      method: "POST",
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Failed to upload file")
    }

    const { publicUrl } = await res.json()
    return publicUrl
  }

  // --- Photo Capture Methods ---
  const openCamera = useCallback(async () => {
    setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
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
      setPhotoFile(capturedFile)
      setPhotoPreview(URL.createObjectURL(capturedFile))
      stopCamera()
    }, "image/jpeg", 0.92)
  }, [stopCamera])

  // --- Audio Recording Methods ---
  const startRecordingAudio = async () => {
    audioChunksRef.current = []
    setAudioUrl(null)
    setAudioBlob(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecordingAudio(true)
    } catch (err) {
      alert("Microphone access is required for audio recording.")
    }
  }

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop()
      setIsRecordingAudio(false)
    }
  }

  const togglePlaybackAudio = () => {
    if (!audioUrl) return
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl)
      audioPlayerRef.current.onended = () => setAudioPlaying(false)
    }
    if (audioPlaying) {
      audioPlayerRef.current.pause()
      setAudioPlaying(false)
    } else {
      audioPlayerRef.current.play()
      setAudioPlaying(true)
    }
  }

  // --- Submit handler for all forms ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      if (selectedTaskType === "PHOTO") {
        if (!location) throw new Error("Location is required")
        if (!photoFile) throw new Error("A photo is required")
        if (!photoContactInfo.trim()) throw new Error("Contact info is required")
        if (!photoNotes.trim()) throw new Error("Notes/Features are required")

        setStatus("uploading")
        const uploadedUrl = await uploadFileToR2(photoFile)
        setStatus("submitting")

        const submitRes = await fetch("/api/field-agent/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: location.lat,
            longitude: location.lng,
            category: photoCategory,
            photoUrl: uploadedUrl,
            contactInfo: photoContactInfo,
            customFeatures: { note: photoNotes }
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      }

      else if (selectedTaskType === "AUDIO") {
        if (!audioBlob) throw new Error("Please record speech before submitting.")
        setStatus("uploading")
        
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        const uploadedUrl = await uploadFileToR2(audioFile)
        setStatus("submitting")

        const submitRes = await fetch("/api/submissions/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null,
            languageId: languageId || null,
            dialect: dialect || null,
            audioUrl: uploadedUrl,
            durationSecs: audioPlayerRef.current ? Math.round(audioPlayerRef.current.duration || 5) : 5,
            scriptPrompt: selectedTask?.prompts[promptIdx] || "Speech sample",
            isScripted: true,
            audioType: "MONOLOGUE",
            environment,
            latitude: location?.lat || null,
            longitude: location?.lng || null,
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      }

      else if (selectedTaskType === "TEXT") {
        if (!submittedText.trim()) throw new Error("Please enter some text to submit.")
        setStatus("submitting")

        const submitRes = await fetch("/api/submissions/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null,
            languageId: languageId || null,
            sourceLanguage: sourceLanguage || null,
            textType,
            domain: textDomain || selectedTask?.description || "CORPUS",
            sourceText: sourceText || null,
            submittedText,
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      }

      else if (selectedTaskType === "VIDEO") {
        if (!videoFile) throw new Error("Please choose or record a video first.")
        setStatus("uploading")
        const uploadedUrl = await uploadFileToR2(videoFile)
        setStatus("submitting")

        const submitRes = await fetch("/api/submissions/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null,
            videoUrl: uploadedUrl,
            durationSecs: 10,
            activityLabel: activityLabel || "Video capture",
            sceneType,
            isEgocentric,
            objectLabels: objectLabelsInput.split(",").map(lbl => lbl.trim()).filter(Boolean),
            latitude: location?.lat || null,
            longitude: location?.lng || null,
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      }

      else if (selectedTaskType === "EVAL") {
        if (!evalPromptText.trim() || !evalResponseText.trim()) throw new Error("Prompt and Response text are required.")
        setStatus("submitting")

        const submitRes = await fetch("/api/submissions/eval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null,
            modelName: evalModelName || "AI Assistant",
            promptText: evalPromptText,
            responseText: evalResponseText,
            overallRating: evalOverallRating,
            raterNotes: evalRaterNotes,
            domain: selectedTask?.description || "RLHF",
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      }

      setStatus("success")
    } catch (err: any) {
      console.error(err)
      setStatus("error")
      setErrorMessage(err.message || "Something went wrong")
    }
  }

  // Reset function after success
  const handleReset = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoContactInfo("")
    setPhotoNotes("")
    setAudioBlob(null)
    setAudioUrl(null)
    setSubmittedText("")
    setSourceText("")
    setVideoFile(null)
    setVideoPreview(null)
    setEvalPromptText("")
    setEvalResponseText("")
    setEvalRaterNotes("")
    setStatus("idle")
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your data has been successfully uploaded. You will earn your reward as soon as it gets approved!
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleReset}
              className="w-full bg-[#1b7348] text-white font-bold py-3 rounded-xl hover:bg-[#145635] transition"
            >
              Collect More Data
            </button>
            <Link 
              href="/field-agent/dashboard"
              className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition text-center block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7fbf9] pb-24 text-gray-800 relative flex flex-col justify-between">
      
      {/* Floating WhatsApp Support Button */}
      <a 
        href="https://wa.me/254700000000" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition z-50 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">WhatsApp Support</span>
      </a>

      {/* Karya-style Header */}
      <header className="bg-[#1b7348] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (selectedTaskType) setSelectedTaskType(null)
              else router.push("/field-agent/dashboard")
            }} 
            className="text-white hover:bg-emerald-800 transition p-1.5 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              {selectedTaskType ? `${selectedTaskType.charAt(0) + selectedTaskType.slice(1).toLowerCase()} Task` : "Data Collection"}
              <span className="bg-[#f06135] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1">Main</span>
            </h1>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-700 border-2 border-white/50 flex items-center justify-center font-bold text-sm shadow-inner">
          👤
        </div>
      </header>

      {/* Progress & Submit Tracker Banner */}
      {selectedTaskType && (
        <div className="bg-[#0f172a] text-white px-5 py-3 flex items-center justify-between border-b border-gray-800 shadow-sm">
          <div className="flex-1 max-w-xs mr-4">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
              <span>Task Progress</span>
              <span>{selectedTask ? "1 / 1" : "0 / 1"}</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#1b7348] h-full transition-all duration-300"
                style={{ width: selectedTask ? "100%" : "30%" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSubmit as any}
              disabled={status === "uploading" || status === "submitting" || gettingLocation}
              className="bg-[#1b7348] hover:bg-emerald-800 text-white font-bold text-xs px-4 py-1.5 rounded-md transition shadow-md active:scale-95 disabled:opacity-60"
            >
              Submit
            </button>
            <button className="text-gray-400 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="max-w-3xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-between">
        
        {/* Step 1: Select Task Type */}
        {!selectedTaskType && (
          <div className="space-y-8 max-w-2xl mx-auto w-full my-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Complete Simple Tasks and Earn Money</h2>
              <p className="text-gray-500 mt-2">Select a task type to begin collecting high-quality AI training data and earn KShs rewards.</p>
            </div>

            <div className="flex flex-col gap-4">
              
              {/* Voice Recording */}
              <button 
                onClick={() => setSelectedTaskType("AUDIO")}
                className="w-full bg-white border border-gray-150/70 hover:border-purple-300 hover:shadow-md p-4 sm:p-5 rounded-2xl flex items-center gap-5 text-left transition active:scale-[0.99] group shadow-sm"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-50 text-purple-600 shrink-0 flex items-center justify-center transition group-hover:scale-105 border border-purple-100">
                  <Mic className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-950 text-base sm:text-lg group-hover:text-purple-600 transition">Record speech &amp; sentences</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Submit speech recordings in Swahili, Kikuyu, Luo, Sheng, etc.</p>
                </div>
                <span className="text-gray-300 group-hover:text-purple-500 transition text-2xl font-bold font-mono px-2">›</span>
              </button>

              {/* Text & Translation */}
              <button 
                onClick={() => setSelectedTaskType("TEXT")}
                className="w-full bg-white border border-gray-150/70 hover:border-cyan-300 hover:shadow-md p-4 sm:p-5 rounded-2xl flex items-center gap-5 text-left transition active:scale-[0.99] group shadow-sm"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-50 text-cyan-600 shrink-0 flex items-center justify-center transition group-hover:scale-105 border border-cyan-100">
                  <FileText className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-950 text-base sm:text-lg group-hover:text-cyan-600 transition">Type out sentences describing images &amp; recordings</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Translate phrases, write local corpuses, or submit conversational data.</p>
                </div>
                <span className="text-gray-300 group-hover:text-cyan-500 transition text-2xl font-bold font-mono px-2">›</span>
              </button>

              {/* Video Vision */}
              <button 
                onClick={() => setSelectedTaskType("VIDEO")}
                className="w-full bg-white border border-gray-150/70 hover:border-rose-300 hover:shadow-md p-4 sm:p-5 rounded-2xl flex items-center gap-5 text-left transition active:scale-[0.99] group shadow-sm"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-50 text-rose-600 shrink-0 flex items-center justify-center transition group-hover:scale-105 border border-rose-100">
                  <Video className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-950 text-base sm:text-lg group-hover:text-rose-600 transition">Record activities, events, &amp; objects</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Record activities, events, objects, or environmental landmarks.</p>
                </div>
                <span className="text-gray-300 group-hover:text-rose-500 transition text-2xl font-bold font-mono px-2">›</span>
              </button>

              {/* AI Evaluation */}
              <button 
                onClick={() => setSelectedTaskType("EVAL")}
                className="w-full bg-white border border-gray-150/70 hover:border-yellow-300 hover:shadow-md p-4 sm:p-5 rounded-2xl flex items-center gap-5 text-left transition active:scale-[0.99] group shadow-sm"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-50 text-yellow-600 shrink-0 flex items-center justify-center transition group-hover:scale-105 border border-yellow-100">
                  <Brain className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-950 text-base sm:text-lg group-hover:text-yellow-600 transition">Rate &amp; evaluate AI responses</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Provide RLHF training data by rating and evaluating AI outputs.</p>
                </div>
                <span className="text-gray-300 group-hover:text-yellow-500 transition text-2xl font-bold font-mono px-2">›</span>
              </button>

              {/* Geo Photo */}
              <button 
                onClick={() => setSelectedTaskType("PHOTO")}
                className="w-full bg-white border border-gray-150/70 hover:border-emerald-300 hover:shadow-md p-4 sm:p-5 rounded-2xl flex items-center gap-5 text-left transition active:scale-[0.99] group shadow-sm"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 shrink-0 flex items-center justify-center transition group-hover:scale-105 border border-emerald-100">
                  <Camera className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-950 text-base sm:text-lg group-hover:text-emerald-600 transition">Outline &amp; mark objects or capture storefronts</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Take geotagged photos of physical shops, water pumps, or mosques.</p>
                </div>
                <span className="text-gray-300 group-hover:text-emerald-500 transition text-2xl font-bold font-mono px-2">›</span>
              </button>

            </div>
          </div>
        )}

        {/* Step 2: Show Task and Form */}
        {selectedTaskType && (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* GPS Status */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-150 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#1b7348]" />
                  <div>
                    <h4 className="font-bold text-gray-900">GPS Geolocation</h4>
                    {gettingLocation ? (
                      <p className="text-gray-500 animate-pulse">Acquiring coordinates...</p>
                    ) : locationError ? (
                      <p className="text-red-500 font-semibold">{locationError}</p>
                    ) : (
                      <p className="text-green-600 font-bold">Location Locked ({location?.lat.toFixed(5)}, {location?.lng.toFixed(5)})</p>
                    )}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setGettingLocation(true)
                    navigator.geolocation.getCurrentPosition(
                      (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setGettingLocation(false) },
                      (e) => { setLocationError("Access denied"); setGettingLocation(false) }
                    )
                  }}
                  className="text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition"
                >
                  Refresh
                </button>
              </div>

              {/* Chat Bubble Welcome Message */}
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-emerald-800/10 shadow-sm max-w-xl text-sm font-medium leading-relaxed text-gray-800 relative">
                  <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[8px] border-t-white border-r-[8px] border-r-transparent border-l-[8px] border-l-transparent" />
                  <p>👋 Hello Agent! Welcome to the {selectedTaskType} collection workspace.</p>
                  <p className="mt-2 text-xs text-gray-500">Please choose a task below and fulfill the guidelines precisely to ensure approval.</p>
                </div>

                {selectedTaskType !== "PHOTO" && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 space-y-3">
                    <label className="block text-sm font-bold text-gray-900">Select Collection Task</label>
                    {loadingTasks ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#1b7348]" />
                        <span>Loading active tasks...</span>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 font-medium">
                        No active target tasks for this type. Submit a general data entry below.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <select
                          className="w-full px-4 py-3 border border-gray-350 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b7348]/50 focus:border-[#1b7348]"
                          value={selectedTask?.id || ""}
                          onChange={(e) => {
                            const t = tasks.find(x => x.id === e.target.value)
                            setSelectedTask(t || null)
                            setPromptIdx(0)
                          }}
                        >
                          {tasks.map(t => (
                            <option key={t.id} value={t.id}>{t.title} ({t.rewardPerItem} KSh)</option>
                          ))}
                        </select>
                        {selectedTask && (
                          <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 space-y-1">
                            <span className="text-xs font-bold text-[#1b7348] uppercase tracking-wider">Active Task Details</span>
                            <p className="text-sm font-extrabold text-gray-900">{selectedTask.title}</p>
                            {selectedTask.description && <p className="text-xs text-gray-600">{selectedTask.description}</p>}
                            <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#1b7348]">
                              <span>Est. Reward</span>
                              <span>{selectedTask.rewardPerItem} KSh per item</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Submission Forms */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* VOICE RECORDING FORM */}
                {selectedTaskType === "AUDIO" && (
                  <div className="space-y-6">
                    
                    {/* Prompt Box in bubble style */}
                    <div className="p-5 bg-purple-50 text-center rounded-2xl rounded-tl-none border border-purple-100 space-y-3 max-w-xl">
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Read the following script out loud</span>
                      <p className="text-xl font-bold text-gray-950">
                        {selectedTask?.prompts && selectedTask.prompts.length > 0 
                          ? selectedTask.prompts[promptIdx]
                          : "Sema jina lako na mahali unapoishi."}
                      </p>
                      {selectedTask?.prompts && selectedTask.prompts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPromptIdx((idx) => (idx + 1) % selectedTask.prompts.length)}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 underline mt-1 block mx-auto"
                        >
                          Next Script Prompt →
                        </button>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 font-bold block mb-1">Language</span>
                          <select
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:outline-none"
                            value={languageId}
                            onChange={e => setLanguageId(e.target.value)}
                          >
                            {languages.map(lang => (
                              <option key={lang.id} value={lang.id}>{lang.name} ({lang.nativeName || lang.code})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 font-bold block mb-1">Dialect / Accent</span>
                          <input
                            type="text"
                            placeholder="Standard or Sheng"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none"
                            value={dialect}
                            onChange={e => setDialect(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">Environment</span>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:outline-none"
                          value={environment}
                          onChange={e => setEnvironment(e.target.value)}
                        >
                          <option value="INDOOR">INDOOR</option>
                          <option value="OUTDOOR">OUTDOOR</option>
                          <option value="NOISY">NOISY</option>
                          <option value="QUIET">QUIET</option>
                        </select>
                      </div>
                    </div>

                    {/* Audio Recorder Controls */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
                      {isRecordingAudio ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse shadow-lg">
                            <Square className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold text-red-500 animate-pulse">Recording Speech...</span>
                          <button
                            type="button"
                            onClick={stopRecordingAudio}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2 rounded-xl text-sm transition"
                          >
                            Stop &amp; Review
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-3">
                          {!audioUrl ? (
                            <>
                              <button
                                type="button"
                                onClick={startRecordingAudio}
                                className="w-16 h-16 bg-[#1b7348] text-white rounded-full flex items-center justify-center hover:bg-emerald-800 active:scale-95 shadow-lg transition"
                              >
                                <Mic className="w-8 h-8" />
                              </button>
                              <span className="text-sm font-bold text-gray-700">Click to Start Recording</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-4 w-full justify-center">
                              <button
                                type="button"
                                onClick={togglePlaybackAudio}
                                className="bg-[#1b7348]/10 hover:bg-[#1b7348]/20 text-[#1b7348] p-3 rounded-full transition flex items-center gap-1 font-bold text-sm"
                              >
                                {audioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                <span>{audioPlaying ? "Pause" : "Play Recording"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setAudioUrl(null); setAudioBlob(null); }}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-full transition flex items-center gap-1 font-bold text-sm"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span>Retake</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TEXT & TRANSLATION FORM */}
                {selectedTaskType === "TEXT" && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">Target Language</span>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:outline-none"
                          value={languageId}
                          onChange={e => setLanguageId(e.target.value)}
                        >
                          {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">Text Entry Type</span>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:outline-none"
                          value={textType}
                          onChange={e => {
                            setTextType(e.target.value)
                            if (e.target.value !== "TRANSLATION") {
                              setSourceLanguage("")
                              setSourceText("")
                            }
                          }}
                        >
                          <option value="CORPUS">📖 Local Corpus Text</option>
                          <option value="TRANSLATION">🔤 Translation Entry</option>
                          <option value="RLHF_PROMPT">🤖 RLHF Prompt Input</option>
                          <option value="TRANSCRIPTION">✍️ Audio Transcription</option>
                        </select>
                      </div>
                    </div>

                    {textType === "TRANSLATION" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <span className="text-xs text-gray-500 font-bold block mb-1">Source Language</span>
                          <input 
                            type="text"
                            className="w-full px-4 py-2 border border-gray-350 rounded-lg text-sm focus:outline-none"
                            placeholder="English"
                            value={sourceLanguage}
                            onChange={e => setSourceLanguage(e.target.value)}
                          />
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 font-bold block mb-1">Source Text to Translate</span>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none h-16"
                            placeholder="Enter phrase to be translated"
                            value={sourceText}
                            onChange={e => setSourceText(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Domain (optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                        placeholder="e.g. Health, Agriculture, Finance"
                        value={textDomain}
                        onChange={e => setTextDomain(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Submitted Text Entry <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        placeholder="Type or paste the collected text here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none h-36 focus:ring-2 focus:ring-[#1b7348]/50 focus:border-[#1b7348]"
                        value={submittedText}
                        onChange={e => setSubmittedText(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* VIDEO VISION FORM */}
                {selectedTaskType === "VIDEO" && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Upload Video File <span className="text-red-500">*</span></label>
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50/50 cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="video/*" 
                          required={!videoFile}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setVideoFile(file)
                              setVideoPreview(URL.createObjectURL(file))
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Video className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-sm font-bold text-gray-700">Choose Video file</span>
                      </div>

                      {videoPreview && (
                        <div className="mt-4 rounded-xl overflow-hidden max-w-sm mx-auto shadow-sm border border-gray-200">
                          <video src={videoPreview} controls className="w-full" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">Activity Label / Description</span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Shopping, farming"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                          value={activityLabel}
                          onChange={e => setActivityLabel(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">Scene Type</span>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:outline-none"
                          value={sceneType}
                          onChange={e => setSceneType(e.target.value)}
                        >
                          <option value="INDOOR">🏠 Indoor</option>
                          <option value="OUTDOOR">🌳 Outdoor</option>
                          <option value="STREET">🛣️ Street/Road</option>
                          <option value="OFFICE">🏢 Office/Retail</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <input 
                        type="checkbox" 
                        id="isEgocentric"
                        checked={isEgocentric}
                        onChange={e => setIsEgocentric(e.target.checked)}
                        className="w-4 h-4 text-[#1b7348] focus:ring-[#1b7348] border-gray-300 rounded"
                      />
                      <label htmlFor="isEgocentric" className="text-sm font-bold text-gray-900 select-none">
                        Is Egocentric (First-person perspective)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Object Labels (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. phone, desk, tree"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                        value={objectLabelsInput}
                        onChange={e => setObjectLabelsInput(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* AI EVALUATION FORM */}
                {selectedTaskType === "EVAL" && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">AI Model Name</span>
                        <input
                          type="text"
                          placeholder="e.g. Gemini 1.5 Pro"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                          value={evalModelName}
                          onChange={e => setEvalModelName(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">Overall Response Quality Rating</span>
                        <div className="flex items-center gap-2 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEvalOverallRating(star)}
                              className="p-1 text-yellow-400 hover:scale-110 transition"
                            >
                              <Star className={`w-7 h-7 ${star <= evalOverallRating ? "fill-yellow-400" : "text-gray-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Model Prompt Text <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        placeholder="Enter the prompt that was sent to the model..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none h-24 focus:ring-2 focus:ring-[#1b7348]/50"
                        value={evalPromptText}
                        onChange={e => setEvalPromptText(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Model Output Response <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        placeholder="Paste the model's response text here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none h-32 focus:ring-2 focus:ring-[#1b7348]/50"
                        value={evalResponseText}
                        onChange={e => setEvalResponseText(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Rater Notes / Assessment Reasons</label>
                      <textarea
                        placeholder="Explain why you rated this response. Highlight accuracy, safety, formatting, etc."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none h-20"
                        value={evalRaterNotes}
                        onChange={e => setEvalRaterNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* GEO PHOTO FORM */}
                {selectedTaskType === "PHOTO" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Left Column */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150">
                      <h3 className="font-bold text-gray-900 mb-3">📸 Photo <span className="text-red-500">*</span></h3>
                      
                      {cameraOpen && (
                        <div className="relative rounded-xl overflow-hidden bg-black mb-3" style={{ aspectRatio: "16/9" }}>
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
                              className="bg-white text-[#1b7348] px-8 py-2.5 rounded-full font-black text-sm shadow-xl hover:bg-gray-100 active:scale-95 transition flex items-center gap-2"
                            >
                              <Camera className="w-5 h-5" />
                              Capture
                            </button>
                          </div>
                        </div>
                      )}

                      {!cameraOpen && photoPreview && (
                        <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ aspectRatio: "16/9" }}>
                          <img src={photoPreview} alt="Captured" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-red-600 active:scale-95 transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Retake
                          </button>
                        </div>
                      )}

                      {!cameraOpen && !photoPreview && (
                        <button
                          type="button"
                          onClick={openCamera}
                          className="w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#1b7348] hover:text-[#1b7348] transition"
                          style={{ aspectRatio: "16/9" }}
                        >
                          <Camera className="w-12 h-12 mb-2" />
                          <span className="font-bold text-sm">Open Camera</span>
                        </button>
                      )}

                      {cameraError && <p className="mt-2 text-sm text-red-500 font-medium">{cameraError}</p>}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Right Column */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 space-y-4">
                      <div>
                        <label className="block font-bold text-gray-900 mb-2">Category <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setPhotoCategory(cat.id)}
                              className={`px-3 py-3 rounded-lg text-sm font-medium border text-left transition ${
                                photoCategory === cat.id 
                                  ? 'border-[#1b7348] bg-emerald-50/40 text-[#1b7348] ring-1 ring-[#1b7348]' 
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
                          className="w-full px-4 py-3 bg-white text-gray-900 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b7348]/50 focus:border-[#1b7348] transition shadow-sm placeholder:text-gray-400"
                          value={photoContactInfo}
                          onChange={e => setPhotoContactInfo(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-900 mb-1">Features / Notes <span className="text-red-500">*</span></label>
                        <textarea
                          required
                          placeholder="e.g. They use Point of Sale XYZ"
                          className="w-full px-4 py-3 bg-white text-gray-900 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b7348]/50 focus:border-[#1b7348] transition resize-none h-24 shadow-sm placeholder:text-gray-400"
                          value={photoNotes}
                          onChange={e => setPhotoNotes(e.target.value)}
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* Error Alert */}
                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Sticky Bottom Submit Button */}
                <button
                  type="submit"
                  disabled={status === "uploading" || status === "submitting" || gettingLocation}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition shadow-xl flex justify-center items-center gap-2 sticky bottom-6 active:scale-95 ${
                    status === "uploading" || status === "submitting" || gettingLocation
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#1b7348] hover:bg-[#145635] text-white'
                  }`}
                >
                  {status === "uploading" ? "Uploading Submission Files..." : 
                   status === "submitting" ? "Saving..." : 
                   gettingLocation ? "Awaiting GPS Signal..." :
                   `Next →`}
                </button>

              </form>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
