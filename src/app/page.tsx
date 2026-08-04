"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

/* ─── Nav ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Data Catalogue", href: "/datasets" },
  { label: "About Us", href: "/about" },
  { label: "Evaluations", href: "/solutions/market-segmentation" },
  { label: "Platform", href: "/solutions/location-intelligence" },
]
const IMPACT_LINKS = [
  { label: "Ethical Sourcing", href: "/about" },
  { label: "Language Datasets", href: "/datasets" },
  { label: "Audio Collection", href: "/datasets" },
  { label: "Image Captioning", href: "/datasets" },
]

/* ─── Footer nav ────────────────────────────────────────────────── */
const FOOTER_COL_1 = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Data Catalogue", href: "/datasets" },
  { label: "Contact Us", href: "/contact" },
  { label: "Careers", href: "#" },
]
const FOOTER_COL_2 = [
  { label: "Impact", href: "#" },
  { label: "Evaluations", href: "/solutions/market-segmentation" },
  { label: "Platform", href: "/solutions/location-intelligence" },
  { label: "Case Studies", href: "/case-studies" },
]
const FOOTER_COL_3 = [
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Refund & Cancellation", href: "#" },
]

/* ─── Work cards ────────────────────────────────────────────────── */
const PROJECTS = [
  {
    tag: "Multilingual Captioning",
    title: "A pipeline for image and scene captioning across 10 Kenyan languages, providing nuanced local context.",
    stat1: { value: "500k+", label: "captions collected" },
  },
  {
    tag: "Audio Dataset Project",
    title: "High-fidelity speech recordings across Swahili, Kikuyu, Luo, and Kalenjin for frontier ASR and TTS models.",
    stat1: { value: "80k+", label: "audio clips" },
    stat2: { value: "12", label: "languages covered" },
  },
]
const SMALL_PROJECTS = [
  {
    tag: "LLM Bias Evaluation",
    title: "Community-led evaluation of large language models for cultural sensitivity in East African contexts.",
  },
  {
    tag: "Visual Grounding",
    title: "Geo-tagged images of everyday Kenyan environments precisely labeled for computer vision training.",
  },
  {
    tag: "Human-in-the-Loop",
    title: "Verified data enrichment tasks, crowdsourced and quality-checked by our skilled local workforce.",
  },
]

/* ─── Services ──────────────────────────────────────────────────── */
const SERVICES = [
  {
    title: "Image & Photo Datasets",
    desc: "Acquire extensive, geo-tagged image datasets — from street scenes and household objects to agricultural environments — accurately captioned in local languages.",
    link: { label: "Browse Catalogue ↗", href: "/datasets" },
  },
  {
    title: "Audio & Speech Datasets",
    desc: "Access high-quality spoken-word recordings across Kenya's major languages, dialects, and accents — transcribed and verified for speech model training.",
    link: null,
  },
  {
    title: "Custom Data Collection",
    desc: "Need something specific? We deploy our distributed workforce to collect bespoke text, audio, or visual datasets tailored exactly to your model's requirements.",
    link: { label: "Request Custom Data ↗", href: "/contact" },
  },
]

/* ─── Capabilities ──────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    title: "Multilingual Text & Captions",
    desc: "Large-scale text datasets in Swahili, Kikuyu, Luo, Kalenjin and more — covering conversation, captioning, translation, and domain-specific terminology.",
    cta: { label: "Explore Datasets ↗", href: "/datasets" },
  },
  {
    title: "Speech & Audio",
    desc: "Recording, transcription, and speaker-diversity coverage across 12+ Kenyan languages — built for ASR, TTS, voice assistants, and AI systems.",
    cta: { label: "Explore Audio ↗", href: "/datasets" },
  },
  {
    title: "Evaluation Benchmarks",
    desc: "End-to-end evaluation frameworks combining community feedback with expert review — testing LLMs across culturally sensitive, high-impact domains.",
    cta: { label: "Explore Evaluations ↗", href: "/solutions/market-segmentation" },
  },
]

/* ─── Trusted by ────────────────────────────────────────────────── */
const TRUSTED = ["Government of Kenya", "Microsoft", "Google", "Gates Foundation", "Anthropic"]

