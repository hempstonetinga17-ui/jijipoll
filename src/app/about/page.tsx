import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"
import { Linkedin, ArrowUpRight } from "lucide-react"

export const metadata = {
  title: "About Us | Rieng",
  description: "Learn about Rieng — building a different foundation for AI in Africa.",
}

const FOUNDERS = [
  { name: "Hempstone Tinga", role: "Co-Founder, CEO", image: "/member_1.jpg" },
  { name: "Wanjiku Njoroge", role: "Co-founder / Chief Impact Officer", image: "/member_2.jpg" },
  { name: "David Ochieng", role: "Co-founder and CTO", image: "/member_3.jpg" },
]

const LEADERS = [
  { name: "Akinyi Odhiambo", role: "Director - People Success", image: "/member_4.jpg" },
  { name: "Faith Mutuku", role: "Head - Monitoring & Evaluation", image: "/member_5.jpg" },
  { name: "Kevin Kiprop", role: "Head of Engineering", image: "/member_6.jpg" },
  { name: "Fatuma Ali", role: "Head - Language Technology", image: "/member_1.jpg" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>

      <MarketingHeader />

      {/* ── PAGE TITLE ── */}
      <div className="border-b border-[#cdd2ce] bg-[#faf8f5] px-6">
        <div className="max-w-[1200px] mx-auto py-10">
          <h1 className="font-['DM_Serif_Display'] text-[40px] text-[#1a3848]">About Us</h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* ── INTRO SECTION ── */}
        <section className="py-16 max-w-4xl">
          <div className="space-y-8 text-[17px] leading-[1.8] text-[#455c68]">
            <p>Rieng is a team building a different foundation for AI in Africa.</p>

            <p>
              We build with the people who create and use it, across languages and real-world contexts.
              Our focus is expanding who participates in the AI economy, creating meaningful digital work
              while delivering high-quality outcomes.
            </p>

            <p>
              Every project reflects a shared commitment to rigour, care, and the belief that better AI
              comes from broader participation.
            </p>

            <p>
              Explore the Rieng Annual Report 2025 for a deeper look at our work, impact, and progress over the past year.
            </p>
          </div>

          <div className="mt-8">
            <button className="flex items-center gap-2 px-6 py-3 border border-[#455c68] text-[#1a3848] font-medium text-sm hover:bg-[#455c68] hover:text-white transition-colors">
              Read Rieng Annual Report 2025
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── OUR TEAM ── */}
        <section className="py-16 border-t border-[#cdd2ce]">
          <h2 className="font-['DM_Serif_Display'] text-[28px] text-[#1a3848] mb-10">Our Team</h2>
          <div className="w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/7" }}>
            <img
              src="/team_photo.jpg"
              alt="The Rieng Team — out in the field across Kenya"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center top" }}
            />
          </div>
          <p className="text-sm text-[#738a94] mt-3 italic">The Rieng team — out in the field across Kenya.</p>
        </section>

        {/* ── FOUNDERS ── */}
        <section className="py-16 border-t border-[#cdd2ce]">
          <h2 className="font-['DM_Serif_Display'] text-[28px] text-[#1a3848] mb-10">Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FOUNDERS.map((founder, i) => (
              <div key={i} className="bg-white flex flex-col h-full border border-[#e8e4de] rounded-xl hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-[4/5] bg-neutral-100 relative overflow-hidden">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a3848] mb-1">{founder.name}</h3>
                    <p className="text-sm text-[#738a94]">{founder.role}</p>
                  </div>
                  <Linkedin className="w-5 h-5 text-[#1a3848] shrink-0 mt-1 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LEADERS ── */}
        <section className="py-16 border-t border-[#cdd2ce]">
          <h2 className="font-['DM_Serif_Display'] text-[28px] text-[#1a3848] mb-10">Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEADERS.map((leader, i) => (
              <div key={i} className="bg-white flex flex-col h-full border border-[#e8e4de] rounded-xl hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-[4/5] bg-neutral-100 relative overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#1a3848] mb-1">{leader.name}</h3>
                    <p className="text-xs text-[#738a94] leading-relaxed pr-2">{leader.role}</p>
                  </div>
                  <Linkedin className="w-5 h-5 text-[#1a3848] shrink-0 mt-1 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 border-t border-[#cdd2ce]">
          <div className="bg-[linear-gradient(135deg,#fef3ec,#fde8d8)] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-['DM_Serif_Display'] text-[28px] text-[#1a1a1a] mb-2">Want to work with us?</h2>
              <p className="text-[#6a6460] text-sm">We're always looking for talented people passionate about ethical AI.</p>
            </div>
            <Link href="/contact" style={{
              padding: "0.85rem 2rem", background: "#f06135", color: "#fff", borderRadius: "8px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0
            }}>Get in Touch</Link>
          </div>
        </section>
      </div>

      <MarketingFooter />
    </div>
  )
}
