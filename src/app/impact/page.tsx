"use client"
import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"
import { Heart, Coins, ShieldCheck, GraduationCap, ArrowRight } from "lucide-react"

const IMPACT_PILLARS = [
  {
    icon: Coins,
    title: "High & Fair Wages",
    description: "We believe in paying above-market rates. Our contributors earn wages that reflect the true value of their work, empowering them to support their families and achieve financial stability.",
    color: "#f06135",
    bg: "rgba(240,97,53,0.08)"
  },
  {
    icon: Heart,
    title: "Dignified Living",
    description: "Quality of work translates to quality of life. By providing flexible, well-compensated, and respectful working conditions, we help raise the standard of living for communities across Kenya.",
    color: "#1a3848",
    bg: "rgba(26,56,72,0.08)"
  },
  {
    icon: GraduationCap,
    title: "Skills & Development",
    description: "We don't just provide tasks; we provide training. Our workers gain valuable digital literacy and technical skills that open doors to future opportunities in the global digital economy.",
    color: "#4a7c59",
    bg: "rgba(74,124,89,0.08)"
  },
  {
    icon: ShieldCheck,
    title: "Ethical & Transparent",
    description: "Our data sourcing is rooted in consent and respect. We maintain full transparency with our partners and our workforce, ensuring every project aligns with strict ethical standards.",
    color: "#d98324",
    bg: "rgba(217,131,36,0.08)"
  }
]

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>

      <MarketingHeader />

      {/* ── HERO SECTION ── */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#f06135] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3848] opacity-[0.04] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="max-w-[1200px] mx-auto relative z-10 text-center">
          <h1 className="font-['DM_Serif_Display'] text-[48px] md:text-[64px] leading-tight text-[#1a3848] mb-6 max-w-4xl mx-auto">
            Social Impact at the Core of AI
          </h1>
          <p className="text-[18px] md:text-[20px] text-[#455c68] max-w-3xl mx-auto leading-relaxed mb-10">
            For forward-thinking companies prioritizing Corporate Social Responsibility (CSR), Rieng offers a unique partnership. We build high-quality datasets while fundamentally transforming the lives of our contributors in Africa through dignified work.
          </p>
        </div>
      </section>

      {/* ── IMPACT PILLARS ── */}
      <section className="py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['DM_Serif_Display'] text-[36px] text-[#1a3848] mb-4">Our Commitment to Society</h2>
            <p className="text-[#6a6460] max-w-2xl mx-auto">
              When you partner with Rieng for your data needs, your CSR budget directly funds sustainable development, economic empowerment, and human dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {IMPACT_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 border border-[#e8e4de] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: pillar.bg, color: pillar.color }}>
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-3">{pillar.title}</h3>
                  <p className="text-[#595551] leading-[1.7]">
                    {pillar.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WHY PARTNER WITH US ── */}
      <section className="py-20 px-6 bg-white border-y border-[#e8e4de]">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-['DM_Serif_Display'] text-[32px] text-[#1a3848] mb-10 text-center">Why Make Rieng Your CSR Partner?</h2>
          
          <div className="space-y-8 text-[17px] leading-[1.8] text-[#455c68]">
            <p>
              Traditional CSR often involves one-off donations or disconnected initiatives. At Rieng, your investment generates immediate, tangible social impact while delivering crucial business value through high-quality AI training data.
            </p>
            <p>
              By directing your data procurement or CSR budgets to Rieng, you are directly funding <strong className="text-[#f06135]">fair wages</strong>, fostering <strong className="text-[#f06135]">digital literacy</strong>, and enabling <strong className="text-[#f06135]">dignified living</strong> for thousands of individuals. We provide comprehensive impact reports that you can confidently share with your stakeholders, demonstrating measurable contributions to the UN Sustainable Development Goals (SDGs).
            </p>
            <p>
              Join us in building a future where AI advancement goes hand-in-hand with human prosperity.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-[#1a3848] rounded-[24px] p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f06135] opacity-20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-['DM_Serif_Display'] text-[36px] text-white mb-6">Ready to make a meaningful impact?</h2>
              <p className="text-[#a4b5be] text-[18px] mb-10 leading-relaxed">
                Partner with Rieng to fulfill your CSR goals while acquiring the ethical data your AI models need to succeed.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" style={{
                  padding: "1rem 2.5rem", background: "#f06135", color: "#fff", borderRadius: "10px",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem",
                  textDecoration: "none", transition: "background 0.2s", display: "inline-flex", alignItems: "center", gap: "0.5rem"
                }}>
                  Discuss a CSR Partnership
                  <ArrowRight size={18} />
                </Link>
                <Link href="/book-demo" style={{
                  padding: "1rem 2.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "10px",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "1rem",
                  textDecoration: "none", transition: "background 0.2s", display: "inline-flex", alignItems: "center"
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  Book a Platform Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
