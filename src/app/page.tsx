"use client"
import dynamic from "next/dynamic"
import StatWidget from "@/components/StatWidget"
import Link from "next/link"

const LandingMap = dynamic(() => import("@/components/LandingMap"), { ssr: false })

export default function HomePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#f06135]">
      {/* Dynamic Map Background */}
      <div className="absolute inset-0 z-0 mix-blend-luminosity">
        <LandingMap />
      </div>

      {/* Header / Navigation */}
      <header className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3 text-white font-black text-3xl tracking-tighter drop-shadow-md">
          <img src="/jijipoll.png" alt="Jijipoll Logo" className="h-10 w-auto" />
          JIJIPOLL
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-white font-semibold hover:text-white/80 transition drop-shadow-md">
            Log In
          </Link>
          <Link href="/register" className="bg-white text-[#f06135] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-xl">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <div className="absolute top-1/3 left-10 z-20 max-w-lg pointer-events-none drop-shadow-lg">
        <h1 className="text-5xl font-black text-white leading-tight mb-4">
          Locate Every Business, <br/> Everywhere.
        </h1>
        <p className="text-white/90 text-lg font-medium">
          Whether you're an investor looking for fish sellers or a researcher plotting out territories, Jijipoll gives you the geographic insights you need.
        </p>
      </div>

      {/* Stat Widgets overlay */}
      <div className="absolute bottom-10 right-10 z-20 flex gap-4 sm:gap-6 origin-bottom-right">
        <StatWidget value="100K+" label="Businesses Registered" bgColor="#d35400" />
        <StatWidget value="45+" label="Countries" bgColor="#a8e6cf" />
        <StatWidget value="1000+" label="Surveyors" bgColor="#bdc3c7" />
      </div>
    </main>
  )
}
