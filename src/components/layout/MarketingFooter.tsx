"use client"
import Link from "next/link"

const FOOTER_COL_1 = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Data Catalogue", href: "/datasets" },
  { label: "Contact Us", href: "/contact" },
  { label: "Careers", href: "#" },
]
const FOOTER_COL_2 = [
  { label: "Impact", href: "/impact" },
  { label: "Platform", href: "/book-demo" },
  { label: "Case Studies", href: "/case-studies" },
]
const FOOTER_COL_3 = [
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Refund & Cancellation", href: "#" },
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

export function MarketingFooter() {
  return (
    <footer style={{ background: "linear-gradient(160deg, #e8f4f0 0%, #d4eae4 60%, #c8e4dc 100%)", borderTop: "1px solid rgba(26,58,52,0.1)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3.5rem 1.5rem 0" }}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(160px,260px)_1fr] gap-8 md:gap-16 pb-12">
          {/* Logo */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", marginBottom: "1rem" }}>
              <RiengLogoMark size={38} />
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "1.4rem", letterSpacing: "-0.01em", color: "#1a3a34" }}>Rieng</span>
            </Link>
          </div>
          {/* 3 nav columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 md:gap-8">
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
  )
}
