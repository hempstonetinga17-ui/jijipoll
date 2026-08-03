"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Mic, FileText, Video, Brain, Camera, MapPin, 
  ChevronLeft, Star, Trash2, 
  CheckCircle2, Play, Pause, Square, RefreshCw, MessageSquare,
  ChevronRight, Zap, ArrowRight
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

const TASK_TYPES = [
  {
    id: "AUDIO" as const,
    icon: Mic,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    border: "rgba(167,139,250,0.3)",
    bg: "rgba(167,139,250,0.08)",
    activeBg: "rgba(167,139,250,0.14)",
    title: "Record speech & sentences",
    desc: "Submit speech recordings in Swahili, Kikuyu, Luo, Sheng, etc.",
    badge: "Audio",
  },
  {
    id: "TEXT" as const,
    icon: FileText,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.35)",
    border: "rgba(34,211,238,0.3)",
    bg: "rgba(34,211,238,0.08)",
    activeBg: "rgba(34,211,238,0.14)",
    title: "Type out sentences & translations",
    desc: "Translate phrases, write local corpuses, or submit conversational data.",
    badge: "Text",
  },
  {
    id: "VIDEO" as const,
    icon: Video,
    color: "#fb923c",
    glow: "rgba(251,146,60,0.35)",
    border: "rgba(251,146,60,0.3)",
    bg: "rgba(251,146,60,0.08)",
    activeBg: "rgba(251,146,60,0.14)",
    title: "Record activities, events & objects",
    desc: "Record activities, events, objects, or environmental landmarks.",
    badge: "Video",
  },
  {
    id: "EVAL" as const,
    icon: Brain,
    color: "#facc15",
    glow: "rgba(250,204,21,0.35)",
    border: "rgba(250,204,21,0.3)",
    bg: "rgba(250,204,21,0.08)",
    activeBg: "rgba(250,204,21,0.14)",
    title: "Rate & evaluate AI responses",
    desc: "Provide RLHF training data by rating and evaluating AI outputs.",
    badge: "AI Eval",
  },
  {
    id: "PHOTO" as const,
    icon: Camera,
    color: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    border: "rgba(52,211,153,0.3)",
    bg: "rgba(52,211,153,0.08)",
    activeBg: "rgba(52,211,153,0.14)",
    title: "Capture geotagged storefronts",
    desc: "Take geotagged photos of physical shops, water pumps, or mosques.",
    badge: "Photo",
  },
]

