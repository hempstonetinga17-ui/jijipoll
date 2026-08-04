import Link from "next/link"
import { Linkedin, ArrowUpRight } from "lucide-react"

export const metadata = {
  title: "About Us | Rieng",
  description: "Learn about Rieng — building a different foundation for AI in Africa.",
}

const FOUNDERS = [
  { name: "Hempstone Tinga", role: "Co-Founder, CEO", image: "HT" },
  { name: "Wanjiku Njoroge", role: "Co-founder / Chief Impact Officer", image: "WN" },
  { name: "David Ochieng", role: "Co-founder and CTO", image: "DO" },
]

const LEADERS = [
  { name: "Akinyi Odhiambo", role: "Director - People Success", image: "AO" },
  { name: "Faith Mutuku", role: "Head - Monitoring & Evaluation", image: "FM" },
  { name: "Kevin Kiprop", role: "Head of Engineering", image: "KK" },
  { name: "Fatuma Ali", role: "Head - Language Technology", image: "FA" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#f0e8e0] sticky top-0 z-50 px-6">
        <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-decoration-none">
            <img src="/rieng_logo.jpg" alt="Rieng" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-['DM_Serif_Display'] text-xl text-[#1a1a1a]">Rieng</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <Link href="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">Platform</Link>
            <Link href="/about" className="text-[#f06135] transition-colors">About Us</Link>
            <Link href="/datasets" className="text-neutral-500 hover:text-neutral-900 transition-colors">Data Catalogue</Link>
            <Link href="/contact" className="text-neutral-500 hover:text-neutral-900 transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

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
          <h2 className="text-[28px] text-[#1a3848] mb-10">Our Team</h2>
          <div className="w-full aspect-[21/9] bg-neutral-200 overflow-hidden">
            <img 
              src="/team_photo.jpg" 
              alt="The Rieng Team" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* ── FOUNDERS ── */}
        <section className="py-16 border-t border-[#cdd2ce]">
          <h2 className="text-[28px] text-[#1a3848] mb-10">Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FOUNDERS.map((founder, i) => (
              <div key={i} className="bg-white flex flex-col h-full border border-transparent hover:shadow-lg transition-shadow">
                <div className="aspect-[4/5] bg-neutral-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-4xl font-bold text-neutral-300 tracking-widest">{founder.image}</span>
                </div>
                <div className="p-6 flex items-start justify-between bg-white border-t-0 border-[#cdd2ce] border">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a3848] mb-1">{founder.name}</h3>
                    <p className="text-sm text-[#738a94]">{founder.role}</p>
                  </div>
                  <Linkedin className="w-6 h-6 text-[#1a3848] shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LEADERS ── */}
        <section className="py-16 border-t border-[#cdd2ce]">
          <h2 className="text-[28px] text-[#1a3848] mb-10">Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEADERS.map((leader, i) => (
              <div key={i} className="bg-white flex flex-col h-full border border-transparent hover:shadow-lg transition-shadow">
                <div className="aspect-[4/5] bg-neutral-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-4xl font-bold text-neutral-300 tracking-widest">{leader.image}</span>
                </div>
                <div className="p-5 flex items-start justify-between bg-white border-t-0 border-[#cdd2ce] border">
                  <div>
                    <h3 className="text-[17px] font-semibold text-[#1a3848] mb-1">{leader.name}</h3>
                    <p className="text-xs text-[#738a94] leading-relaxed pr-2">{leader.role}</p>
                  </div>
                  <Linkedin className="w-6 h-6 text-[#1a3848] shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
