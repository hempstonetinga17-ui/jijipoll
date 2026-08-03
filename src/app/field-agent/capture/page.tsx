"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mic, Camera, Tag,
  ChevronLeft, Star, Trash2,
  CheckCircle2, Play, Pause, Square, RefreshCw, MessageSquare,
  ChevronRight, Zap, ArrowRight, MapPin, Plus, X, Send
} from "lucide-react"

/* ─── Categories for Geo Photo ──────────────────────────── */
const PHOTO_CATEGORIES = [
  { id: "BUSINESS",      label: "🏪 Business / Shop" },
  { id: "WATER_FEATURE", label: "🚰 Water Feature" },
  { id: "CHURCH",        label: "⛪ Church / Mosque" },
  { id: "BUILDING",      label: "🏢 Building" },
  { id: "OTHER",         label: "📌 Other" },
]

/* ─── Scene types for Annotation ────────────────────────── */
const SCENE_TYPES = [
  { id: "INDOOR",   label: "🏠 Indoor" },
  { id: "OUTDOOR",  label: "🌳 Outdoor" },
  { id: "STREET",   label: "🛣️ Street / Road" },
  { id: "MARKET",   label: "🛒 Market / Shop" },
  { id: "FARM",     label: "🌾 Farm / Agriculture" },
  { id: "OTHER",    label: "📌 Other" },
]

interface Language {
  id: string
  code: string
  name: string
  nativeName?: string
}

interface CollectionTask {
  id: string
  title: string
  description?: string
  taskType: string
  rewardPerItem: number
  prompts: string[]
  language?: Language
}

/* ─── Task type definitions ──────────────────────────────── */
const TASK_TYPES = [
  {
    id: "AUDIO" as const,
    icon: Mic,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    border: "rgba(167,139,250,0.3)",
    bg: "rgba(167,139,250,0.08)",
    badge: "Speech",
    title: "Speech Dataset Generation",
    desc: "Record scripted sentences in local languages — Swahili, Kikuyu, Luo, Sheng and more.",
    reward: "Up to 15 KSh / recording",
  },
  {
    id: "PHOTO" as const,
    icon: Camera,
    color: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    border: "rgba(52,211,153,0.3)",
    bg: "rgba(52,211,153,0.08)",
    badge: "Geo Photo",
    title: "Geo-Tagged Image Capture",
    desc: "Photograph shops, water points, churches, and buildings with precise GPS coordinates.",
    reward: "Up to 20 KSh / photo",
  },
  {
    id: "ANNOTATION" as const,
    icon: Tag,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.35)",
    border: "rgba(96,165,250,0.3)",
    bg: "rgba(96,165,250,0.08)",
    badge: "Annotate",
    title: "Image Annotation",
    desc: "Upload images and label objects, scenes, and features to build computer vision datasets.",
    reward: "Up to 25 KSh / annotation",
  },
]

