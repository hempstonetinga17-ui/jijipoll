"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import StatWidget from "@/components/StatWidget"
import Link from "next/link"

const LandingMap = dynamic(() => import("@/components/LandingMap"), { ssr: false })

export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="relative w-full h-screen overflow-hidden bg-[#f06135]">
        {/* Dynamic Map Background */}
        <div className="absolute inset-0 z-0 mix-blend-luminosity">
          <LandingMap />
        </div>

        {/* Header / Navigation */}
        <header className="absolute top-0 left-0 w-full z-20 px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-black text-xl sm:text-3xl tracking-tighter drop-shadow-md">
            <img src="/jijipoll.png" alt="Jijipoll Logo" className="h-8 sm:h-10 w-auto" style={{ filter: "brightness(0) invert(1)", mixBlendMode: "screen" }} />
            JIJIPOLL
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-white font-semibold">
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-white/80 transition py-2">
                Solutions
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left flex flex-col overflow-hidden border border-gray-100">
                <Link href="/solutions/targeted-advertising" className="px-5 py-3 text-gray-800 hover:bg-[#f06135] hover:text-white transition-colors text-sm font-medium">Targeted Advertising</Link>
                <Link href="/solutions/market-segmentation" className="px-5 py-3 text-gray-800 hover:bg-[#f06135] hover:text-white transition-colors text-sm font-medium">Market Segmentation</Link>
                <Link href="/solutions/location-intelligence" className="px-5 py-3 text-gray-800 hover:bg-[#f06135] hover:text-white transition-colors text-sm font-medium">Location Intelligence</Link>
                <Link href="/solutions/route-planning-and-optimization" className="px-5 py-3 text-gray-800 hover:bg-[#f06135] hover:text-white transition-colors text-sm font-medium">Route Planning & Optimization</Link>
              </div>
            </div>
            <Link href="/about" className="hover:text-white/80 transition py-2">About Us</Link>
            <Link href="/contact" className="hover:text-white/80 transition py-2">Contact Us</Link>
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex gap-3 items-center">
            <Link href="/login" className="text-white font-semibold hover:text-white/80 transition drop-shadow-md text-sm lg:text-base">
              Log In
            </Link>
            <Link href="/login" className="bg-white text-[#f06135] px-4 lg:px-6 py-2.5 rounded-full font-bold hover:bg-gray-100 transition shadow-xl text-sm lg:text-base">
              Sign Up
            </Link>
          </div>

          {/* Mobile: Login + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/login" className="text-white font-bold text-sm drop-shadow-md">Log In</Link>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="text-white p-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Slide-down Nav */}
        {mobileNavOpen && (
          <div className="absolute top-16 left-0 right-0 z-30 bg-[#1a0a00]/95 backdrop-blur-md border-b border-white/10 flex flex-col py-4 px-6 gap-1">
            {/* Solutions accordion */}
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className="flex items-center justify-between text-white font-semibold py-3 border-b border-white/10"
            >
              Solutions
              <svg className={`w-4 h-4 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {solutionsOpen && (
              <div className="flex flex-col pl-4 gap-1 py-1">
                {[
                  ["Targeted Advertising", "/solutions/targeted-advertising"],
                  ["Market Segmentation", "/solutions/market-segmentation"],
                  ["Location Intelligence", "/solutions/location-intelligence"],
                  ["Route Planning & Optimization", "/solutions/route-planning-and-optimization"],
                ].map(([label, href]) => (
                  <Link key={href} href={href} onClick={() => setMobileNavOpen(false)}
                    className="text-white/70 hover:text-white py-2 text-sm font-medium transition">
                    {label}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/about" onClick={() => setMobileNavOpen(false)} className="text-white font-semibold py-3 border-b border-white/10">About Us</Link>
            <Link href="/contact" onClick={() => setMobileNavOpen(false)} className="text-white font-semibold py-3 border-b border-white/10">Contact Us</Link>
            <Link href="/login" onClick={() => setMobileNavOpen(false)}
              className="mt-3 bg-white text-[#f06135] px-6 py-3 rounded-full font-bold text-center hover:bg-gray-100 transition shadow-xl">
              Sign Up Free
            </Link>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute top-[25%] sm:top-[30%] left-0 right-0 z-20 px-6 sm:px-10 max-w-xl sm:max-w-2xl drop-shadow-lg">
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3 pointer-events-none">
            Map Any Market.<br />Find Any Business.
          </h1>
          <p className="text-white/90 text-sm sm:text-base font-medium mb-5 sm:mb-6 pointer-events-none max-w-lg">
            From investors tracking niche industries to researchers mapping territories, Jijipoll transforms raw geographic data into the strategic location intelligence you need to execute.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/login"
              className="bg-[#1a0a00] text-white px-6 sm:px-8 py-3 rounded-full font-bold hover:bg-black transition shadow-xl border border-transparent hover:border-white/20 text-sm sm:text-base">
              Get Started
            </Link>
            <Link href="/about"
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 sm:px-8 py-3 rounded-full font-bold hover:bg-white/20 transition shadow-xl text-sm sm:text-base">
              About Us
            </Link>
          </div>
        </div>

        {/* Stat Widgets */}
        <div className="absolute bottom-4 sm:bottom-10 left-0 right-0 sm:right-10 sm:left-auto z-20 flex justify-center sm:justify-end gap-3 sm:gap-6 px-4 sm:px-0">
          <StatWidget value="100K+" label="Businesses Registered" bgColor="#d35400" />
          <StatWidget value="45+" label="Counties" bgColor="#a8e6cf" />
          <StatWidget value="120+" label="Field Agents" bgColor="#bdc3c7" />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)",
        borderTop: "1px solid rgba(240,97,53,0.2)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.25rem 2rem" }}>
          {/* Footer grid — 1 col mobile, 4 col desktop */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
            className="sm:footer-grid"
          >
            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <img src="/jijipoll.png" alt="Jijipoll Logo" style={{ height: "36px", width: "auto", filter: "brightness(0) invert(1)", mixBlendMode: "screen" }} />
                <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>JIJIPOLL</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: "1.6", maxWidth: "280px" }}>
                Africa's leading field intelligence platform. Mapping businesses, empowering decisions, transforming markets across 45+ counties.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                {/* Twitter/X */}
                <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f06135", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.15)"; }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                {/* LinkedIn */}
                <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f06135", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.15)"; }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                {/* Facebook */}
                <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f06135", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.15)"; }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ color: "#f06135", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Product</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["Field Map", "Agent Management", "Territory Planning", "Reports & Analytics", "CRM Integration"].map(item => (
                  <li key={item}>
                    <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ color: "#f06135", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Company</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["About Us", "Blog", "Careers", "Press Kit", "Contact"].map(item => (
                  <li key={item}>
                    <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 style={{ color: "#f06135", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Support</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {["Documentation", "API Reference", "Community", "Status", "Privacy Policy"].map(item => (
                  <li key={item}>
                    <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(240,97,53,0.15)", margin: "0 0 1.5rem" }} />

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", margin: 0 }}>
              © {new Date().getFullYear()} Jijipoll Technologies Ltd. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {["Terms of Service", "Privacy Policy", "Cookie Policy"].map(item => (
                <a key={item} href="#" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 640px) {
          .sm\\:footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </div>
  )
}
