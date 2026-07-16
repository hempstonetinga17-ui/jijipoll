"use client"
import dynamic from "next/dynamic"
import StatWidget from "@/components/StatWidget"
import Link from "next/link"

const LandingMap = dynamic(() => import("@/components/LandingMap"), { ssr: false })

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
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

      {/* Footer */}
      <footer style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)",
        borderTop: "1px solid rgba(240,97,53,0.2)",
      }}>
        {/* Main footer content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "2.5rem" }}>

            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <img src="/jijipoll.png" alt="Jijipoll Logo" style={{ height: "36px", width: "auto" }} />
                <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>JIJIPOLL</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: "1.6", maxWidth: "280px" }}>
                Africa's leading field intelligence platform. Mapping businesses, empowering decisions, transforming markets across 45+ countries.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                {/* Twitter/X */}
                <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f06135", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.15)"; }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f06135", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.15)"; }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                {/* Facebook */}
                <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(240,97,53,0.15)", border: "1px solid rgba(240,97,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f06135", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.15)"; }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
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
            <div style={{ display: "flex", gap: "1.5rem" }}>
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
    </div>
  )
}
