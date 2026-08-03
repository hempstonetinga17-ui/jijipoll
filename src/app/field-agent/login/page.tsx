"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Mic, FileText, Camera, Search, HelpCircle, MessageSquare } from "lucide-react"

const LANGUAGES = [
  { code: "EN", name: "English", native: "English" },
  { code: "SW", name: "Swahili", native: "Kiswahili" },
  { code: "BN", name: "Bengali", native: "বাংলা" },
  { code: "KN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ML", name: "Malayalam", native: "മലയാളം" },
  { code: "OR", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "TA", name: "Tamil", native: "தமிழ்" },
  { code: "HI", name: "Hindi", native: "हिंदी" },
]

export default function AgentLogin() {
  const router = useRouter()
  const [step, setStep] = useState<"LANGUAGE" | "INFO" | "LOGIN">("LANGUAGE")
  const [selectedLang, setSelectedLang] = useState("EN")
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        redirect: false,
        action: "login",
        email: formData.email,
        password: formData.password,
      })

      if (res?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/field-agent/dashboard")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
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
    <div className="min-h-screen bg-[#f7fbf9] flex flex-col items-center justify-center py-10 px-4 relative">
      
      {/* Floating Support Indicator (Karya style Chatbot screenshot) */}
      <a 
        href="https://wa.me/254700000000" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition z-50 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">Whatsapp Support</span>
      </a>

      <div className="w-full max-w-md bg-white border border-gray-150 rounded-[2.5rem] shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[600px] border-emerald-800/10">

        {/* STEP 1: LANGUAGE SELECTION */}
        {step === "LANGUAGE" && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#1b7348]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.5 3 19" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Supports 12+ Languages</h2>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search Language"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7348]/45 focus:border-[#1b7348]"
                />
              </div>

              {/* Language list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                      selectedLang === lang.code
                        ? 'border-[#1b7348] bg-emerald-50/40 font-bold'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md">{lang.code}</span>
                      <span className="text-gray-900 font-medium">{lang.native}</span>
                    </div>
                    {selectedLang === lang.code && (
                      <div className="w-5 h-5 bg-[#1b7348] text-white rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep("INFO")}
              className="w-full bg-[#1b7348] hover:bg-[#145635] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-6 active:scale-95 transition"
            >
              <span>Continue in {activeLangObj.name}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {/* STEP 2: TASKS SHOWCASE */}
        {step === "INFO" && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Complete Simple Tasks and Earn Money</h2>
                <p className="text-sm text-gray-500 mt-2">Work on small tasks directly from your smartphone.</p>
              </div>

              <div className="space-y-6">
                
                {/* Task Item 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1b7348] flex items-center justify-center shrink-0 border border-emerald-100">
                    <Mic className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-base leading-snug">Record speech & sentences</h3>
                  </div>
                </div>

                {/* Task Item 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1b7348] flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-base leading-snug">Type out sentences describing images & recordings</h3>
                  </div>
                </div>

                {/* Task Item 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1b7348] flex items-center justify-center shrink-0 border border-emerald-100">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-base leading-snug">Outline & mark objects or capture storefronts</h3>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => setStep("LOGIN")}
                className="w-full bg-[#1b7348] hover:bg-[#145635] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button 
                onClick={() => setStep("LANGUAGE")}
                className="text-xs text-gray-500 font-bold hover:underline"
              >
                Go Back / Change Language
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOGIN / AUTH FORM */}
        {step === "LOGIN" && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-center mb-6">
                <img src="/kijijipoll.png" alt="Kijijipoll Logo" className="h-10 w-auto mx-auto mb-3" />
                <h2 className="text-2xl font-black text-[#0f172a]">Agent Sign In</h2>
                <p className="text-xs text-gray-500 mt-1">Access your workspace and submissions</p>
              </div>

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Email address</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#1b7348]/45 focus:border-[#1b7348] text-sm text-gray-900"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#1b7348]/45 focus:border-[#1b7348] text-sm text-gray-900"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl font-bold text-white bg-[#1b7348] hover:bg-[#145635] active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/field-agent/register" className="text-xs font-bold text-[#1b7348] hover:underline">
                  Don't have an account? Create one
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-150 pt-4">
              <div className="text-center text-xs text-gray-400 font-medium mb-3">Or continue with</div>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/field-agent/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-200 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-50 focus:outline-none active:scale-95 transition text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
