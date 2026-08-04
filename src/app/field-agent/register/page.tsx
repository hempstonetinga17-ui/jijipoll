"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { Mic, FileText, Camera, Search, MessageSquare, Check, ArrowRight, Globe, Zap, Shield, UserPlus } from "lucide-react"

const LANGUAGES = [
  { code: "EN", name: "English",  native: "English"   },
  { code: "SW", name: "Swahili",  native: "Kiswahili" },
  { code: "KI", name: "Kikuyu",   native: "Gĩkũyũ"    },
  { code: "LU", name: "Luo",      native: "Dholuo"    },
  { code: "KA", name: "Kalenjin", native: "Kalenjin"  },
  { code: "KM", name: "Kamba",    native: "Kikamba"   },
  { code: "LH", name: "Luhya",    native: "Luluhya"   },
  { code: "ME", name: "Meru",     native: "Kimeru"    },
]

const TASK_SHOWCASES = [
  { icon: Mic,      color: "#f06135", bg: "rgba(240,97,53,0.08)", border: "rgba(240,97,53,0.2)", title: "Record speech & sentences", desc: "Earn by speaking in your language" },
  { icon: FileText, color: "#c0392b", bg: "rgba(192,57,43,0.08)",  border: "rgba(192,57,43,0.2)",  title: "Type & translate text",      desc: "Earn by writing & translating"    },
  { icon: Camera,   color: "#e67e22", bg: "rgba(230,126,34,0.08)",  border: "rgba(230,126,34,0.2)",  title: "Capture storefronts & places", desc: "Earn by photographing locations" },
]

