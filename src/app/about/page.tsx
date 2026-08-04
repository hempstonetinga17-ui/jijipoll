import Link from "next/link"

export const metadata = {
  title: "About Us | Rieng",
  description: "Learn about Rieng — Africa's field intelligence platform built to power ground-level market insights across 45+ counties.",
}

const TEAM = [
  { name: "Hempstone Tinga", role: "Founder & CEO", emoji: "👋", bio: "Former field researcher turned builder. Obsessed with making ground-level data accessible to every organisation in Africa." },
  { name: "Research Team", role: "Data & Intelligence", emoji: "🔬", bio: "A distributed team of analysts, cartographers, and field coordinators who turn raw field data into actionable intelligence." },
  { name: "Field Agents", role: "120+ Across Kenya", emoji: "🗺️", bio: "Our network of trained field agents spans 45+ counties, capturing real-world data in 8+ languages." },
]

const VALUES = [
  { icon: "🌍", title: "Ground Truth First", desc: "Every insight we produce is backed by verified, in-person field data — not speculation or scraped web content." },
  { icon: "🤝", title: "Fair Earnings", desc: "We believe the people collecting data should share in the value it creates. Agents earn competitive rates for quality work." },
  { icon: "🔒", title: "Privacy by Design", desc: "Data is collected with full consent. We operate within Kenya's data protection framework and global best practices." },
  { icon: "⚡", title: "Speed to Insight", desc: "From field capture to dashboard in under 24 hours. We eliminate the weeks-long lag of traditional market research." },
]

const STATS = [
  { value: "45+", label: "Counties Covered" },
  { value: "120+", label: "Active Field Agents" },
  { value: "8+", label: "Local Languages" },
  { value: "10k+", label: "Data Points Monthly" },
]

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'Manrope', 'Inter', -apple-system, sans-serif", background: "#faf8f5", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #f0e8e0", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <img src="/rieng_logo.jpg" alt="Rieng" style={{ height: 36, width: 36, borderRadius: "10px", objectFit: "cover" }} />
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.25rem", color: "#1a1a1a", fontWeight: 400 }}>Rieng</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/about" style={{ color: "#f06135", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>About</Link>
            <Link href="/contact" style={{ color: "#555", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Contact</Link>
            <Link href="/login" style={{
              background: "#f06135", color: "#fff", fontWeight: 700,
              fontSize: "0.875rem", padding: "0.5rem 1.25rem", borderRadius: "999px", textDecoration: "none",
            }}>Sign in</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, #fef3ec 0%, #fde8d8 100%)",
        padding: "clamp(4rem, 8vw, 7rem) 1.5rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <span style={{
            display: "inline-block", background: "rgba(240,97,53,0.1)", color: "#f06135",
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1.5rem",
            border: "1px solid rgba(240,97,53,0.2)",
          }}>Our Story</span>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            color: "#1a1a1a", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 1.5rem",
          }}>
            Built to bridge the gap between<br />
            <span style={{ color: "#f06135" }}>field reality</span> and decision-making
          </h1>
          <p style={{ color: "#666", fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto" }}>
            Rieng was born from a simple frustration: organisations in Africa were making million-shilling decisions based on outdated reports and secondhand data. We set out to fix that.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#ffffff", padding: "3rem 1.5rem", borderTop: "1px solid #f0e8e0", borderBottom: "1px solid #f0e8e0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem" }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "#f06135", lineHeight: 1,
                marginBottom: "0.5rem",
              }}>{stat.value}</div>
              <div style={{ color: "#888", fontSize: "0.875rem", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 6rem) 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <span style={{ color: "#f06135", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Our Mission</span>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#1a1a1a",
              fontWeight: 400, lineHeight: 1.3, margin: "0.75rem 0 1.25rem",
            }}>
              Making ground truth<br />accessible to all
            </h2>
            <p style={{ color: "#555", lineHeight: 1.8, fontSize: "1rem", margin: "0 0 1rem" }}>
              Every market research project used to require weeks of planning, expensive consultants, and rigid survey methodologies. We've compressed that into hours.
            </p>
            <p style={{ color: "#555", lineHeight: 1.8, fontSize: "1rem", margin: 0 }}>
              Our network of trained field agents, equipped with our mobile app, captures structured data across any territory in Kenya — and increasingly, across East Africa.
            </p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #fef3ec, #fde8d8)", borderRadius: "24px", padding: "2.5rem", border: "1px solid rgba(240,97,53,0.15)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎯</div>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.5rem", color: "#1a1a1a", margin: "0 0 0.75rem", fontWeight: 400 }}>
              The Rieng Difference
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {["Real agents. Real visits. Real data.", "Structured capture, not free-form notes.", "Verified submissions with GPS tagging.", "Available in 8+ local languages."].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#444", fontSize: "0.9rem", fontWeight: 500 }}>
                  <span style={{ color: "#f06135", fontSize: "1.1rem" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: "#ffffff", padding: "clamp(4rem, 8vw, 6rem) 1.5rem", borderTop: "1px solid #f0e8e0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "#f06135", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>What We Stand For</span>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#1a1a1a",
              fontWeight: 400, lineHeight: 1.3, margin: "0.75rem 0 0",
            }}>Our Core Values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                background: "#faf8f5", borderRadius: "20px", padding: "1.75rem",
                border: "1px solid #f0e8e0",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{v.icon}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.25rem", color: "#1a1a1a", margin: "0 0 0.75rem", fontWeight: 400 }}>{v.title}</h3>
                <p style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 6rem) 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "#f06135", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>The People</span>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#1a1a1a",
              fontWeight: 400, lineHeight: 1.3, margin: "0.75rem 0 0",
            }}>Who's Behind Rieng</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {TEAM.map(member => (
              <div key={member.name} style={{
                background: "#ffffff", borderRadius: "20px", padding: "2rem",
                border: "1px solid #f0e8e0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{member.emoji}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.2rem", color: "#1a1a1a", margin: "0 0 0.25rem", fontWeight: 400 }}>{member.name}</h3>
                <div style={{ color: "#f06135", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>{member.role}</div>
                <p style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: "linear-gradient(135deg, #f06135 0%, #e05520 100%)",
        padding: "clamp(4rem, 8vw, 6rem) 1.5rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 3rem)", color: "#ffffff",
            fontWeight: 400, lineHeight: 1.2, margin: "0 0 1.25rem",
          }}>Ready to see it in action?</h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Book a 15-minute call with Hempstone and see how Rieng can work for your organisation.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/book-demo" style={{
              background: "#ffffff", color: "#f06135", fontWeight: 800,
              padding: "0.875rem 2rem", borderRadius: "999px", textDecoration: "none",
              fontSize: "0.95rem",
            }}>Book a Demo</Link>
            <Link href="/contact" style={{
              background: "rgba(255,255,255,0.15)", color: "#ffffff", fontWeight: 700,
              padding: "0.875rem 2rem", borderRadius: "999px", textDecoration: "none",
              fontSize: "0.95rem", border: "1px solid rgba(255,255,255,0.3)",
            }}>Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a1a1a", padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", marginBottom: "1.5rem" }}>
          <img src="/rieng_logo.jpg" alt="Rieng" style={{ height: 32, width: 32, borderRadius: "8px", objectFit: "cover" }} />
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.1rem", color: "#fff" }}>Rieng</span>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {[["About", "/about"], ["Contact", "/contact"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ color: "#888", fontSize: "0.8rem", fontWeight: 500, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
        <p style={{ color: "#555", fontSize: "0.75rem", margin: 0 }}>© {new Date().getFullYear()} Rieng. All rights reserved.</p>
      </footer>
    </div>
  )
}