export default function AgentCapture() {
  const router = useRouter()

  /* ─── Navigation state ──────────────────────────────── */
  const [selectedTaskType, setSelectedTaskType] = useState<"AUDIO" | "PHOTO" | "ANNOTATION" | null>(null)
  const [tasks, setTasks]                       = useState<CollectionTask[]>([])
  const [selectedTask, setSelectedTask]         = useState<CollectionTask | null>(null)
  const [loadingTasks, setLoadingTasks]         = useState(false)
  const [languages, setLanguages]               = useState<Language[]>([])

  /* ─── Location ──────────────────────────────────────── */
  const [location, setLocation]         = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [gettingLocation, setGettingLocation] = useState(true)

  /* ─── Status ────────────────────────────────────────── */
  const [status, setStatus]           = useState<"idle" | "uploading" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  /* ─── PHOTO state ───────────────────────────────────── */
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const [cameraOpen,       setCameraOpen]       = useState(false)
  const [cameraError,      setCameraError]      = useState("")
  const [photoFile,        setPhotoFile]        = useState<File | null>(null)
  const [photoPreview,     setPhotoPreview]     = useState<string | null>(null)
  const [photoCategory,    setPhotoCategory]    = useState("BUSINESS")
  const [photoContactInfo, setPhotoContactInfo] = useState("")
  const [photoNotes,       setPhotoNotes]       = useState("")

  // Optional Photo Audio
  const [photoAudioLanguage,      setPhotoAudioLanguage]      = useState("")
  const [isRecordingPhotoAudio,   setIsRecordingPhotoAudio]   = useState(false)
  const [photoAudioBlob,          setPhotoAudioBlob]          = useState<Blob | null>(null)
  const [photoAudioUrl,           setPhotoAudioUrl]           = useState<string | null>(null)
  const [photoAudioPlaying,       setPhotoAudioPlaying]       = useState(false)
  const [photoAudioTimer,         setPhotoAudioTimer]         = useState(0)
  const photoAudioTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const photoMediaRecorderRef = useRef<MediaRecorder | null>(null)
  const photoAudioChunksRef   = useRef<Blob[]>([])
  const photoAudioPlayerRef   = useRef<HTMLAudioElement | null>(null)

  /* ─── AUDIO state ───────────────────────────────────── */
  const [languageId,       setLanguageId]       = useState("")
  const [dialect,          setDialect]          = useState("")
  const [environment,      setEnvironment]      = useState("INDOOR")
  const [promptIdx,        setPromptIdx]        = useState(0)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [audioBlob,        setAudioBlob]        = useState<Blob | null>(null)
  const [audioUrl,         setAudioUrl]         = useState<string | null>(null)
  const [audioPlaying,     setAudioPlaying]     = useState(false)
  const [audioTimer,       setAudioTimer]       = useState(0)
  const audioTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])
  const audioPlayerRef   = useRef<HTMLAudioElement | null>(null)

  /* ─── ANNOTATION state ──────────────────────────────── */
  const [annotationImageFile,    setAnnotationImageFile]    = useState<File | null>(null)
  const [annotationImagePreview, setAnnotationImagePreview] = useState<string | null>(null)
  const [annotationLabelsInput,  setAnnotationLabelsInput]  = useState("")
  const [annotationLabelTags,    setAnnotationLabelTags]    = useState<string[]>([])
  const [annotationSceneType,    setAnnotationSceneType]    = useState("OUTDOOR")
  const [annotationDescription,  setAnnotationDescription]  = useState("")
  const [annotationNotes,        setAnnotationNotes]        = useState("")

  /* ─── Data fetching ─────────────────────────────────── */
  useEffect(() => {
    fetch("/api/languages")
      .then(r => r.json())
      .then(data => { setLanguages(data); if (data.length > 0) setLanguageId(data[0].id) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        p => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setGettingLocation(false) },
        () => { setLocationError("Could not get location. Enable location services."); setGettingLocation(false) },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setLocationError("Geolocation not supported.")
      setGettingLocation(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedTaskType) return
    setLoadingTasks(true); setSelectedTask(null); setTasks([])
    const apiType = selectedTaskType === "ANNOTATION" ? "PHOTO" : selectedTaskType
    fetch(`/api/tasks?taskType=${apiType}`)
      .then(r => r.json())
      .then(data => { setTasks(data); if (data.length > 0) setSelectedTask(data[0]); setLoadingTasks(false) })
      .catch(() => setLoadingTasks(false))
  }, [selectedTaskType])

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])

  /* ─── File upload ───────────────────────────────────── */
  const uploadFileToR2 = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/field-agent/upload", { method: "POST", body: form })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed")
    return (await res.json()).publicUrl
  }

  /* ─── Camera methods ────────────────────────────────── */
  const openCamera = useCallback(async () => {
    setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() } }, 100)
    } catch { setCameraError("Camera access denied. Allow camera permissions and try again.") }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOpen(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video  = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      if (!blob) return
      const f = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })
      setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); stopCamera()
    }, "image/jpeg", 0.92)
  }, [stopCamera])

  /* ─── Photo Audio methods ───────────────────────────── */
  const startRecordingPhotoAudio = async () => {
    photoAudioChunksRef.current = []; setPhotoAudioUrl(null); setPhotoAudioBlob(null); setPhotoAudioTimer(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      photoMediaRecorderRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) photoAudioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(photoAudioChunksRef.current, { type: "audio/webm" })
        setPhotoAudioBlob(blob); setPhotoAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        if (photoAudioTimerRef.current) clearInterval(photoAudioTimerRef.current)
      }
      mr.start(); setIsRecordingPhotoAudio(true)
      photoAudioTimerRef.current = setInterval(() => setPhotoAudioTimer(t => t + 1), 1000)
    } catch { alert("Microphone access is required for audio recording.") }
  }

  const stopRecordingPhotoAudio = () => {
    if (photoMediaRecorderRef.current && isRecordingPhotoAudio) {
      photoMediaRecorderRef.current.stop(); setIsRecordingPhotoAudio(false)
      if (photoAudioTimerRef.current) clearInterval(photoAudioTimerRef.current)
    }
  }

  const togglePlaybackPhotoAudio = () => {
    if (!photoAudioUrl) return
    if (!photoAudioPlayerRef.current) {
      photoAudioPlayerRef.current = new Audio(photoAudioUrl)
      photoAudioPlayerRef.current.onended = () => setPhotoAudioPlaying(false)
    }
    if (photoAudioPlaying) {
      photoAudioPlayerRef.current.pause()
      setPhotoAudioPlaying(false)
    } else {
      photoAudioPlayerRef.current.play()
      setPhotoAudioPlaying(true)
    }
  }

  /* ─── Audio methods ─────────────────────────────────── */
  const startRecordingAudio = async () => {
    audioChunksRef.current = []; setAudioUrl(null); setAudioBlob(null); setAudioTimer(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        if (audioTimerRef.current) clearInterval(audioTimerRef.current)
      }
      mr.start(); setIsRecordingAudio(true)
      audioTimerRef.current = setInterval(() => setAudioTimer(t => t + 1), 1000)
    } catch { alert("Microphone access is required for audio recording.") }
  }

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop(); setIsRecordingAudio(false)
      if (audioTimerRef.current) clearInterval(audioTimerRef.current)
    }
  }

  const togglePlaybackAudio = () => {
    if (!audioUrl) return
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl)
      audioPlayerRef.current.onended = () => setAudioPlaying(false)
    }
    if (audioPlaying) { audioPlayerRef.current.pause(); setAudioPlaying(false) }
    else { audioPlayerRef.current.play(); setAudioPlaying(true) }
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  /* ─── Annotation label helpers ──────────────────────── */
  const addLabel = () => {
    const val = annotationLabelsInput.trim()
    if (val && !annotationLabelTags.includes(val)) {
      setAnnotationLabelTags(prev => [...prev, val])
    }
    setAnnotationLabelsInput("")
  }
  const removeLabel = (lbl: string) =>
    setAnnotationLabelTags(prev => prev.filter(l => l !== lbl))

  /* ─── Submit ────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage("")
    try {
      if (selectedTaskType === "PHOTO") {
        if (!location)              throw new Error("GPS location is required.")
        if (!photoFile)             throw new Error("A photo is required.")
        if (!photoContactInfo.trim()) throw new Error("Contact info is required.")
        if (!photoNotes.trim())     throw new Error("Notes / features are required.")
        setStatus("uploading")
        const photoUrl = await uploadFileToR2(photoFile)
        
        let uploadedAudioUrl = null
        if (photoAudioBlob) {
           uploadedAudioUrl = await uploadFileToR2(new File([photoAudioBlob], `photo-audio-${Date.now()}.webm`, { type: "audio/webm" }))
        }

        setStatus("submitting")
        const res = await fetch("/api/field-agent/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: location.lat, longitude: location.lng,
            category: photoCategory, photoUrl,
            contactInfo: photoContactInfo,
            customFeatures: { 
              caption: photoNotes, 
              audioUrl: uploadedAudioUrl, 
              audioLanguage: photoAudioLanguage || languageId 
            },
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Submission failed")
      }

      else if (selectedTaskType === "AUDIO") {
        if (!audioBlob) throw new Error("Please record speech before submitting.")
        setStatus("uploading")
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        const audioUrl  = await uploadFileToR2(audioFile)
        setStatus("submitting")
        const res = await fetch("/api/submissions/audio", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null,
            languageId: languageId || null,
            dialect: dialect || null,
            audioUrl, durationSecs: audioTimer || 5,
            scriptPrompt: selectedTask?.prompts[promptIdx] || "Speech sample",
            isScripted: true, audioType: "MONOLOGUE", environment,
            latitude: location?.lat || null, longitude: location?.lng || null,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Submission failed")
      }

      else if (selectedTaskType === "ANNOTATION") {
        if (!annotationImageFile)          throw new Error("An image is required.")
        if (annotationLabelTags.length < 1) throw new Error("Add at least one object label.")
        if (!annotationDescription.trim()) throw new Error("Scene description is required.")
        setStatus("uploading")
        const imageUrl = await uploadFileToR2(annotationImageFile)
        setStatus("submitting")
        const res = await fetch("/api/submissions/annotation", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask?.id || null,
            imageUrl,
            objectLabels: annotationLabelTags,
            sceneType: annotationSceneType,
            description: annotationDescription,
            notes: annotationNotes || null,
            latitude: location?.lat || null,
            longitude: location?.lng || null,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Submission failed")
      }

      setStatus("success")
    } catch (err: any) {
      console.error(err); setStatus("error"); setErrorMessage(err.message || "Something went wrong")
    }
  }

  const handleReset = () => {
    setPhotoFile(null); setPhotoPreview(null); setPhotoContactInfo(""); setPhotoNotes("")
    setPhotoAudioBlob(null); setPhotoAudioUrl(null); setPhotoAudioTimer(0); setPhotoAudioPlaying(false); photoAudioPlayerRef.current = null
    setAudioBlob(null); setAudioUrl(null); setAudioTimer(0); setAudioPlaying(false)
    audioPlayerRef.current = null
    setAnnotationImageFile(null); setAnnotationImagePreview(null)
    setAnnotationLabelTags([]); setAnnotationLabelsInput("")
    setAnnotationDescription(""); setAnnotationNotes("")
    setStatus("idle")
  }

  const activeMeta = TASK_TYPES.find(t => t.id === selectedTaskType)

  /* ─── Shared style helpers ──────────────────────────── */
  const darkInput: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", color: "#f1f5f9",
    fontSize: "0.875rem", fontWeight: 500,
    fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }
  const darkTextarea: React.CSSProperties = { ...darkInput, resize: "none" }
  const darkSelect: React.CSSProperties = {
    ...darkInput, cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center",
    paddingRight: "2.5rem",
  }
  const labelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.07em",
    display: "block", marginBottom: "0.5rem",
  }
  const glassCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px", padding: "1.5rem",
  }

  /* ──────────────────────────────────────────────────────
      SUCCESS SCREEN
  ────────────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #050d1a 0%, #0a1628 40%, #0f1e35 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem", fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @keyframes successPop { 0% { transform:scale(0.5); opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
          @keyframes checkDraw  { from { stroke-dashoffset:60; } to { stroke-dashoffset:0; } }
          @keyframes fadeUp     { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          @keyframes ripple     { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(2.2); opacity:0; } }
          .s-icon  { animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          .s-check { stroke-dasharray:60; animation: checkDraw 0.4s 0.4s ease forwards; stroke-dashoffset:60; }
          .s-fade  { animation: fadeUp 0.5s 0.3s ease both; }
          .rr      { position:absolute; inset:-8px; border-radius:50%; border:2px solid rgba(16,185,129,0.4); animation:ripple 1.5s ease-out infinite; }
          .rr2     { animation-delay:0.5s; }
          .rr3     { animation-delay:1s; }
        `}</style>
        <div style={{
          background: "rgba(15,30,53,0.75)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(16,185,129,0.2)", borderRadius: "28px",
          padding: "2.5rem 2rem", maxWidth: 380, width: "100%", textAlign: "center",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.08)",
        }}>
          <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 1.75rem" }}>
            <div className="rr" /><div className="rr rr2" /><div className="rr rr3" />
            <div className="s-icon" style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))",
              border: "2px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(16,185,129,0.3)",
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path className="s-check" d="M12 24L20 32L36 16"
                  stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="s-fade">
            <h2 style={{ color: "#f1f5f9", fontWeight: 900, fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
              Submitted Successfully!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
              Your data has been uploaded. You'll earn your reward once it's reviewed and approved! 🎉
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={handleReset} style={{
                width: "100%", background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                padding: "0.875rem", borderRadius: "14px", border: "none",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}>
                <Zap size={16} /> Collect More Data
              </button>
              <Link href="/field-agent/dashboard" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.85rem",
                padding: "0.875rem", borderRadius: "14px", textDecoration: "none",
              }}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ──────────────────────────────────────────────────────
      MAIN RENDER
  ────────────────────────────────────────────────────── */
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
        @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes task-in   { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes wave      { 0%,100% { height:8px; } 50% { height:28px; } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes pulse-rec { 0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow:0 0 0 16px rgba(239,68,68,0); } }
        @keyframes gps-ping  { 0%,100% { box-shadow:0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow:0 0 0 8px rgba(16,185,129,0); } }
        .fade-up   { animation: fadeUp 0.4s ease both; }
        .task-btn  { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor:pointer; border:none; font-family:inherit; }
        .task-btn:hover  { transform: translateY(-2px); }
        .task-btn:active { transform: scale(0.98); }
        .nav-btn   { cursor:pointer; border:none; font-family:inherit; transition:all 0.15s ease; }
        .cat-btn   { transition:all 0.15s ease; cursor:pointer; border:none; font-family:inherit; }
        .cat-btn:hover { transform:scale(1.02); }
        .input-focus:focus { border-color:rgba(16,185,129,0.5) !important; box-shadow:0 0 0 3px rgba(16,185,129,0.12) !important; }
        select option { background:#0a1628; color:#e2e8f0; }
        .lbl-tag { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:0.72rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
      `}</style>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer"
        title="WhatsApp Support"
        style={{
          position: "fixed", bottom: "6rem", right: "1.25rem", zIndex: 50,
          width: 48, height: 48, borderRadius: "14px", background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)", textDecoration: "none",
        }}>
        <MessageSquare size={20} color="#fff" />
      </a>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(5,13,26,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0.875rem 1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="nav-btn"
            onClick={() => { if (selectedTaskType) setSelectedTaskType(null); else router.push("/field-agent/dashboard") }}
            style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1rem", margin: 0, lineHeight: 1.2 }}>
              {selectedTaskType === "AUDIO" ? "Speech Recording"
                : selectedTaskType === "PHOTO" ? "Geo Photo Capture"
                : selectedTaskType === "ANNOTATION" ? "Image Annotation"
                : "Data Collection"}
            </h1>
            {selectedTaskType && activeMeta && (
              <span style={{
                display: "inline-block",
                background: `${activeMeta.color}18`, color: activeMeta.color,
                border: `1px solid ${activeMeta.border}`,
                fontSize: "0.58rem", fontWeight: 800,
                padding: "1px 8px", borderRadius: "999px",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>{activeMeta.badge} Task</span>
            )}
          </div>
        </div>

        {/* GPS pill */}
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
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: location ? "#10b981" : "#f59e0b" }}>
            {gettingLocation ? "Locating…" : location ? "GPS Locked" : "No GPS"}
          </span>
        </div>
      </header>

      {/* ── Progress Banner ─────────────────────────────── */}
      {selectedTaskType && (
        <div style={{
          background: "rgba(5,13,26,0.7)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0.625rem 1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: activeMeta?.color }}>{selectedTask ? "1 / 1" : "0 / 1"}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "999px", height: 4 }}>
              <div style={{
                background: activeMeta?.color, height: 4, borderRadius: "999px",
                width: selectedTask ? "100%" : "30%", transition: "width 0.6s ease",
                boxShadow: `0 0 8px ${activeMeta?.glow}`,
              }} />
            </div>
          </div>
          <button onClick={handleSubmit as any}
            disabled={status === "uploading" || status === "submitting" || gettingLocation}
            className="nav-btn"
            style={{
              background: `${activeMeta?.color}20`, border: `1px solid ${activeMeta?.border}`,
              color: activeMeta?.color, fontWeight: 800, fontSize: "0.75rem",
              padding: "0.45rem 1rem", borderRadius: "10px",
              opacity: (status === "uploading" || status === "submitting" || gettingLocation) ? 0.5 : 1,
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}>
            Submit <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 0" }}>

        {/* ═══════════════════════════════════════════════
            STEP 1 — Task type selection
        ═══════════════════════════════════════════════ */}
        {!selectedTaskType && (
          <div className="fade-up" style={{ maxWidth: 560, margin: "0 auto" }}>
            {/* Hero header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "999px", padding: "0.3rem 0.875rem", marginBottom: "1rem",
              }}>
                <Zap size={12} color="#10b981" />
                <span style={{ color: "#10b981", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Choose a Task
                </span>
              </div>
              <h2 style={{ color: "#f1f5f9", fontWeight: 900, fontSize: "1.6rem", margin: "0 0 0.5rem", lineHeight: 1.2 }}>
                Collect Data,<br />Earn KSh Rewards
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", margin: 0 }}>
                Three ways to contribute to our AI dataset
              </p>
            </div>

            {/* Task cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {TASK_TYPES.map((task, i) => {
                const Icon = task.icon
                return (
                  <button key={task.id} className="task-btn"
                    onClick={() => setSelectedTaskType(task.id)}
                    style={{
                      width: "100%", background: task.bg, border: `1px solid ${task.border}`,
                      borderRadius: "22px", padding: "1.25rem 1.375rem",
                      display: "flex", alignItems: "center", gap: "1.125rem",
                      textAlign: "left", boxShadow: `0 4px 24px ${task.glow.replace("0.35", "0.08")}`,
                      animation: `task-in 0.3s ${i * 0.07}s ease both`,
                    }}>
                    {/* Icon ring */}
                    <div style={{
                      width: 60, height: 60, borderRadius: "18px", flexShrink: 0,
                      background: task.bg, border: `1px solid ${task.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 20px ${task.glow}`,
                    }}>
                      <Icon size={26} color={task.color} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                        <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.975rem" }}>{task.title}</span>
                        <span style={{
                          background: task.bg, color: task.color, border: `1px solid ${task.border}`,
                          fontSize: "0.55rem", fontWeight: 800,
                          padding: "2px 8px", borderRadius: "999px",
                          letterSpacing: "0.05em", textTransform: "uppercase",
                        }}>{task.badge}</span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", margin: "0 0 0.35rem", lineHeight: 1.5 }}>
                        {task.desc}
                      </p>
                      <span style={{ color: task.color, fontSize: "0.7rem", fontWeight: 700 }}>{task.reward}</span>
                    </div>

                    <div style={{
                      width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
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

        {/* ═══════════════════════════════════════════════
            STEP 2 — Task form
        ═══════════════════════════════════════════════ */}
        {selectedTaskType && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* GPS card */}
            <div style={{
              background: location ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)",
              border: `1px solid ${location ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
              borderRadius: "16px", padding: "0.875rem 1.125rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "10px",
                  background: location ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  border: `1px solid ${location ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <MapPin size={15} color={location ? "#10b981" : "#f59e0b"} />
                </div>
                <div>
                  <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.8rem", margin: "0 0 0.1rem" }}>GPS Geolocation</p>
                  {gettingLocation ? (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", margin: 0 }}>Acquiring coordinates…</p>
                  ) : locationError ? (
                    <p style={{ color: "#ef4444", fontSize: "0.7rem", fontWeight: 600, margin: 0 }}>{locationError}</p>
                  ) : (
                    <p style={{ color: "#10b981", fontSize: "0.7rem", fontWeight: 700, margin: 0 }}>
                      Locked · {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
              <button type="button" className="nav-btn"
                onClick={() => {
                  setGettingLocation(true)
                  navigator.geolocation.getCurrentPosition(
                    p => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setGettingLocation(false) },
                    () => { setLocationError("Access denied"); setGettingLocation(false) }
                  )
                }}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", fontWeight: 700,
                  padding: "0.4rem 0.875rem", borderRadius: "10px",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                }}>
                <RefreshCw size={11} style={{ animation: gettingLocation ? "spin 0.8s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>

            {/* Task selector (AUDIO only — PHOTO/ANNOTATION don't use task API) */}
            {selectedTaskType === "AUDIO" && (
              <div style={glassCard}>
                <label style={labelStyle}>Select Collection Task</label>
                {loadingTasks ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
                    <RefreshCw size={13} style={{ animation: "spin 0.8s linear infinite", color: "#10b981" }} />
                    Loading tasks…
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "0.875rem", color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", fontWeight: 600 }}>
                    No active tasks. You can submit a general recording below.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <select className="input-focus" style={darkSelect}
                      value={selectedTask?.id || ""}
                      onChange={e => { const t = tasks.find(x => x.id === e.target.value); setSelectedTask(t || null); setPromptIdx(0) }}>
                      {tasks.map(t => <option key={t.id} value={t.id}>{t.title} ({t.rewardPerItem} KSh)</option>)}
                    </select>
                    {selectedTask && (
                      <div style={{
                        background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)",
                        borderRadius: "12px", padding: "0.875rem 1rem",
                      }}>
                        <span style={{ ...labelStyle, color: "#a78bfa", marginBottom: "0.3rem" }}>Active Task</span>
                        <p style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "0.875rem", margin: "0 0 0.2rem" }}>{selectedTask.title}</p>
                        {selectedTask.description && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "0 0 0.5rem" }}>{selectedTask.description}</p>}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700 }}>
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>Reward</span>
                          <span style={{ color: "#a78bfa" }}>{selectedTask.rewardPerItem} KSh / recording</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Welcome bubble */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px 16px 16px 4px", padding: "1rem 1.25rem", maxWidth: 480,
            }}>
              <p style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 500, margin: "0 0 0.3rem" }}>
                {selectedTaskType === "AUDIO" && "🎙️ Ready to record? Choose a script below and speak clearly."}
                {selectedTaskType === "PHOTO" && "📸 Take a sharp, well-lit photo and fill in the location details."}
                {selectedTaskType === "ANNOTATION" && "🏷️ Upload an image and label all objects and features you can see."}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", margin: 0, lineHeight: 1.5 }}>
                Follow the guidelines carefully to ensure your submission is approved.
              </p>
            </div>

            {/* ── DYNAMIC FORMS ─────────────────────────── */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* ══════════════════ AUDIO FORM ══════════════════ */}
              {selectedTaskType === "AUDIO" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                  {/* Script prompt box */}
                  <div style={{
                    background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)",
                    borderRadius: "20px", padding: "1.5rem", textAlign: "center",
                    boxShadow: "0 0 30px rgba(167,139,250,0.06)",
                  }}>
                    <span style={{ ...labelStyle, color: "#a78bfa", marginBottom: "0.75rem" }}>Read this script out loud</span>
                    <p style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.6, margin: "0 0 0.875rem" }}>
                      {selectedTask?.prompts && selectedTask.prompts.length > 0
                        ? selectedTask.prompts[promptIdx]
                        : "Sema jina lako na mahali unapoishi."}
                    </p>
                    {selectedTask?.prompts && selectedTask.prompts.length > 1 && (
                      <button type="button" className="nav-btn"
                        onClick={() => setPromptIdx(idx => (idx + 1) % selectedTask.prompts.length)}
                        style={{
                          color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700,
                          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
                          padding: "0.35rem 1rem", borderRadius: "999px",
                        }}>
                        Next Prompt →
                      </button>
                    )}
                  </div>

                  {/* Language / Dialect / Environment */}
                  <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                      <div>
                        <label style={labelStyle}>Language</label>
                        <select className="input-focus" style={darkSelect} value={languageId} onChange={e => setLanguageId(e.target.value)}>
                          {languages.map(l => <option key={l.id} value={l.id}>{l.name} ({l.nativeName || l.code})</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Dialect / Accent</label>
                        <input type="text" placeholder="e.g. Sheng, Standard" className="input-focus" style={darkInput}
                          value={dialect} onChange={e => setDialect(e.target.value)} />
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

                  {/* Recorder */}
                  <div style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", padding: "2rem 1.5rem" }}>
                    {isRecordingAudio ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", height: 40 }}>
                          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.2, 0.3].map((delay, i) => (
                            <div key={i} style={{
                              width: 4, borderRadius: "2px",
                              background: "linear-gradient(180deg,#10b981,#059669)",
                              boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                              animation: `wave 0.6s ${delay}s ease-in-out infinite alternate`,
                            }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse-dot 0.8s ease infinite" }} />
                          <span style={{ color: "#ef4444", fontWeight: 800, fontSize: "0.875rem" }}>Recording — {formatTime(audioTimer)}</span>
                        </div>
                        <button type="button"
                          onClick={stopRecordingAudio}
                          style={{
                            width: 64, height: 64, borderRadius: "50%",
                            background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)",
                            color: "#ef4444", cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            animation: "pulse-rec 1.5s ease infinite", transition: "transform 0.15s",
                          }}>
                          <Square size={24} />
                        </button>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", fontWeight: 600 }}>Tap to stop & review</span>
                      </>
                    ) : audioUrl ? (
                      <>
                        <div style={{
                          width: 64, height: 64, borderRadius: "50%",
                          background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 0 20px rgba(16,185,129,0.2)",
                        }}>
                          <CheckCircle2 size={28} color="#10b981" />
                        </div>
                        <p style={{ color: "#10b981", fontWeight: 700, fontSize: "0.82rem", margin: 0 }}>
                          Captured — {formatTime(audioTimer)}
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <button type="button" className="nav-btn" onClick={togglePlaybackAudio}
                            style={{
                              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                              color: "#10b981", fontWeight: 700, fontSize: "0.82rem",
                              padding: "0.6rem 1.25rem", borderRadius: "12px",
                              display: "flex", alignItems: "center", gap: "0.4rem",
                            }}>
                            {audioPlaying ? <Pause size={15} /> : <Play size={15} />}
                            {audioPlaying ? "Pause" : "Play"}
                          </button>
                          <button type="button" className="nav-btn"
                            onClick={() => { setAudioUrl(null); setAudioBlob(null); setAudioTimer(0); audioPlayerRef.current = null }}
                            style={{
                              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                              color: "#ef4444", fontWeight: 700, fontSize: "0.82rem",
                              padding: "0.6rem 1.25rem", borderRadius: "12px",
                              display: "flex", alignItems: "center", gap: "0.4rem",
                            }}>
                            <Trash2 size={14} /> Retake
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: 72, height: 72, borderRadius: "50%",
                          background: "rgba(167,139,250,0.1)", border: "2px solid rgba(167,139,250,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 0 24px rgba(167,139,250,0.15)",
                        }}>
                          <Mic size={30} color="#a78bfa" />
                        </div>
                        <button type="button" className="nav-btn" onClick={startRecordingAudio}
                          style={{
                            background: "linear-gradient(135deg,#a78bfa,#8b5cf6)",
                            color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                            padding: "0.75rem 2rem", borderRadius: "14px", border: "none",
                            boxShadow: "0 8px 24px rgba(167,139,250,0.4)",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                          }}>
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

              {/* ══════════════════ GEO PHOTO FORM ══════════════════ */}
              {selectedTaskType === "PHOTO" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Camera */}
                  <div style={glassCard}>
                    <label style={labelStyle}>📸 Photo <span style={{ color: "#ef4444" }}>*</span></label>

                    {cameraOpen && (
                      <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "#000", aspectRatio: "16/9", marginBottom: "1rem", boxShadow: "0 0 40px rgba(52,211,153,0.12), inset 0 0 40px rgba(0,0,0,0.3)" }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {/* Crosshair overlay */}
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                          {[["top:12px;left:12px", "borderTop:2px solid rgba(52,211,153,0.8);borderLeft:2px solid rgba(52,211,153,0.8);borderRadius:3px 0 0 0"],
                            ["top:12px;right:12px", "borderTop:2px solid rgba(52,211,153,0.8);borderRight:2px solid rgba(52,211,153,0.8);borderRadius:0 3px 0 0"],
                            ["bottom:12px;left:12px", "borderBottom:2px solid rgba(52,211,153,0.8);borderLeft:2px solid rgba(52,211,153,0.8);borderRadius:0 0 0 3px"],
                            ["bottom:12px;right:12px", "borderBottom:2px solid rgba(52,211,153,0.8);borderRight:2px solid rgba(52,211,153,0.8);borderRadius:0 0 3px 0"],
                          ].map(([pos, borders], i) => (
                            <div key={i} style={Object.fromEntries([
                              ["position", "absolute"],
                              ["width", "22px"], ["height", "22px"],
                              ...pos.split(";").map(p => p.split(":").map(s => s.trim())),
                              ...borders.split(";").map(b => {
                                const [k, v] = b.split(":").map(s => s.trim())
                                return [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]
                              }),
                            ] as any)} />
                          ))}
                        </div>
                        <div style={{ position: "absolute", bottom: "1rem", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "1rem" }}>
                          <button type="button" onClick={stopCamera} className="nav-btn"
                            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1.25rem", borderRadius: "999px" }}>
                            Cancel
                          </button>
                          <button type="button" onClick={capturePhoto} className="nav-btn"
                            style={{ background: "linear-gradient(135deg,#34d399,#10b981)", border: "none", color: "#fff", fontWeight: 800, fontSize: "0.875rem", padding: "0.65rem 1.75rem", borderRadius: "999px", boxShadow: "0 8px 24px rgba(52,211,153,0.5)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Camera size={16} /> Capture
                          </button>
                        </div>
                      </div>
                    )}

                    {!cameraOpen && photoPreview && (
                      <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", marginBottom: "1rem", border: "1px solid rgba(52,211,153,0.3)" }}>
                        <img src={photoPreview} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button type="button" className="nav-btn"
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                          style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(239,68,68,0.85)", backdropFilter: "blur(8px)", color: "#fff", fontWeight: 700, fontSize: "0.72rem", padding: "0.4rem 0.875rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Trash2 size={12} /> Retake
                        </button>
                      </div>
                    )}

                    {!cameraOpen && !photoPreview && (
                      <button type="button" onClick={openCamera} className="nav-btn"
                        style={{ width: "100%", aspectRatio: "16/9", border: "2px dashed rgba(52,211,153,0.25)", borderRadius: "16px", marginBottom: "1rem", background: "rgba(52,211,153,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "rgba(52,211,153,0.65)" }}>
                        <Camera size={36} />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Open Camera</span>
                      </button>
                    )}
                    {cameraError && <p style={{ color: "#ef4444", fontSize: "0.78rem", fontWeight: 600, margin: "0.5rem 0 0" }}>{cameraError}</p>}
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>

                  {/* Details */}
                  <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Category <span style={{ color: "#ef4444" }}>*</span></label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        {PHOTO_CATEGORIES.map(cat => (
                          <button key={cat.id} type="button" className="cat-btn"
                            onClick={() => setPhotoCategory(cat.id)}
                            style={{
                              padding: "0.625rem 0.75rem", borderRadius: "12px",
                              fontSize: "0.78rem", fontWeight: 600, textAlign: "left",
                              background: photoCategory === cat.id ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${photoCategory === cat.id ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
                              color: photoCategory === cat.id ? "#34d399" : "rgba(255,255,255,0.5)",
                              boxShadow: photoCategory === cat.id ? "0 0 12px rgba(52,211,153,0.12)" : "none",
                            }}>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Contact Info <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="text" required placeholder="Phone number, email, or name" className="input-focus" style={darkInput}
                        value={photoContactInfo} onChange={e => setPhotoContactInfo(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Caption (Context, Action, Mood, Background, Setting) <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea required placeholder="e.g. Busy morning at the local market, vendor looking happy while selling fresh vegetables." className="input-focus" style={{ ...darkTextarea, height: 96 }}
                        value={photoNotes} onChange={e => setPhotoNotes(e.target.value)} />
                    </div>

                    {/* Optional Audio */}
                    <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem" }}>
                      <label style={labelStyle}>Optional Audio Context</label>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        Record a short description of the scene in your local dialect.
                      </p>
                      <select className="input-focus" style={{ ...darkSelect, marginBottom: "0.75rem" }}
                        value={photoAudioLanguage || languageId}
                        onChange={e => setPhotoAudioLanguage(e.target.value)}>
                        {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                      
                      {photoAudioUrl ? (
                        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <button type="button" onClick={togglePlaybackPhotoAudio} className="nav-btn"
                              style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#a78bfa,#8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "none", boxShadow: "0 4px 12px rgba(167,139,250,0.3)" }}>
                              {photoAudioPlaying ? <div style={{ width: 12, height: 12, background: "#fff", borderRadius: "2px" }} /> : <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M0 0L14 8L0 16V0Z" /></svg>}
                            </button>
                            <div>
                              <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.8rem", margin: 0 }}>Recording saved</p>
                              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", margin: 0 }}>Ready to upload</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => { setPhotoAudioUrl(null); setPhotoAudioBlob(null); setPhotoAudioTimer(0) }} className="nav-btn" style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : isRecordingPhotoAudio ? (
                        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "14px", padding: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                            <span style={{ color: "#f8fafc", fontWeight: 800, fontSize: "1.5rem", fontVariantNumeric: "tabular-nums" }}>
                              {Math.floor(photoAudioTimer / 60)}:{(photoAudioTimer % 60).toString().padStart(2, "0")}
                            </span>
                          </div>
                          <button type="button" className="nav-btn" onClick={stopRecordingPhotoAudio}
                            style={{ background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1.5rem", borderRadius: "999px", border: "none", boxShadow: "0 4px 12px rgba(239,68,68,0.4)" }}>
                            Stop Recording
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="nav-btn" onClick={startRecordingPhotoAudio}
                          style={{ width: "100%", background: "rgba(167,139,250,0.08)", border: "1px dashed rgba(167,139,250,0.4)", color: "#a78bfa", fontWeight: 700, fontSize: "0.8rem", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                          <Mic size={16} /> Record Audio Context
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════ ANNOTATION FORM ══════════════════ */}
              {selectedTaskType === "ANNOTATION" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                  {/* Image upload */}
                  <div style={glassCard}>
                    <label style={labelStyle}>🖼️ Upload Image <span style={{ color: "#ef4444" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <input type="file" accept="image/*" required={!annotationImageFile}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) { setAnnotationImageFile(file); setAnnotationImagePreview(URL.createObjectURL(file)) }
                        }}
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 2 }} />
                      <div style={{
                        border: `2px dashed ${annotationImageFile ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "16px", padding: "2rem",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
                        background: annotationImageFile ? "rgba(96,165,250,0.05)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.2s",
                      }}>
                        <Tag size={34} color={annotationImageFile ? "#60a5fa" : "rgba(255,255,255,0.2)"} />
                        <span style={{ color: annotationImageFile ? "#60a5fa" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "0.82rem" }}>
                          {annotationImageFile ? annotationImageFile.name : "Tap to choose an image"}
                        </span>
                      </div>
                    </div>

                    {annotationImagePreview && (
                      <div style={{ marginTop: "0.875rem", position: "relative", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(96,165,250,0.25)" }}>
                        <img src={annotationImagePreview} alt="To annotate" style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }} />
                        <button type="button" className="nav-btn"
                          onClick={() => { setAnnotationImageFile(null); setAnnotationImagePreview(null) }}
                          style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(239,68,68,0.85)", backdropFilter: "blur(8px)", color: "#fff", fontWeight: 700, fontSize: "0.72rem", padding: "0.4rem 0.875rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Object labels */}
                  <div style={glassCard}>
                    <label style={labelStyle}>Object Labels <span style={{ color: "#ef4444" }}>*</span></label>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", margin: "0 0 0.875rem", lineHeight: 1.5 }}>
                      Type each object you see in the image and press Enter or "+". Be specific — e.g. "motorcycle", "water pump", "wooden stall".
                    </p>

                    {/* Label input row */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem" }}>
                      <input type="text" placeholder="e.g. motorcycle, tree, shop sign…"
                        className="input-focus" style={{ ...darkInput, flex: 1 }}
                        value={annotationLabelsInput}
                        onChange={e => setAnnotationLabelsInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLabel() } }}
                      />
                      <button type="button" className="nav-btn" onClick={addLabel}
                        style={{
                          width: 42, height: 42, borderRadius: "12px", flexShrink: 0,
                          background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)",
                          color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Label tag cloud */}
                    {annotationLabelTags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {annotationLabelTags.map(lbl => (
                          <span key={lbl} className="lbl-tag"
                            onClick={() => removeLabel(lbl)}
                            style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }}>
                            {lbl}
                            <X size={11} />
                          </span>
                        ))}
                      </div>
                    )}
                    {annotationLabelTags.length === 0 && (
                      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem", margin: 0 }}>No labels added yet.</p>
                    )}
                  </div>

                  {/* Scene & description */}
                  <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Scene Type</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                        {SCENE_TYPES.map(s => (
                          <button key={s.id} type="button" className="cat-btn"
                            onClick={() => setAnnotationSceneType(s.id)}
                            style={{
                              padding: "0.5rem 0.5rem", borderRadius: "10px",
                              fontSize: "0.72rem", fontWeight: 600, textAlign: "center",
                              background: annotationSceneType === s.id ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${annotationSceneType === s.id ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                              color: annotationSceneType === s.id ? "#60a5fa" : "rgba(255,255,255,0.45)",
                            }}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Scene Description <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea required placeholder="Describe what is happening in the image — e.g. A market stall selling vegetables on a busy street."
                        className="input-focus" style={{ ...darkTextarea, height: 96 }}
                        value={annotationDescription} onChange={e => setAnnotationDescription(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Annotator Notes (optional)</label>
                      <textarea placeholder="Any additional context, ambiguities, or quality notes…"
                        className="input-focus" style={{ ...darkTextarea, height: 72 }}
                        value={annotationNotes} onChange={e => setAnnotationNotes(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
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
              <button type="submit"
                disabled={status === "uploading" || status === "submitting" || gettingLocation || (selectedTaskType === "PHOTO" && !location)}
                className="nav-btn"
                style={{
                  width: "100%", padding: "1rem", borderRadius: "18px",
                  fontWeight: 900, fontSize: "1rem", fontFamily: "inherit", border: "none",
                  background: (status === "uploading" || status === "submitting" || gettingLocation || (selectedTaskType === "PHOTO" && !location))
                    ? "rgba(255,255,255,0.05)"
                    : `linear-gradient(135deg, ${activeMeta?.color}, ${activeMeta?.color}bb)`,
                  color: (status === "uploading" || status === "submitting" || gettingLocation || (selectedTaskType === "PHOTO" && !location))
                    ? "rgba(255,255,255,0.3)" : "#fff",
                  boxShadow: (status === "uploading" || status === "submitting" || gettingLocation || (selectedTaskType === "PHOTO" && !location))
                    ? "none" : `0 12px 32px ${activeMeta?.glow}`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  cursor: (status === "uploading" || status === "submitting" || gettingLocation || (selectedTaskType === "PHOTO" && !location)) ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  position: "sticky", bottom: "1.5rem",
                }}>
                {status === "uploading" ? (
                  <><RefreshCw size={17} style={{ animation: "spin 0.8s linear infinite" }} /> Uploading…</>
                ) : status === "submitting" ? (
                  <><RefreshCw size={17} style={{ animation: "spin 0.8s linear infinite" }} /> Saving…</>
                ) : gettingLocation ? (
                  <>⏳ Awaiting GPS…</>
                ) : (selectedTaskType === "PHOTO" && !location) ? (
                  <>📍 GPS Required</>
                ) : (
                  <><Send size={17} /> Submit {activeMeta?.badge}</>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