/* ─── How it works steps ────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Define Your Needs",
    desc: "Tell us what data your AI model requires — whether it's geo-tagged images, audio recordings, or text in specific Kenyan dialects.",
  },
  {
    num: "02",
    title: "We Deploy Our Workforce",
    desc: "We distribute micro-tasks through our app to a network of Kenyan youth, 70% of whom are previously unemployed, who use their smartphones to capture data.",
  },
  {
    num: "03",
    title: "Quality Assurance",
    desc: "Every data point — photo, audio clip, or caption — goes through rigorous human-in-the-loop verification to ensure the highest quality and accuracy.",
  },
  {
    num: "04",
    title: "Delivery & Impact",
    desc: "You receive decision-ready, locally contextualized datasets to train your AI, while providing meaningful income to young Kenyans.",
  },
]

/* ─── Rieng R logo mark ─────────────────────────────────────────── */
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

export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [impactOpen, setImpactOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: "#faf8f5", color: "#1a1a1a" }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
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

          <nav style={{ display: "flex", alignItems: "center", gap: "0.1rem" }} className="hidden md:flex">
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

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", overflow: "hidden", background: "#f5f0e8",
        minHeight: "92vh", display: "flex", alignItems: "center",
      }}>
        {/* Grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }} />
        {/* Blobs */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div className="anim-float" style={{ position: "absolute", right: "8%", top: "8%", width: "clamp(220px,28vw,420px)", height: "clamp(220px,28vw,420px)", borderRadius: "50%", background: "rgba(240,97,53,0.18)", filter: "blur(2px)" }} />
          <div className="anim-float-2" style={{ position: "absolute", right: "18%", top: "38%", width: "clamp(130px,16vw,250px)", height: "clamp(130px,16vw,250px)", borderRadius: "50%", background: "rgba(240,97,53,0.10)", filter: "blur(1px)" }} />
          <div className="anim-float-3" style={{ position: "absolute", right: "3%", top: "4%", width: "clamp(80px,10vw,160px)", height: "clamp(80px,10vw,160px)", borderRadius: "50%", background: "#c8e63a", opacity: 0.75 }} />
          <div className="anim-float" style={{ position: "absolute", right: "6%", bottom: "12%", width: "clamp(60px,8vw,130px)", height: "clamp(60px,8vw,130px)", borderRadius: "50%", background: "#f06135", opacity: 0.55 }} />
          <div className="anim-float-2" style={{ position: "absolute", left: "-4%", bottom: "0", width: "clamp(160px,20vw,340px)", height: "clamp(160px,20vw,340px)", borderRadius: "50%", background: "rgba(240,97,53,0.08)", filter: "blur(3px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.5rem 6rem", width: "100%" }}>
          <div style={{ maxWidth: "700px" }}>
            <p className="anim-slide-up" style={{
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.75rem",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#f06135", marginBottom: "1.25rem",
            }}>
              High-Quality AI Datasets · Local Languages · Ethically Sourced
            </p>
            <h1 className="anim-slide-up-2" style={{
              fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400,
              fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)", lineHeight: 1.1,
              letterSpacing: "-0.015em", color: "#1a1a1a", marginBottom: "1.5rem",
            }}>
              Authentic Kenyan data.<br />
              <em style={{ color: "#f06135", fontStyle: "italic" }}>For the AI revolution.</em>
            </h1>
            <p className="anim-slide-up-3" style={{
              fontFamily: "'Manrope', sans-serif", fontWeight: 400,
              fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.75,
              color: "#5a5248", marginBottom: "2.25rem", maxWidth: "560px",
            }}>
              Rieng provides AI developers with rich, accurately annotated datasets — from 
              multilingual audio to geo-tagged, captioned images. Sourced ethically across Kenya by 
              our mobile workforce of young professionals, fueling more inclusive AI.
            </p>
            <div className="anim-slide-up-3" style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link href="/datasets" style={{
                padding: "0.85rem 2rem", background: "#f06135", color: "#fff", borderRadius: "8px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem",
                textDecoration: "none", boxShadow: "0 4px 18px rgba(240,97,53,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(240,97,53,0.45)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(240,97,53,0.35)" }}
              >
                Browse Datasets
              </Link>
              <Link href="/contact" style={{
                padding: "0.85rem 2rem", background: "transparent", color: "#1a1a1a",
                border: "1.5px solid #c8c0b4", borderRadius: "8px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.95rem",
                textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#f06135"; (e.currentTarget as HTMLElement).style.color = "#f06135" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#c8c0b4"; (e.currentTarget as HTMLElement).style.color = "#1a1a1a" }}
              >
                Request Custom Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e8e4de", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "1.5rem" }}>
          {[
            { value: "65M+", label: "Data Points Collected" },
            { value: "12+", label: "Local Languages" },
            { value: "45+", label: "Counties Mapped" },
            { value: "70%", label: "Jobs Provided to Youth" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 400, color: "#f06135", lineHeight: 1, marginBottom: "0.3rem" }}>{value}</p>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#8a8178", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUSTED BY ──────────────────────────────────────────── */}
      <section style={{ background: "#faf8f5", padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#a09890", marginBottom: "2.5rem" }}>Trusted by</p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}>
            {TRUSTED.map(name => (
              <span key={name} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "clamp(0.9rem,1.2vw,1.05rem)", color: "#8a8178", opacity: 0.72, cursor: "default", transition: "opacity 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.72"}
              >{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#f06135", marginBottom: "0.75rem" }}>
            How We Source Your Data
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#1a1a1a", lineHeight: 1.2, marginBottom: "3rem", maxWidth: "600px" }}>
            High-quality datasets,<br />delivered by a distributed workforce.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0px", background: "#e0d9d0", border: "1px solid #e0d9d0", borderRadius: "12px", overflow: "hidden" }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ background: "#faf8f5", padding: "2.25rem 2rem", borderRight: i < HOW_IT_WORKS.length - 1 ? "1px solid #e0d9d0" : "none" }}>
                <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2.5rem", color: "rgba(240,97,53,0.18)", lineHeight: 1, marginBottom: "1rem" }}>{step.num}</p>
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", marginBottom: "0.6rem" }}>{step.title}</h3>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.65, color: "#6a6460" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR WORK ─────────────────────────────────────────────── */}
      <section style={{ background: "#faf8f5", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.6rem, 2.5vw, 2rem)", color: "#1a1a1a", marginBottom: "2rem" }}>Our Data Projects</h2>

          {/* Large projects */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1px", background: "#e0d9d0", border: "1px solid #e0d9d0", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
            {PROJECTS.map((p, i) => (
              <div key={i} style={{ background: "#faf8f5", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a09890", marginBottom: "0.75rem" }}>{p.tag}</p>
                  <div style={{ width: "100%", height: "1px", background: "#e0d9d0", marginBottom: "1rem" }} />
                </div>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: "0.95rem", lineHeight: 1.6, color: "#3a3530", flex: 1 }}>{p.title}</p>
                  {p.stat1 && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.6rem,2.5vw,2rem)", color: "#1a1a1a", lineHeight: 1, marginBottom: "0.25rem" }}>{p.stat1.value}</p>
                      <p style={{ fontSize: "0.72rem", color: "#8a8178", fontWeight: 500 }}>{p.stat1.label}</p>
                      {p.stat2 && <>
                        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.4rem,2vw,1.8rem)", color: "#1a1a1a", lineHeight: 1, marginTop: "0.75rem", marginBottom: "0.25rem" }}>{p.stat2.value}</p>
                        <p style={{ fontSize: "0.72rem", color: "#8a8178", fontWeight: 500 }}>{p.stat2.label}</p>
                      </>}
                    </div>
                  )}
                </div>
                <Link href="/case-studies" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#f06135", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.gap = "0.6rem"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.gap = "0.35rem"}
                >Read Case Study <span>+</span></Link>
              </div>
            ))}
          </div>

          {/* Small projects */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "#e0d9d0", border: "1px solid #e0d9d0", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
            {SMALL_PROJECTS.map((p, i) => (
              <div key={i} style={{ background: "#faf8f5", padding: "1.75rem 2rem" }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a09890", marginBottom: "0.65rem" }}>{p.tag}</p>
                <div style={{ width: "100%", height: "1px", background: "#e0d9d0", marginBottom: "1rem" }} />
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: "0.9rem", lineHeight: 1.6, color: "#1a4a4a", marginBottom: "1.25rem" }}>{p.title}</p>
                <Link href="/case-studies" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#f06135", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  Read More <span>+</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI DATA STACK ────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#1a1a1a", lineHeight: 1.2, marginBottom: "1.25rem", maxWidth: "700px" }}>
            The AI Data Stack for Kenya
          </h2>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400, fontSize: "clamp(0.95rem,1.3vw,1.05rem)", lineHeight: 1.7, color: "#5a5248", marginBottom: "2.5rem", maxWidth: "620px" }}>
            High-quality, community-sourced datasets and evaluation benchmarks built for Africa's linguistic,
            cultural, and operational complexity — across healthcare, agriculture, commerce, law, and public services.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1px", background: "#e0d9d0", border: "1px solid #e0d9d0", borderRadius: "12px", overflow: "hidden" }}>
            {CAPABILITIES.map((c, i) => (
              <div key={i} style={{ background: "#faf8f5", padding: "2.25rem 2rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1a1a1a" }}>{c.title}</h3>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.65, color: "#6a6460", flex: 1 }}>{c.desc}</p>
                <Link href={c.cta.href} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#f06135", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = "underline"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = "none"}
                >{c.cta.label}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <section style={{ background: "#faf8f5", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.6rem, 2.5vw, 2rem)", color: "#1a1a1a", marginBottom: "2.5rem" }}>Our Services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "3rem", alignItems: "start" }}>
            {/* Shape cluster */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[["circle","square","triangle"],["triangle","hex","circle"],["hex","circle","square"]].map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {row.map((shape, ci) => (
                    <div key={ci} style={{
                      width: "52px", height: "52px",
                      background: ri === 0 && ci === 1 ? "transparent" : "rgba(240,97,53,0.10)",
                      border: ri === 0 && ci === 1 ? "1.5px solid rgba(240,97,53,0.3)" : "none",
                      borderRadius: shape === "circle" ? "50%" : shape === "hex" ? "30%" : "8px",
                      transform: shape === "triangle" ? "rotate(45deg)" : "none",
                      boxShadow: ri === 1 && ci === 1 ? "0 4px 14px rgba(240,97,53,0.18)" : "none",
                    }} />
                  ))}
                </div>
              ))}
            </div>
            {/* Service list */}
            <div>
              {SERVICES.map((s, i) => (
                <div key={i} style={{ padding: "1.5rem 0", borderBottom: "1px solid #e8e4de" }}>
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", marginBottom: s.desc ? "0.5rem" : 0 }}>{s.title}</h3>
                  {s.desc && <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.65, color: "#6a6460", marginBottom: s.link ? "0.75rem" : 0 }}>{s.desc}</p>}
                  {s.link && (
                    <Link href={s.link.href} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#f06135", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = "underline"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = "none"}
                    >{s.link.label}</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #e8f4f0 0%, #d4eae4 50%, #e8f4f0 100%)", padding: "6rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#1a3a34", lineHeight: 1.2, marginBottom: "2rem" }}>
          Get high-quality Kenyan datasets for your AI models.
        </h2>
        <Link href="/contact" style={{
          display: "inline-block", padding: "0.85rem 2.25rem",
          border: "1.5px solid #1a3a34", borderRadius: "8px",
          fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem",
          color: "#1a3a34", textDecoration: "none", transition: "background 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1a3a34"; (e.currentTarget as HTMLElement).style.color = "#fff" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#1a3a34" }}
        >Contact our Data Team</Link>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ background: "linear-gradient(160deg, #e8f4f0 0%, #d4eae4 60%, #c8e4dc 100%)", borderTop: "1px solid rgba(26,58,52,0.1)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3.5rem 1.5rem 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(160px, 260px) 1fr", gap: "4rem", paddingBottom: "3rem" }} className="footer-top-grid">
            {/* Logo */}
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", marginBottom: "1rem" }}>
                <RiengLogoMark size={38} />
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "1.4rem", letterSpacing: "-0.01em", color: "#1a3a34" }}>Rieng</span>
              </Link>
            </div>
            {/* 3 nav columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {FOOTER_COL_1.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: "0.875rem", color: "#1a3a34", textDecoration: "none", opacity: 0.75, transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.75"}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {FOOTER_COL_2.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: "0.875rem", color: "#f06135", textDecoration: "none", opacity: 0.85, transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {FOOTER_COL_3.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: "0.875rem", color: "#1a3a34", textDecoration: "none", opacity: 0.65, transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.65"}
                    >{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(26,58,52,0.12)", padding: "1.25rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.8rem", color: "#1a3a34", opacity: 0.5 }}>
              © {new Date().getFullYear() - 4} — {new Date().getFullYear()}&nbsp; Rieng Technologies Ltd. All rights reserved.
            </p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.8rem", color: "#1a3a34", opacity: 0.45 }}>
              Nairobi, Kenya
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .footer-top-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .footer-top-grid > div:last-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 640px) {
          .sm\\:footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </div>
  )
}