export default function AgentCapture() {
  const router = useRouter()
  
  const [selectedTaskType, setSelectedTaskType] = useState<"AUDIO" | "TEXT" | "VIDEO" | "EVAL" | "PHOTO" | null>(null)
  const [tasks, setTasks] = useState<CollectionTask[]>([])
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [gettingLocation, setGettingLocation] = useState(true)

  const [status, setStatus] = useState<"idle" | "uploading" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Photo state
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

  // Audio state
  const [languageId, setLanguageId] = useState("")
  const [dialect, setDialect] = useState("")
  const [environment, setEnvironment] = useState("INDOOR")
  const [promptIdx, setPromptIdx] = useState(0)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioTimer, setAudioTimer] = useState(0)
  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  // Text state
  const [textType, setTextType] = useState("CORPUS")
  const [sourceLanguage, setSourceLanguage] = useState("")
  const [sourceText, setSourceText] = useState("")
  const [submittedText, setSubmittedText] = useState("")
  const [textDomain, setTextDomain] = useState("")

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [activityLabel, setActivityLabel] = useState("")
  const [sceneType, setSceneType] = useState("INDOOR")
  const [isEgocentric, setIsEgocentric] = useState(false)
  const [objectLabelsInput, setObjectLabelsInput] = useState("")

  // Eval state
  const [evalModelName, setEvalModelName] = useState("")
  const [evalPromptText, setEvalPromptText] = useState("")
  const [evalResponseText, setEvalResponseText] = useState("")
  const [evalOverallRating, setEvalOverallRating] = useState(5)
  const [evalRaterNotes, setEvalRaterNotes] = useState("")

  useEffect(() => {
    fetch("/api/languages")
      .then(res => res.json())
      .then(data => {
        setLanguages(data)
        if (data.length > 0) setLanguageId(data[0].id)
      })
      .catch(err => console.error("Error fetching languages", err))
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
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

  useEffect(() => {
    if (!selectedTaskType) return
    setLoadingTasks(true)
    setSelectedTask(null)
    setTasks([])
    fetch(`/api/tasks?taskType=${selectedTaskType}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data)
        if (data.length > 0) setSelectedTask(data[0])
        setLoadingTasks(false)
      })
      .catch(err => {
        console.error("Error fetching tasks", err)
        setLoadingTasks(false)
      })
  }, [selectedTaskType])

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const uploadFileToR2 = async (fileToUpload: File): Promise<string> => {
    const form = new FormData()
    form.append("file", fileToUpload)
    const res = await fetch("/api/field-agent/upload", { method: "POST", body: form })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Failed to upload file")
    }
    const { publicUrl } = await res.json()
    return publicUrl
  }

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

  const startRecordingAudio = async () => {
    audioChunksRef.current = []
    setAudioUrl(null)
    setAudioBlob(null)
    setAudioTimer(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        if (audioTimerRef.current) clearInterval(audioTimerRef.current)
      }
      mediaRecorder.start()
      setIsRecordingAudio(true)
      audioTimerRef.current = setInterval(() => setAudioTimer(t => t + 1), 1000)
    } catch (err) {
      alert("Microphone access is required for audio recording.")
    }
  }

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop()
      setIsRecordingAudio(false)
      if (audioTimerRef.current) clearInterval(audioTimerRef.current)
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

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

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
            latitude: location.lat, longitude: location.lng,
            category: photoCategory, photoUrl: uploadedUrl,
            contactInfo: photoContactInfo, customFeatures: { note: photoNotes }
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      } else if (selectedTaskType === "AUDIO") {
        if (!audioBlob) throw new Error("Please record speech before submitting.")
        setStatus("uploading")
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        const uploadedUrl = await uploadFileToR2(audioFile)
        setStatus("submitting")
        const submitRes = await fetch("/api/submissions/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null, languageId: languageId || null,
            dialect: dialect || null, audioUrl: uploadedUrl,
            durationSecs: audioTimer || 5,
            scriptPrompt: selectedTask?.prompts[promptIdx] || "Speech sample",
            isScripted: true, audioType: "MONOLOGUE", environment,
            latitude: location?.lat || null, longitude: location?.lng || null,
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      } else if (selectedTaskType === "TEXT") {
        if (!submittedText.trim()) throw new Error("Please enter some text to submit.")
        setStatus("submitting")
        const submitRes = await fetch("/api/submissions/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null, languageId: languageId || null,
            sourceLanguage: sourceLanguage || null, textType,
            domain: textDomain || selectedTask?.description || "CORPUS",
            sourceText: sourceText || null, submittedText,
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      } else if (selectedTaskType === "VIDEO") {
        if (!videoFile) throw new Error("Please choose or record a video first.")
        setStatus("uploading")
        const uploadedUrl = await uploadFileToR2(videoFile)
        setStatus("submitting")
        const submitRes = await fetch("/api/submissions/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null, videoUrl: uploadedUrl, durationSecs: 10,
            activityLabel: activityLabel || "Video capture", sceneType, isEgocentric,
            objectLabels: objectLabelsInput.split(",").map(lbl => lbl.trim()).filter(Boolean),
            latitude: location?.lat || null, longitude: location?.lng || null,
          })
        })
        if (!submitRes.ok) throw new Error((await submitRes.json()).error || "Submission failed")
      } else if (selectedTaskType === "EVAL") {
        if (!evalPromptText.trim() || !evalResponseText.trim()) throw new Error("Prompt and Response text are required.")
        setStatus("submitting")
        const submitRes = await fetch("/api/submissions/eval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null, modelName: evalModelName || "AI Assistant",
            promptText: evalPromptText, responseText: evalResponseText,
            overallRating: evalOverallRating, raterNotes: evalRaterNotes,
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

  const handleReset = () => {
    setPhotoFile(null); setPhotoPreview(null); setPhotoContactInfo(""); setPhotoNotes("")
    setAudioBlob(null); setAudioUrl(null); setAudioTimer(0)
    setSubmittedText(""); setSourceText("")
    setVideoFile(null); setVideoPreview(null)
    setEvalPromptText(""); setEvalResponseText(""); setEvalRaterNotes("")
    setStatus("idle")
  }

  const activeMeta = TASK_TYPES.find(t => t.id === selectedTaskType)

  /* ─── CSS Helpers ─────────────────────────────────────── */
  const darkInput = {
    width: "100%", padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#f1f5f9", fontSize: "0.875rem", fontWeight: 500,
    fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  } as React.CSSProperties

  const darkTextarea = {
    ...darkInput,
    resize: "none" as const,
  }

  const darkSelect = {
    ...darkInput,
    cursor: "pointer",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    paddingRight: "2.5rem",
  }

  const labelStyle = {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: "0.5rem",
  }

  /* ─── Success Screen ──────────────────────────────────── */
  if (status === "success") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #050d1a 0%, #0a1628 40%, #0f1e35 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @keyframes successPop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes checkDraw { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
          .success-icon { animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          .success-check { stroke-dasharray: 60; animation: checkDraw 0.4s 0.4s ease forwards; stroke-dashoffset: 60; }
          .success-fade { animation: fadeUp 0.5s 0.3s ease both; }
          .ripple-ring { position: absolute; inset: -8px; border-radius: 50%; border: 2px solid rgba(16,185,129,0.4); animation: ripple 1.5s ease-out infinite; }
          .ripple-ring-2 { animation-delay: 0.5s; }
          .ripple-ring-3 { animation-delay: 1s; }
        `}</style>
        <div style={{
          background: "rgba(15,30,53,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "28px",
          padding: "2.5rem 2rem",
          maxWidth: 380, width: "100%",
          textAlign: "center",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.08)",
        }}>
          {/* Animated checkmark */}
          <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 1.75rem" }}>
            <div className="ripple-ring" />
            <div className="ripple-ring ripple-ring-2" />
            <div className="ripple-ring ripple-ring-3" />
            <div className="success-icon" style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))",
              border: "2px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(16,185,129,0.3)",
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  className="success-check"
                  d="M12 24L20 32L36 16"
                  stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="success-fade">
            <h2 style={{ color: "#f1f5f9", fontWeight: 900, fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
              Submitted Successfully!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
              Your data has been uploaded. You'll earn your reward once it's reviewed and approved! 🎉
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={handleReset}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                  padding: "0.875rem", borderRadius: "14px", border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
              >
                <Zap size={16} />
                Collect More Data
              </button>
              <Link
                href="/field-agent/dashboard"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.85rem",
                  padding: "0.875rem", borderRadius: "14px",
                  textDecoration: "none",
                }}
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Main Render ─────────────────────────────────────── */
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050d1a 0%, #0a1628 40%, #0f1e35 100%)",
      paddingBottom: "7rem",
      fontFamily: "'Inter', -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
      color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-rec { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes wave { 0%,100% { height: 8px; } 50% { height: 28px; } }
        @keyframes task-in { from { opacity:0; transform: translateX(-12px); } to { opacity:1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes gps-ping { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 10px rgba(16,185,129,0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .task-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; border: none; font-family: inherit; }
        .task-btn:hover { transform: translateY(-2px); }
        .task-btn:active { transform: scale(0.98); }
        .input-focus:focus { border-color: rgba(16,185,129,0.5) !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important; }
        .cat-btn { transition: all 0.15s ease; cursor: pointer; border: none; font-family: inherit; }
        .cat-btn:hover { transform: scale(1.02); }
        .star-btn { transition: transform 0.1s ease; cursor: pointer; background: none; border: none; padding: 4px; }
        .star-btn:hover { transform: scale(1.2); }
        .nav-btn { cursor: pointer; border: none; font-family: inherit; transition: all 0.15s ease; }
        select option { background: #0a1628; color: #e2e8f0; }
      `}</style>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: "6rem", right: "1.25rem", zIndex: 50,
          width: 48, height: 48, borderRadius: "14px",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
          textDecoration: "none",
          transition: "transform 0.15s ease",
        }}
        title="WhatsApp Support"
      >
        <MessageSquare size={20} color="#fff" />
      </a>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(5,13,26,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0.875rem 1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            className="nav-btn"
            onClick={() => {
              if (selectedTaskType) setSelectedTaskType(null)
              else router.push("/field-agent/dashboard")
            }}
            style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1rem", margin: 0, lineHeight: 1.2 }}>
              {selectedTaskType
                ? `${selectedTaskType.charAt(0) + selectedTaskType.slice(1).toLowerCase()} Collection`
                : "Data Collection"}
            </h1>
            {selectedTaskType && activeMeta && (
              <span style={{
                display: "inline-block",
                background: `${activeMeta.color}18`,
                color: activeMeta.color,
                border: `1px solid ${activeMeta.border}`,
                fontSize: "0.6rem", fontWeight: 800,
                padding: "1px 8px", borderRadius: "999px",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {activeMeta.badge} Task
              </span>
            )}
          </div>
        </div>

        {/* GPS indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          background: location ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
          border: `1px solid ${location ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
          borderRadius: "999px", padding: "0.35rem 0.75rem",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: location ? "#10b981" : "#f59e0b",
            animation: gettingLocation ? "pulse-dot 1s ease infinite" : location ? "gps-ping 2s ease infinite" : "none",
          }} />
          <span style={{
            fontSize: "0.65rem", fontWeight: 700,
            color: location ? "#10b981" : "#f59e0b",
          }}>
            {gettingLocation ? "Locating…" : location ? "GPS Locked" : "No GPS"}
          </span>
        </div>
      </header>

      {/* ── Task Progress Banner ───────────────────────────── */}
      {selectedTaskType && (
        <div style={{
          background: "rgba(5,13,26,0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0.625rem 1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Task Progress
              </span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: activeMeta?.color || "#10b981" }}>
                {selectedTask ? "1 / 1" : "0 / 1"}
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "999px", height: 4 }}>
              <div style={{
                background: `linear-gradient(90deg, ${activeMeta?.color || "#10b981"}, ${activeMeta?.color || "#10b981"}99)`,
                height: 4, borderRadius: "999px",
                width: selectedTask ? "100%" : "30%",
                transition: "width 0.6s ease",
                boxShadow: `0 0 8px ${activeMeta?.glow || "rgba(16,185,129,0.5)"}`,
              }} />
            </div>
          </div>
          <button
            onClick={handleSubmit as any}
            disabled={status === "uploading" || status === "submitting" || gettingLocation}
            className="nav-btn"
            style={{
              background: activeMeta?.color ? `${activeMeta.color}20` : "rgba(16,185,129,0.15)",
              border: `1px solid ${activeMeta?.border || "rgba(16,185,129,0.3)"}`,
              color: activeMeta?.color || "#10b981",
              fontWeight: 800, fontSize: "0.75rem",
              padding: "0.45rem 1rem", borderRadius: "10px",
              opacity: (status === "uploading" || status === "submitting" || gettingLocation) ? 0.5 : 1,
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}
          >
            Submit <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 0" }}>

        {/* ── Step 1: Task Type Selection ───────────────────── */}
        {!selectedTaskType && (
          <div className="fade-up" style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "999px", padding: "0.3rem 0.875rem", marginBottom: "1rem",
              }}>
                <Zap size={12} color="#10b981" />
                <span style={{ color: "#10b981", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Select a Task
                </span>
              </div>
              <h2 style={{ color: "#f1f5f9", fontWeight: 900, fontSize: "1.6rem", margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                Complete Tasks,<br />Earn KSh Rewards
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", margin: 0 }}>
                Choose a data collection type below to begin
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {TASK_TYPES.map((task, i) => {
                const Icon = task.icon
                return (
                  <button
                    key={task.id}
                    className="task-btn"
                    onClick={() => setSelectedTaskType(task.id)}
                    style={{
                      width: "100%",
                      background: task.bg,
                      border: `1px solid ${task.border}`,
                      borderRadius: "20px",
                      padding: "1.125rem 1.25rem",
                      display: "flex", alignItems: "center", gap: "1rem",
                      textAlign: "left",
                      boxShadow: `0 4px 24px ${task.glow.replace("0.35", "0.1")}`,
                      animation: `task-in 0.3s ${i * 0.06}s ease both`,
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 56, height: 56, borderRadius: "16px", flexShrink: 0,
                      background: task.bg,
                      border: `1px solid ${task.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 20px ${task.glow}`,
                    }}>
                      <Icon size={24} color={task.color} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.95rem" }}>
                          {task.title}
                        </span>
                        <span style={{
                          background: task.bg, color: task.color,
                          border: `1px solid ${task.border}`,
                          fontSize: "0.55rem", fontWeight: 800,
                          padding: "2px 7px", borderRadius: "999px",
                          letterSpacing: "0.05em", textTransform: "uppercase",
                        }}>
                          {task.badge}
                        </span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", margin: 0, lineHeight: 1.5 }}>
                        {task.desc}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "10px", flexShrink: 0,
                      background: task.bg, border: `1px solid ${task.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ArrowRight size={15} color={task.color} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Task Form ─────────────────────────────── */}
        {selectedTaskType && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* GPS Card */}
            <div style={{
              background: location
                ? "rgba(16,185,129,0.06)"
                : "rgba(245,158,11,0.06)",
              border: `1px solid ${location ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
              borderRadius: "16px", padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "10px",
                  background: location ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  border: `1px solid ${location ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <MapPin size={16} color={location ? "#10b981" : "#f59e0b"} />
                </div>
                <div>
                  <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.82rem", margin: "0 0 0.15rem" }}>
                    GPS Geolocation
                  </p>
                  {gettingLocation ? (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", margin: 0 }}>
                      Acquiring coordinates…
                    </p>
                  ) : locationError ? (
                    <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "0.72rem", margin: 0 }}>{locationError}</p>
                  ) : (
                    <p style={{ color: "#10b981", fontWeight: 700, fontSize: "0.72rem", margin: 0 }}>
                      Locked ({location?.lat.toFixed(5)}, {location?.lng.toFixed(5)})
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="nav-btn"
                onClick={() => {
                  setGettingLocation(true)
                  navigator.geolocation.getCurrentPosition(
                    (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setGettingLocation(false) },
                    () => { setLocationError("Access denied"); setGettingLocation(false) }
                  )
                }}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", fontWeight: 700,
                  padding: "0.4rem 0.875rem", borderRadius: "10px",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                }}
              >
                <RefreshCw size={12} style={{ animation: gettingLocation ? "spin 0.8s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>

            {/* Task selector (non-photo) */}
            {selectedTaskType !== "PHOTO" && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px", padding: "1.25rem",
              }}>
                <label style={{ ...labelStyle }}>Select Collection Task</label>
                {loadingTasks ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
                    <RefreshCw size={14} style={{ animation: "spin 0.8s linear infinite", color: "#10b981" }} />
                    Loading active tasks…
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: "10px",
                    padding: "1rem", textAlign: "center",
                    color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontWeight: 600,
                  }}>
                    No active tasks for this type. Submit general data below.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <select
                      className="input-focus"
                      style={darkSelect}
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
                      <div style={{
                        background: `${activeMeta?.color || "#10b981"}08`,
                        border: `1px solid ${activeMeta?.border || "rgba(16,185,129,0.2)"}`,
                        borderRadius: "12px", padding: "0.875rem 1rem",
                      }}>
                        <span style={{ ...labelStyle, color: activeMeta?.color || "#10b981", marginBottom: "0.35rem" }}>
                          Active Task
                        </span>
                        <p style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.875rem", margin: "0 0 0.25rem" }}>
                          {selectedTask.title}
                        </p>
                        {selectedTask.description && (
                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "0 0 0.5rem" }}>
                            {selectedTask.description}
                          </p>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700 }}>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>Est. Reward</span>
                          <span style={{ color: activeMeta?.color || "#10b981" }}>{selectedTask.rewardPerItem} KSh / item</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Welcome bubble */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px 16px 16px 4px",
              padding: "1rem 1.25rem",
              maxWidth: 480,
            }}>
              <p style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 500, margin: "0 0 0.35rem" }}>
                👋 Welcome to the <strong style={{ color: activeMeta?.color }}>{selectedTaskType}</strong> workspace!
              </p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", margin: 0, lineHeight: 1.5 }}>
                Follow the guidelines below carefully to ensure your submission is approved.
              </p>
            </div>

            {/* ── Dynamic Forms ─────────────────────────────── */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* AUDIO FORM */}
              {selectedTaskType === "AUDIO" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Prompt box */}
                  <div style={{
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    borderRadius: "20px", padding: "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 0 30px rgba(167,139,250,0.08)",
                  }}>
                    <span style={{ ...labelStyle, color: "#a78bfa", marginBottom: "0.75rem" }}>
                      Read this script out loud
                    </span>
                    <p style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.5, margin: "0 0 0.75rem" }}>
                      {selectedTask?.prompts && selectedTask.prompts.length > 0
                        ? selectedTask.prompts[promptIdx]
                        : "Sema jina lako na mahali unapoishi."}
                    </p>
                    {selectedTask?.prompts && selectedTask.prompts.length > 1 && (
                      <button
                        type="button"
                        className="nav-btn"
                        onClick={() => setPromptIdx((idx) => (idx + 1) % selectedTask.prompts.length)}
                        style={{
                          color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700,
                          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
                          padding: "0.35rem 0.875rem", borderRadius: "999px",
                        }}
                      >
                        Next Prompt →
                      </button>
                    )}
                  </div>

                  {/* Language / Dialect / Environment */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "18px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem",
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                      <div>
                        <label style={labelStyle}>Language</label>
                        <select className="input-focus" style={darkSelect} value={languageId} onChange={e => setLanguageId(e.target.value)}>
                          {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name} ({lang.nativeName || lang.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Dialect / Accent</label>
                        <input
                          type="text" placeholder="e.g. Sheng, Standard"
                          className="input-focus" style={darkInput}
                          value={dialect} onChange={e => setDialect(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Recording Environment</label>
                      <select className="input-focus" style={darkSelect} value={environment} onChange={e => setEnvironment(e.target.value)}>
                        <option value="INDOOR">🏠 Indoor</option>
                        <option value="OUTDOOR">🌳 Outdoor</option>
                        <option value="NOISY">🔊 Noisy</option>
                        <option value="QUIET">🤫 Quiet</option>
                      </select>
                    </div>
                  </div>

                  {/* Audio Recorder */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px", padding: "2rem 1.5rem",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem",
                  }}>
                    {isRecordingAudio ? (
                      <>
                        {/* Animated waveform bars */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", height: 40 }}>
                          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.2, 0.3].map((delay, i) => (
                            <div key={i} style={{
                              width: 4, borderRadius: "2px",
                              background: "linear-gradient(180deg, #10b981, #059669)",
                              boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                              animation: `wave 0.6s ${delay}s ease-in-out infinite alternate`,
                            }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
                            animation: "pulse-dot 0.8s ease infinite",
                          }} />
                          <span style={{ color: "#ef4444", fontWeight: 800, fontSize: "0.875rem" }}>
                            Recording — {formatTime(audioTimer)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={stopRecordingAudio}
                          style={{
                            width: 64, height: 64, borderRadius: "50%",
                            background: "rgba(239,68,68,0.15)",
                            border: "2px solid rgba(239,68,68,0.4)",
                            color: "#ef4444", cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            animation: "pulse-rec 1.5s ease infinite",
                            transition: "transform 0.15s ease",
                          }}
                        >
                          <Square size={24} />
                        </button>
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", fontWeight: 600 }}>
                          Tap to stop & review
                        </span>
                      </>
                    ) : audioUrl ? (
                      <>
                        {/* Playback controls */}
                        <div style={{
                          width: 64, height: 64, borderRadius: "50%",
                          background: "rgba(16,185,129,0.12)",
                          border: "2px solid rgba(16,185,129,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 0 20px rgba(16,185,129,0.2)",
                        }}>
                          <CheckCircle2 size={28} color="#10b981" />
                        </div>
                        <p style={{ color: "#10b981", fontWeight: 700, fontSize: "0.82rem", margin: 0 }}>
                          Recording captured — {formatTime(audioTimer)}
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <button
                            type="button"
                            className="nav-btn"
                            onClick={togglePlaybackAudio}
                            style={{
                              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                              color: "#10b981", fontWeight: 700, fontSize: "0.82rem",
                              padding: "0.6rem 1.25rem", borderRadius: "12px",
                              display: "flex", alignItems: "center", gap: "0.4rem",
                            }}
                          >
                            {audioPlaying ? <Pause size={15} /> : <Play size={15} />}
                            {audioPlaying ? "Pause" : "Play"}
                          </button>
                          <button
                            type="button"
                            className="nav-btn"
                            onClick={() => { setAudioUrl(null); setAudioBlob(null); setAudioTimer(0); }}
                            style={{
                              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                              color: "#ef4444", fontWeight: 700, fontSize: "0.82rem",
                              padding: "0.6rem 1.25rem", borderRadius: "12px",
                              display: "flex", alignItems: "center", gap: "0.4rem",
                            }}
                          >
                            <Trash2 size={14} /> Retake
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: 72, height: 72, borderRadius: "50%",
                          background: "rgba(167,139,250,0.1)",
                          border: "2px solid rgba(167,139,250,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 0 24px rgba(167,139,250,0.15)",
                        }}>
                          <Mic size={30} color="#a78bfa" />
                        </div>
                        <button
                          type="button"
                          className="nav-btn"
                          onClick={startRecordingAudio}
                          style={{
                            background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                            color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                            padding: "0.75rem 2rem", borderRadius: "14px", border: "none",
                            boxShadow: "0 8px 24px rgba(167,139,250,0.4)",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                          }}
                        >
                          <Mic size={16} /> Start Recording
                        </button>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", margin: 0 }}>
                          Tap to begin. Speak clearly near your microphone.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TEXT FORM */}
              {selectedTaskType === "TEXT" && (
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px", padding: "1.5rem",
                  display: "flex", flexDirection: "column", gap: "1rem",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>Target Language</label>
                      <select className="input-focus" style={darkSelect} value={languageId} onChange={e => setLanguageId(e.target.value)}>
                        {languages.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Entry Type</label>
                      <select className="input-focus" style={darkSelect} value={textType} onChange={e => {
                        setTextType(e.target.value)
                        if (e.target.value !== "TRANSLATION") { setSourceLanguage(""); setSourceText("") }
                      }}>
                        <option value="CORPUS">📖 Local Corpus Text</option>
                        <option value="TRANSLATION">🔤 Translation Entry</option>
                        <option value="RLHF_PROMPT">🤖 RLHF Prompt Input</option>
                        <option value="TRANSCRIPTION">✍️ Audio Transcription</option>
                      </select>
                    </div>
                  </div>

                  {textType === "TRANSLATION" && (
                    <div style={{
                      background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)",
                      borderRadius: "14px", padding: "1rem",
                      display: "flex", flexDirection: "column", gap: "0.75rem",
                    }}>
                      <div>
                        <label style={{ ...labelStyle, color: "#22d3ee" }}>Source Language</label>
                        <input
                          type="text" placeholder="e.g. English" className="input-focus" style={darkInput}
                          value={sourceLanguage} onChange={e => setSourceLanguage(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: "#22d3ee" }}>Source Text to Translate</label>
                        <textarea
                          className="input-focus" style={{ ...darkTextarea, height: 72 }}
                          placeholder="Enter phrase to be translated"
                          value={sourceText} onChange={e => setSourceText(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Domain (optional)</label>
                    <input
                      type="text" placeholder="e.g. Health, Agriculture, Finance"
                      className="input-focus" style={darkInput}
                      value={textDomain} onChange={e => setTextDomain(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ ...labelStyle, marginBottom: "0.5rem" }}>
                      Submitted Text Entry <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      required placeholder="Type or paste the collected text here…"
                      className="input-focus" style={{ ...darkTextarea, height: 140 }}
                      value={submittedText} onChange={e => setSubmittedText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* VIDEO FORM */}
              {selectedTaskType === "VIDEO" && (
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px", padding: "1.5rem",
                  display: "flex", flexDirection: "column", gap: "1rem",
                }}>
                  {/* Upload zone */}
                  <div>
                    <label style={labelStyle}>Upload Video File <span style={{ color: "#ef4444" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="file" accept="video/*" required={!videoFile}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)) }
                        }}
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 2 }}
                      />
                      <div style={{
                        border: `2px dashed ${videoFile ? "rgba(251,146,60,0.4)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "16px", padding: "2rem",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
                        background: videoFile ? "rgba(251,146,60,0.05)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.2s",
                      }}>
                        <Video size={36} color={videoFile ? "#fb923c" : "rgba(255,255,255,0.25)"} />
                        <span style={{ color: videoFile ? "#fb923c" : "rgba(255,255,255,0.35)", fontWeight: 700, fontSize: "0.82rem" }}>
                          {videoFile ? videoFile.name : "Tap to choose a video file"}
                        </span>
                      </div>
                    </div>
                    {videoPreview && (
                      <div style={{ marginTop: "0.875rem", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(251,146,60,0.2)" }}>
                        <video src={videoPreview} controls style={{ width: "100%", display: "block" }} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={labelStyle}>Activity Description <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="text" required placeholder="e.g. Shopping, farming"
                        className="input-focus" style={darkInput}
                        value={activityLabel} onChange={e => setActivityLabel(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Scene Type</label>
                      <select className="input-focus" style={darkSelect} value={sceneType} onChange={e => setSceneType(e.target.value)}>
                        <option value="INDOOR">🏠 Indoor</option>
                        <option value="OUTDOOR">🌳 Outdoor</option>
                        <option value="STREET">🛣️ Street/Road</option>
                        <option value="OFFICE">🏢 Office/Retail</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <input
                      type="checkbox" id="isEgocentric" checked={isEgocentric}
                      onChange={e => setIsEgocentric(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#fb923c", cursor: "pointer" }}
                    />
                    <label htmlFor="isEgocentric" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                      Is Egocentric (first-person perspective)
                    </label>
                  </div>

                  <div>
                    <label style={labelStyle}>Object Labels (comma-separated)</label>
                    <input
                      type="text" placeholder="e.g. phone, desk, tree"
                      className="input-focus" style={darkInput}
                      value={objectLabelsInput} onChange={e => setObjectLabelsInput(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* EVAL FORM */}
              {selectedTaskType === "EVAL" && (
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px", padding: "1.5rem",
                  display: "flex", flexDirection: "column", gap: "1rem",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", alignItems: "start" }}>
                    <div>
                      <label style={labelStyle}>AI Model Name</label>
                      <input
                        type="text" placeholder="e.g. Gemini 1.5 Pro"
                        className="input-focus" style={darkInput}
                        value={evalModelName} onChange={e => setEvalModelName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Quality Rating</label>
                      <div style={{ display: "flex", gap: "4px", paddingTop: "0.25rem" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star} type="button" className="star-btn"
                            onClick={() => setEvalOverallRating(star)}
                          >
                            <Star size={26} color="#facc15" fill={star <= evalOverallRating ? "#facc15" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Model Prompt Text <span style={{ color: "#ef4444" }}>*</span></label>
                    <textarea
                      required placeholder="Enter the prompt that was sent to the model…"
                      className="input-focus" style={{ ...darkTextarea, height: 96 }}
                      value={evalPromptText} onChange={e => setEvalPromptText(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Model Output Response <span style={{ color: "#ef4444" }}>*</span></label>
                    <textarea
                      required placeholder="Paste the model's response text here…"
                      className="input-focus" style={{ ...darkTextarea, height: 128 }}
                      value={evalResponseText} onChange={e => setEvalResponseText(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Rater Notes / Assessment</label>
                    <textarea
                      placeholder="Explain your rating — accuracy, safety, formatting, etc."
                      className="input-focus" style={{ ...darkTextarea, height: 80 }}
                      value={evalRaterNotes} onChange={e => setEvalRaterNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* PHOTO FORM */}
              {selectedTaskType === "PHOTO" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                  {/* Camera column */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px", padding: "1.25rem",
                  }}>
                    <label style={labelStyle}>📸 Photo <span style={{ color: "#ef4444" }}>*</span></label>

                    {cameraOpen && (
                      <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#000", aspectRatio: "16/9", marginBottom: "1rem", boxShadow: "0 0 40px rgba(52,211,153,0.15), inset 0 0 40px rgba(0,0,0,0.3)" }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {/* Viewfinder overlay */}
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 80, height: 80 }}>
                            <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: "2px solid rgba(52,211,153,0.8)", borderLeft: "2px solid rgba(52,211,153,0.8)", borderRadius: "3px 0 0 0" }} />
                            <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: "2px solid rgba(52,211,153,0.8)", borderRight: "2px solid rgba(52,211,153,0.8)", borderRadius: "0 3px 0 0" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, width: 20, height: 20, borderBottom: "2px solid rgba(52,211,153,0.8)", borderLeft: "2px solid rgba(52,211,153,0.8)", borderRadius: "0 0 0 3px" }} />
                            <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: "2px solid rgba(52,211,153,0.8)", borderRight: "2px solid rgba(52,211,153,0.8)", borderRadius: "0 0 3px 0" }} />
                          </div>
                        </div>
                        {/* Camera buttons */}
                        <div style={{ position: "absolute", bottom: "1rem", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "1rem" }}>
                          <button type="button" onClick={stopCamera} className="nav-btn" style={{
                            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.2)", color: "#fff",
                            fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1.25rem", borderRadius: "999px",
                          }}>
                            Cancel
                          </button>
                          <button type="button" onClick={capturePhoto} className="nav-btn" style={{
                            background: "linear-gradient(135deg, #34d399, #10b981)",
                            border: "none", color: "#fff",
                            fontWeight: 800, fontSize: "0.875rem", padding: "0.65rem 1.75rem", borderRadius: "999px",
                            boxShadow: "0 8px 24px rgba(52,211,153,0.5)",
                            display: "flex", alignItems: "center", gap: "0.4rem",
                          }}>
                            <Camera size={16} /> Capture
                          </button>
                        </div>
                      </div>
                    )}

                    {!cameraOpen && photoPreview && (
                      <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", marginBottom: "1rem", border: "1px solid rgba(52,211,153,0.3)" }}>
                        <img src={photoPreview} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button
                          type="button"
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                          className="nav-btn"
                          style={{
                            position: "absolute", top: "0.75rem", right: "0.75rem",
                            background: "rgba(239,68,68,0.8)", backdropFilter: "blur(8px)",
                            color: "#fff", fontWeight: 700, fontSize: "0.72rem",
                            padding: "0.4rem 0.875rem", borderRadius: "999px",
                            display: "flex", alignItems: "center", gap: "0.3rem",
                          }}
                        >
                          <Trash2 size={12} /> Retake
                        </button>
                      </div>
                    )}

                    {!cameraOpen && !photoPreview && (
                      <button
                        type="button" onClick={openCamera}
                        className="nav-btn"
                        style={{
                          width: "100%", aspectRatio: "16/9",
                          border: "2px dashed rgba(52,211,153,0.25)",
                          borderRadius: "16px", marginBottom: "1rem",
                          background: "rgba(52,211,153,0.04)",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                          color: "rgba(52,211,153,0.6)",
                          transition: "all 0.2s",
                        }}
                      >
                        <Camera size={36} />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Open Camera</span>
                      </button>
                    )}

                    {cameraError && (
                      <p style={{ color: "#ef4444", fontSize: "0.78rem", fontWeight: 600, margin: "0.5rem 0 0" }}>{cameraError}</p>
                    )}
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>

                  {/* Details column */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px", padding: "1.25rem",
                    display: "flex", flexDirection: "column", gap: "1rem",
                  }}>
                    <div>
                      <label style={labelStyle}>Category <span style={{ color: "#ef4444" }}>*</span></label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id} type="button" className="cat-btn"
                            onClick={() => setPhotoCategory(cat.id)}
                            style={{
                              padding: "0.625rem 0.75rem", borderRadius: "12px",
                              fontSize: "0.78rem", fontWeight: 600, textAlign: "left",
                              background: photoCategory === cat.id ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${photoCategory === cat.id ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
                              color: photoCategory === cat.id ? "#34d399" : "rgba(255,255,255,0.5)",
                              boxShadow: photoCategory === cat.id ? "0 0 12px rgba(52,211,153,0.15)" : "none",
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Contact Info <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="text" required placeholder="Phone number, email, or name"
                        className="input-focus" style={darkInput}
                        value={photoContactInfo} onChange={e => setPhotoContactInfo(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Features / Notes <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea
                        required placeholder="e.g. They use Point of Sale XYZ"
                        className="input-focus" style={{ ...darkTextarea, height: 96 }}
                        value={photoNotes} onChange={e => setPhotoNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error alert */}
              {errorMessage && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "14px", padding: "0.875rem 1.125rem",
                  color: "#fca5a5", fontSize: "0.82rem", fontWeight: 600,
                }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === "uploading" || status === "submitting" || gettingLocation}
                className="nav-btn"
                style={{
                  width: "100%", padding: "1rem",
                  borderRadius: "18px",
                  fontWeight: 900, fontSize: "1rem",
                  fontFamily: "inherit",
                  background: (status === "uploading" || status === "submitting" || gettingLocation)
                    ? "rgba(255,255,255,0.05)"
                    : `linear-gradient(135deg, ${activeMeta?.color || "#10b981"}, ${activeMeta?.color || "#10b981"}cc)`,
                  color: (status === "uploading" || status === "submitting" || gettingLocation)
                    ? "rgba(255,255,255,0.3)"
                    : "#fff",
                  border: "none",
                  boxShadow: (status === "uploading" || status === "submitting" || gettingLocation)
                    ? "none"
                    : `0 12px 32px ${activeMeta?.glow || "rgba(16,185,129,0.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  cursor: (status === "uploading" || status === "submitting" || gettingLocation) ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  position: "sticky", bottom: "1.5rem",
                }}
              >
                {status === "uploading" ? (
                  <><RefreshCw size={17} style={{ animation: "spin 0.8s linear infinite" }} /> Uploading Files…</>
                ) : status === "submitting" ? (
                  <><RefreshCw size={17} style={{ animation: "spin 0.8s linear infinite" }} /> Saving…</>
                ) : gettingLocation ? (
                  <>⏳ Awaiting GPS Signal…</>
                ) : (
                  <>Submit & Earn <ArrowRight size={17} /></>
                )}
              </button>

            </form>
          </div>
        )}
      </main>
    </div>
  )
}
