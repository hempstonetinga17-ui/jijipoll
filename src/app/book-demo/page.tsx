"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const LandingMap = dynamic(() => import("@/components/LandingMap"), { ssr: false })

export default function BookDemoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organisation: "",
    website: ""
  });
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isFormValid = formData.name.trim() !== "" && 
                      formData.email.trim() !== "" && 
                      formData.organisation.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/book-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit demo booking");
      }

      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again or contact us directly.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f06135]">
      {/* Live map background */}
      <div className="absolute inset-0 z-0 mix-blend-luminosity">
        <LandingMap />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-[#f06135]/60" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg mx-4 sm:mx-auto py-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          {/* Close */}
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Back to home"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src="/kijijipoll.png" alt="Kijijipoll Logo" className="h-12 w-auto mb-3" style={{ filter: "brightness(0)", mixBlendMode: "multiply" }} />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center">
              Book a meeting
            </h1>
            <p className="text-white/80 text-sm mt-2 text-center max-w-sm leading-relaxed">
              Grab 15 minutes with <strong>Hempstone</strong>. Pick a time that suits you and we’ll walk you through what Kijijipoll can do for your market — live, with real data.
            </p>
          </div>

          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Request Received!</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                We've sent your details to Hempstone. He'll be in touch shortly to confirm a time for your demo.
              </p>
              <button 
                onClick={() => {
                  setStatus("idle");
                  setFormData({ name: "", email: "", organisation: "", website: "" });
                }}
                className="text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-white/30 hover:decoration-white transition-all text-sm"
              >
                Book another meeting
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-white/90 mb-1 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition backdrop-blur-sm shadow-inner"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-white/90 mb-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition backdrop-blur-sm shadow-inner"
                  required
                />
              </div>

              <div>
                <label htmlFor="organisation" className="block text-xs font-bold text-white/90 mb-1 uppercase tracking-wider">Organisation</label>
                <input
                  type="text"
                  id="organisation"
                  placeholder="Acme Media"
                  value={formData.organisation}
                  onChange={(e) => setFormData({...formData, organisation: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition backdrop-blur-sm shadow-inner"
                  required
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-xs font-bold text-white/90 mb-1 uppercase tracking-wider">
                  Website / LinkedIn <span className="text-white/50 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  id="website"
                  placeholder="https://acme.co.za"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition backdrop-blur-sm shadow-inner"
                />
              </div>
              
              {status === "error" && (
                <div className="text-red-200 text-sm bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || status === "submitting"}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-xl flex justify-center items-center gap-2 ${
                    isFormValid 
                      ? 'bg-white text-gray-900 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]' 
                      : 'bg-white/30 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {status === "submitting" ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Book an appointment"
                  )}
                </button>
                <p className="text-center text-xs text-white/50 mt-4 leading-relaxed">
                  Fill in your name, email and organisation to unlock the scheduler. <br/>By submitting, you agree to our <a href="/privacy-policy" className="underline hover:text-white transition">Privacy Policy</a>.
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

