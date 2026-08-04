"use client"
import { useState } from "react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    // Simulate submission — can hook into a real endpoint later
    await new Promise(r => setTimeout(r, 1200))
    setStatus("success")
  }

  const CONTACTS = [
    { icon: "✉️", label: "Email", value: "hello@rieng.co", href: "mailto:hello@rieng.co" },
    { icon: "📱", label: "WhatsApp", value: "+254 700 000 000", href: "https://wa.me/254700000000" },
    { icon: "📍", label: "Location", value: "Nairobi, Kenya", href: "https://maps.google.com/?q=Nairobi+Kenya" },
  ]

  return (
    <div style={{ fontFamily: "'Manrope', 'Inter', -apple-system, sans-serif", background: "#faf8f5", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(240,97,53,0.5) !important; box-shadow: 0 0 0 3px rgba(240,97,53,0.1) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #f0e8e0", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <img src="/rieng_logo.jpg" alt="Rieng" style={{ height: 36, width: 36, borderRadius: "10px", objectFit: "cover" }} />
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.25rem", color: "#1a1a1a", fontWeight: 400 }}>Rieng</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/about" style={{ color: "#555", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>About</Link>
            <Link href="/contact" style={{ color: "#f06135", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>Contact</Link>
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
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <span style={{
            display: "inline-block", background: "rgba(240,97,53,0.1)", color: "#f06135",
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1.5rem",
            border: "1px solid rgba(240,97,53,0.2)",
          }}>Get in Touch</span>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            color: "#1a1a1a", fontWeight: 400, lineHeight: 1.15,
            margin: "0 0 1.25rem",
          }}>
            We'd love to hear<br />from you
          </h1>
          <p style={{ color: "#666", fontSize: "clamp(0.95rem, 2vw, 1.1rem)", lineHeight: 1.75 }}>
            Whether you're a researcher, brand, NGO, or just curious about what Rieng does — reach out. We reply within one business day.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding: "clamp(4rem, 8vw, 6rem) 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>

          {/* Contact Info */}
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.75rem", color: "#1a1a1a", fontWeight: 400, margin: "0 0 1.75rem" }}>
              Contact Information
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {CONTACTS.map(c => (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px",
                    border: "1px solid #f0e8e0", textDecoration: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{c.icon}</span>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>{c.label}</div>
                    <div style={{ color: "#1a1a1a", fontWeight: 600, fontSize: "0.95rem" }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* FAQ mini */}
            <div style={{ background: "linear-gradient(135deg, #fef3ec, #fde8d8)", borderRadius: "20px", padding: "1.75rem", border: "1px solid rgba(240,97,53,0.15)" }}>
              <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.25rem", color: "#1a1a1a", margin: "0 0 1rem", fontWeight: 400 }}>Quick Answers</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {[
                  { q: "How quickly do you respond?", a: "Within 1 business day, usually faster." },
                  { q: "Can I request a demo?", a: "Yes — book one directly at rieng.co/book-demo." },
                  { q: "Do you work outside Kenya?", a: "We're expanding. Reach out to discuss your market." },
                ].map(item => (
                  <div key={item.q}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#333", marginBottom: "0.2rem" }}>{item.q}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666", lineHeight: 1.6 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.75rem", color: "#1a1a1a", fontWeight: 400, margin: "0 0 1.75rem" }}>
              Send a Message
            </h2>
            {status === "success" ? (
              <div style={{
                background: "#ffffff", borderRadius: "20px", padding: "3rem 2rem",
                border: "1px solid rgba(240,97,53,0.2)", textAlign: "center",
                boxShadow: "0 4px 24px rgba(240,97,53,0.08)",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.5rem", color: "#1a1a1a", margin: "0 0 0.75rem", fontWeight: 400 }}>Message Sent!</h3>
                <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  Thanks for reaching out. We'll get back to you within one business day.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setFormData({ name: "", email: "", subject: "", message: "" }) }}
                  style={{
                    background: "#f06135", color: "#fff", border: "none", cursor: "pointer",
                    padding: "0.75rem 1.75rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.875rem",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                background: "#ffffff", borderRadius: "20px", padding: "2rem",
                border: "1px solid #f0e8e0", boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column", gap: "1.25rem",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", color: "#888", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                      Your Name *
                    </label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "0.75rem 1rem",
                        background: "#faf8f5", border: "1px solid #e8e0d8", borderRadius: "12px",
                        color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#888", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                      Email *
                    </label>
                    <input
                      type="email" required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "0.75rem 1rem",
                        background: "#faf8f5", border: "1px solid #e8e0d8", borderRadius: "12px",
                        color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", color: "#888", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                    Subject *
                  </label>
                  <input
                    type="text" required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's on your mind?"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "0.75rem 1rem",
                      background: "#faf8f5", border: "1px solid #e8e0d8", borderRadius: "12px",
                      color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#888", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your needs, project, or question…"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "0.75rem 1rem",
                      background: "#faf8f5", border: "1px solid #e8e0d8", borderRadius: "12px",
                      color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit",
                      resize: "vertical", transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  style={{
                    background: status === "submitting" ? "rgba(240,97,53,0.5)" : "linear-gradient(135deg, #f06135, #e05520)",
                    color: "#fff", border: "none", cursor: status === "submitting" ? "not-allowed" : "pointer",
                    padding: "0.9rem 2rem", borderRadius: "14px", fontWeight: 800, fontSize: "0.95rem",
                    fontFamily: "inherit", boxShadow: "0 4px 20px rgba(240,97,53,0.3)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    alignSelf: "flex-start",
                  }}
                >
                  {status === "submitting" ? "Sending…" : "Send Message →"}
                </button>
              </form>
            )}
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
