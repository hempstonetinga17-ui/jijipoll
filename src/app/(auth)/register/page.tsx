"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    latitude: "",
    longitude: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Normally we would POST to an API route to register the user and business
    alert("Registration submitted! In a real app, this would save to the database.")
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f06135]">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Register Business</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 mb-1 text-sm">Company Name</label>
            <input 
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="E.g., Oceanic Fish Sellers"
            />
          </div>
          <div>
            <label className="block text-white/80 mb-1 text-sm">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="company@example.com"
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
            className="w-full bg-white text-[#f06135] font-bold py-3 rounded-lg hover:bg-white/90 transition duration-300 mt-6 shadow-lg"
          >
            Create Account
          </button>
        </form>
        <p className="text-white/70 text-center mt-6 text-sm">
          Already have an account? <a href="/login" className="text-white font-semibold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  )
}
