"use client"
import dynamic from "next/dynamic"
import StatWidget from "@/components/StatWidget"
import Link from "next/link"

const LandingMap = dynamic(() => import("@/components/LandingMap"), { ssr: false })

export default function HomePage() {
  return (
    <main style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f06135' }}>
      {/* Dynamic Map Background */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, mixBlendMode: 'luminosity' }}>
        <LandingMap />
      </div>

      {/* Header / Navigation */}
      <header style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 20, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontWeight: 900, fontSize: '1.875rem', letterSpacing: '-0.05em', textShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>JIJIPOLL</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'white', fontWeight: 600, textDecoration: 'none', textShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'color 0.2s', padding: '0.75rem 1rem' }}>
            Log In
          </Link>
          <Link href="/register" style={{ backgroundColor: 'white', color: '#f06135', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', transition: 'background-color 0.2s' }}>
            Register Business
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <div style={{ position: 'absolute', top: '33%', left: '2.5rem', zIndex: 20, maxWidth: '32rem', pointerEvents: 'none', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.2))' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 1rem' }}>
          Locate Every Business, <br/> Everywhere.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
          Whether you're an investor looking for fish sellers or a researcher plotting out territories, Jijipoll gives you the geographic insights you need.
        </p>
      </div>

      {/* Stat Widgets overlay */}
      <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', zIndex: 20, display: 'flex', gap: '1rem', transformOrigin: 'bottom right' }}>
        <StatWidget value="120+" label="Countries" bgColor="#d35400" />
        <StatWidget value="73" label="Languages" bgColor="#a8e6cf" />
        <StatWidget value="10K+" label="Interviewers" bgColor="#bdc3c7" />
      </div>
    </main>
  )
}
