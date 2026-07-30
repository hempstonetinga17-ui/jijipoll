"use client"
import { useState } from "react"
import Link from "next/link"

export default function BookDemoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organisation: "",
    website: ""
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid = formData.name.trim() !== "" && 
                      formData.email.trim() !== "" && 
                      formData.organisation.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsSubmitted(true);
      // In a real app, this is where you'd integrate Calendly, Cal.com or another scheduler
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="w-full bg-[#1a0a00] px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-black text-xl tracking-tighter">
          <img src="/jijipoll.png" alt="Jijipoll Logo" className="h-8 w-auto" style={{ filter: "brightness(0) invert(1)", mixBlendMode: "screen" }} />
          JIJIPOLL
        </Link>
        <Link href="/" className="text-white/80 hover:text-white text-sm font-medium transition">
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a demo</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Grab 15 minutes with Phelelani. Pick a time that suits you and we’ll walk you through what Jijipoll can do for your market — live, with real data.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06135] focus:border-[#f06135] outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06135] focus:border-[#f06135] outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                  <input
                    type="text"
                    id="organisation"
                    placeholder="Acme Media"
                    value={formData.organisation}
                    onChange={(e) => setFormData({...formData, organisation: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06135] focus:border-[#f06135] outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Organisation website or LinkedIn <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    id="website"
                    placeholder="https://acme.co.za"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#f06135] focus:border-[#f06135] outline-none transition"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-md ${
                      isFormValid 
                        ? 'bg-[#f06135] text-white hover:bg-[#d35400]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Book an appointment
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Fill in your name, email and organisation to unlock the scheduler.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Details Submitted!</h3>
                <p className="text-gray-600 mb-6">
                  Normally, this would unlock the scheduler (e.g., Calendly iframe). For now, we'll be in touch shortly to confirm your demo time.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#f06135] font-medium hover:underline"
                >
                  Book another demo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