export default function AgentRegister() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState<"LANGUAGE" | "INFO" | "REGISTER">("LANGUAGE")
  const [selectedLang, setSelectedLang] = useState("EN")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/field-agent/dashboard")
    }
  }, [status, router])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: "AGENT",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.")
      } else {
        router.push("/field-agent/login?registered=1")
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredLanguages = LANGUAGES.filter(
    lang =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeLangObj = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #faf8f5 0%, #fef3ec 60%, #fde8d8 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "1.5rem 1rem",
      fontFamily: "'Manrope', 'Inter', -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease forwards; }
        .btn-main { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; border: none; }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(240,97,53,0.3) !important; }
        .btn-main:active { transform: scale(0.97); }
        .lang-item { transition: all 0.15s ease; cursor: pointer; border: none; background: none; }
        .lang-item:hover { background: rgba(240,97,53,0.06) !important; border-color: rgba(240,97,53,0.3) !important; }
        input:focus { outline: none; border-color: rgba(240,97,53,0.5) !important; box-shadow: 0 0 0 3px rgba(240,97,53,0.12) !important; }
      `}</style>

      {/* Decorative orbs */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,97,53,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,97,53,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* WhatsApp Support */}
      <a
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 50,
          width: 48, height: 48, borderRadius: "14px",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          transition: "transform 0.2s",
          textDecoration: "none",
        }}
        title="WhatsApp Support"
      >
        <MessageSquare size={20} color="#fff" />
      </a>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }} className="fade-up">
        <img src="/rieng_logo.jpg" alt="Rieng" style={{ height: 40, width: 40, borderRadius: "12px", objectFit: "cover" }} />
        <div>
          <div style={{ color: "#1a1a1a", fontWeight: 800, fontSize: "1.1rem", lineHeight: 1, fontFamily: "'DM Serif Display', Georgia, serif" }}>Rieng</div>
          <div style={{ color: "#f06135", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Agent Portal</div>
        </div>
      </div>

      {/* Card */}
      <div
        className="fade-up"
        style={{
          width: "100%", maxWidth: 420,
          background: "#ffffff",
          border: "1px solid rgba(240,97,53,0.12)",
          borderRadius: "24px",
          padding: "1.75rem",
          boxShadow: "0 24px 60px rgba(240,97,53,0.08), 0 4px 16px rgba(0,0,0,0.06)",
          minHeight: 500,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
          {["LANGUAGE", "INFO", "REGISTER"].map((s, i) => (
            <div key={s} style={{
              width: step === s ? 24 : 8, height: 8, borderRadius: "999px",
              background: step === s
                ? "linear-gradient(90deg, #f06135, #e05520)"
                : ["LANGUAGE", "INFO", "REGISTER"].indexOf(step) > i
                  ? "rgba(240,97,53,0.4)"
                  : "rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* ── STEP 1: Language ────────────────────── */}
        {step === "LANGUAGE" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "18px",
                background: "rgba(240,97,53,0.08)", border: "1px solid rgba(240,97,53,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
              }}>
                <Globe size={28} color="#f06135" />
              </div>
              <h2 style={{ color: "#1a1a1a", fontWeight: 800, fontSize: "1.3rem", margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>Choose Your Language</h2>
              <p style={{ color: "#888", fontSize: "0.78rem", marginTop: "0.4rem" }}>
                We support 8+ languages for your work
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "0.875rem" }}>
              <Search size={15} color="#bbb" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search language…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.65rem", paddingBottom: "0.65rem",
                  background: "#faf8f5", border: "1px solid #e8e0d8",
                  borderRadius: "12px", color: "#1a1a1a", fontSize: "0.85rem",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>

            {/* Language list */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 260, paddingRight: "2px" }}>
              {filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  className="lang-item"
                  onClick={() => setSelectedLang(lang.code)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem 1rem", borderRadius: "12px",
                    background: selectedLang === lang.code ? "rgba(240,97,53,0.06)" : "#faf8f5",
                    border: `1px solid ${selectedLang === lang.code ? "rgba(240,97,53,0.3)" : "#e8e0d8"}`,
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      background: "rgba(240,97,53,0.08)", color: "#f06135",
                      fontSize: "0.65rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px",
                      letterSpacing: "0.05em",
                    }}>{lang.code}</span>
                    <span style={{ color: "#333", fontWeight: 600, fontSize: "0.88rem" }}>{lang.native}</span>
                  </div>
                  {selectedLang === lang.code && (
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "linear-gradient(135deg, #f06135, #e05520)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              className="btn-main"
              onClick={() => setStep("INFO")}
              style={{
                marginTop: "1.25rem", width: "100%",
                background: "linear-gradient(135deg, #f06135, #e05520)",
                color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                padding: "0.875rem", borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                boxShadow: "0 4px 20px rgba(240,97,53,0.35)",
              }}
            >
              Continue in {activeLangObj.name} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Task Showcase ───────────────── */}
        {step === "INFO" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "18px",
                background: "rgba(240,97,53,0.08)", border: "1px solid rgba(240,97,53,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
              }}>
                <Zap size={28} color="#f06135" />
              </div>
              <h2 style={{ color: "#1a1a1a", fontWeight: 800, fontSize: "1.25rem", margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>Simple Tasks. Real Earnings.</h2>
              <p style={{ color: "#888", fontSize: "0.78rem", marginTop: "0.4rem" }}>
                Work from your smartphone and get paid
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {TASK_SHOWCASES.map(task => {
                const Icon = task.icon
                return (
                  <div key={task.title} style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    background: task.bg, border: `1px solid ${task.border}`,
                    borderRadius: "14px", padding: "0.875rem 1rem",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "12px",
                      background: task.bg, border: `1px solid ${task.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={20} color={task.color} />
                    </div>
                    <div>
                      <p style={{ color: "#1a1a1a", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>{task.title}</p>
                      <p style={{ color: "#888", fontSize: "0.72rem", margin: "0.15rem 0 0" }}>{task.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button
                className="btn-main"
                onClick={() => setStep("REGISTER")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #f06135, #e05520)",
                  color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                  padding: "0.875rem", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  boxShadow: "0 4px 20px rgba(240,97,53,0.35)",
                }}
              >
                Sign Up Now <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setStep("LANGUAGE")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#aaa", fontSize: "0.78rem", fontWeight: 600,
                  padding: "0.5rem",
                }}
              >
                ← Change Language
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Register ──────────────────────── */}
        {step === "REGISTER" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", margin: "-1.75rem", padding: "1.75rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div style={{
                width: 50, height: 50, borderRadius: "16px",
                background: "rgba(240,97,53,0.08)", border: "1px solid rgba(240,97,53,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 0.75rem",
              }}>
                <UserPlus size={24} color="#f06135" />
              </div>
              <h2 style={{ color: "#1a1a1a", fontWeight: 800, fontSize: "1.15rem", margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>Create Account</h2>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem", flex: 1 }}>
              <div>
                <label style={{ display: "block", color: "#888", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.65rem 1rem",
                    background: "#faf8f5", border: "1px solid #e8e0d8",
                    borderRadius: "10px", color: "#1a1a1a", fontSize: "0.85rem",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", color: "#888", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="agent@example.com"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.65rem 1rem",
                    background: "#faf8f5", border: "1px solid #e8e0d8",
                    borderRadius: "10px", color: "#1a1a1a", fontSize: "0.85rem",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#888", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+254..."
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.65rem 1rem",
                    background: "#faf8f5", border: "1px solid #e8e0d8",
                    borderRadius: "10px", color: "#1a1a1a", fontSize: "0.85rem",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#888", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.65rem 1rem",
                    background: "#faf8f5", border: "1px solid #e8e0d8",
                    borderRadius: "10px", color: "#1a1a1a", fontSize: "0.85rem",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "10px", padding: "0.65rem 1rem", marginTop: "0.25rem",
                  color: "#dc2626", fontSize: "0.75rem", fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-main"
                style={{
                  width: "100%", marginTop: "0.5rem",
                  background: loading ? "rgba(240,97,53,0.3)" : "linear-gradient(135deg, #f06135, #e05520)",
                  color: "#fff", fontWeight: 800, fontSize: "0.9rem",
                  padding: "0.875rem", borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(240,97,53,0.35)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  border: "none",
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    Registering…
                  </>
                ) : (
                  <>Sign Up <ArrowRight size={16} /></>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <Link href="/field-agent/login" style={{ color: "#f06135", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                  Already have an account? <span style={{ textDecoration: "underline" }}>Log in</span>
                </Link>
              </div>
            </form>

            <button
              onClick={() => setStep("INFO")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ccc", fontSize: "0.75rem", fontWeight: 600,
                marginTop: "1rem", padding: "0.25rem",
              }}
            >
              ← Go Back
            </button>
          </div>
        )}
      </div>

      <p style={{ color: "#bbb", fontSize: "0.65rem", fontWeight: 500, marginTop: "1.25rem", textAlign: "center" }}>
        © 2025 Rieng. All rights reserved.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
