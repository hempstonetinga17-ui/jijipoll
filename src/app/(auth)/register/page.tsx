"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<"Company" | "Individual">("Company")
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    latitude: "",
    longitude: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          accountType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Something went wrong")
      }

      // Registration successful
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f06135] py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20 relative">
        <button 
          onClick={() => router.push('/')}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="Cancel and go back to landing page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create an Account</h2>
        
        {/* Account Type Toggle */}
        <div className="flex bg-white/20 rounded-lg p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              accountType === "Company" ? "bg-white text-[#f06135] shadow" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setAccountType("Company")}
          >
            Company
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              accountType === "Individual" ? "bg-white text-[#f06135] shadow" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setAccountType("Individual")}
          >
            Individual
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {accountType === "Company" && (
            <div>
              <label className="block text-white/80 mb-1 text-sm">Company Name</label>
              <input 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required={accountType === "Company"}
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="E.g., Oceanic Fish Sellers"
              />
            </div>
          )}
          <div>
            <label className="block text-white/80 mb-1 text-sm">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-white/80 mb-1 text-sm">Password</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 mb-1 text-sm">Latitude</label>
              <input 
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="-1.2921"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-1 text-sm">Longitude</label>
              <input 
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="36.8219"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#f06135] font-bold py-3 rounded-lg hover:bg-white/90 transition duration-300 mt-6 shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center space-x-2">
          <span className="h-px w-full bg-white/30"></span>
          <span className="text-white/70 text-sm">or</span>
          <span className="h-px w-full bg-white/30"></span>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/field-map" })}
          className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-100 transition duration-300 mt-4 shadow-lg flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <p className="text-white/70 text-center mt-6 text-sm">
          Already have an account? <a href="/login" className="text-white font-semibold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  )
}

