"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Data Catalogue", href: "/datasets" },
  { label: "About Us", href: "/about" },
  { label: "Platform", href: "/solutions/location-intelligence" },
]
const IMPACT_LINKS = [
  { label: "Ethical Sourcing", href: "/about" },
  { label: "Language Datasets", href: "/datasets" },
  { label: "Audio Collection", href: "/datasets" },
  { label: "Image Captioning", href: "/datasets" },
]

function RiengLogoMark({ size = 36, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.22),
      background: dark ? "rgba(255,255,255,0.12)" : "#f06135",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width={size * 0.58} height={size * 0.65} viewBox="0 0 21 24" fill="none">
        <path d="M2 2h9.5C14.5 2 17 4.2 17 7.2c0 2.4-1.5 4.4-3.8 5.1L17.8 19c.4.6.1 1.4-.7 1.4H15a1.5 1.5 0 01-1.3-.8L10 13H5.5v6.5A1.5 1.5 0 014 21H3.5A1.5 1.5 0 012 19.5V2z" fill="#fff" />
        <path d="M5.5 5v5H11c1.7 0 3-1.1 3-2.5S12.7 5 11 5H5.5z" fill="#f06135" />
        <path d="M13.5 13l4 6.5" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function MarketingHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [impactOpen, setImpactOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,255,255,0.97)",
      borderBottom: "1px solid #e8e4de",
      backdropFilter: "blur(10px)",
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      transition: "box-shadow 0.3s",
    }}>
      <div style={{
        maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <RiengLogoMark size={34} />
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "1.25rem", letterSpacing: "-0.01em", color: "#1a1a1a" }}>
            Rieng
          </span>
        </Link>

        <nav style={{ alignItems: "center", gap: "0.1rem" }} className="hidden md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} style={{
              padding: "0.45rem 0.8rem", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 600,
              color: label === "Home" ? "#f06135" : "#3a3530",
              textDecoration: "none", transition: "color 0.2s, background 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f06135"; (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.06)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = label === "Home" ? "#f06135" : "#3a3530"; (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >{label}</Link>
          ))}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setImpactOpen(true)}
            onMouseLeave={() => setImpactOpen(false)}
          >
            <button style={{
              display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.45rem 0.8rem",
              borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600, color: "#3a3530",
              background: "none", border: "none", cursor: "pointer",
            }}>
              Impact
              <svg style={{ width: "13px", height: "13px", transition: "transform 0.2s", transform: impactOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {impactOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0,
                background: "#fff", border: "1px solid #e8e4de", borderRadius: "12px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.1)", minWidth: "200px", overflow: "hidden", zIndex: 100,
              }}>
                {IMPACT_LINKS.map(({ label, href }) => (
                  <Link key={label} href={href} style={{
                    display: "block", padding: "0.7rem 1.1rem", fontSize: "0.875rem",
                    fontWeight: 500, color: "#3a3530", textDecoration: "none",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(240,97,53,0.06)"; (e.currentTarget as HTMLElement).style.color = "#f06135" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#3a3530" }}
                  >{label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex">
          <Link href="/contact" style={{
            padding: "0.5rem 1.25rem", border: "1.5px solid #1a1a1a", borderRadius: "8px",
            fontSize: "0.875rem", fontWeight: 700, color: "#1a1a1a", textDecoration: "none",
            transition: "background 0.2s, color 0.2s, border-color 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f06135"; (e.currentTarget as HTMLElement).style.borderColor = "#f06135"; (e.currentTarget as HTMLElement).style.color = "#fff" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a"; (e.currentTarget as HTMLElement).style.color = "#1a1a1a" }}
          >Contact Us</Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileNavOpen(!mobileNavOpen)}
          style={{ background: "none", border: "1.5px solid #d6cfc4", borderRadius: "8px", padding: "0.45rem", cursor: "pointer", color: "#3a3530" }}>
          {mobileNavOpen
            ? <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>

      {mobileNavOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #e8e4de", padding: "1rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {[...NAV_LINKS, { label: "Impact", href: "#" }].map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setMobileNavOpen(false)}
              style={{ padding: "0.7rem 0", borderBottom: "1px solid #f0ece5", fontSize: "0.95rem", fontWeight: 600, color: "#3a3530", textDecoration: "none" }}
            >{label}</Link>
          ))}
          <Link href="/contact" onClick={() => setMobileNavOpen(false)}
            style={{ marginTop: "0.75rem", padding: "0.8rem 1.5rem", background: "#f06135", borderRadius: "8px", textAlign: "center", fontSize: "0.95rem", fontWeight: 700, color: "#fff", textDecoration: "none" }}>
            Contact Us
          </Link>
        </div>
      )}
    </header>
  )
}
