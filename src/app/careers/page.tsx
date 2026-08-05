"use client"
import Link from "next/link"
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"

const OPEN_ROLES = [
  {
    title: "Senior Data Annotation Specialist",
    type: "Full-time",
    location: "Nairobi, Kenya",
    department: "Operations",
    description: "Lead annotation quality for multilingual datasets. You'll set quality standards, train junior annotators, and work closely with our QA team to deliver accurate training data.",
  },
  {
    title: "Field Data Coordinator",
    type: "Full-time",
    location: "Nairobi / Field-based",
    department: "Field Operations",
    description: "Manage and supervise field agents across Kenya collecting audio, image, and survey data. You'll ensure data quality and logistics run smoothly across multiple concurrent projects.",
  },
  {
    title: "Machine Learning Data Engineer",
    type: "Full-time",
    location: "Nairobi, Kenya (Hybrid)",
    department: "Engineering",
    description: "Build and maintain data pipelines that process, validate, and package AI training datasets at scale. Familiarity with Python, SQL, and cloud storage (AWS/GCP) required.",
  },
  {
    title: "Language & Linguistics Researcher",
    type: "Contract",
    location: "Remote (Kenya-based)",
    department: "Language Technology",
    description: "Support the development of datasets in Kenyan and East African languages. You'll assist with linguistic validation, transcription review, and dialect documentation.",
  },
  {
    title: "Client Success Manager",
    type: "Full-time",
    location: "Nairobi, Kenya",
    department: "Business Development",
    description: "Own client relationships from onboarding to delivery. You'll be the bridge between our technical team and AI/ML clients, ensuring projects are delivered on time and to spec.",
  },
]

const VALUES = [
  { title: "Dignified Work", body: "We believe in fair pay, flexible hours, and treating every contributor as a professional, not a resource." },
  { title: "Inclusion", body: "We actively recruit from communities historically excluded from the digital economy — and we build for them too." },
  { title: "Rigour", body: "Quality is not negotiable. We take pride in delivering datasets that make AI systems genuinely better." },
  { title: "Growth", body: "We invest in our team. From skills training to career development, we grow together." },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <MarketingHeader />

      {/* ── HERO ── */}
      <div className="border-b border-[#cdd2ce] bg-[#faf8f5] px-6">
        <div className="max-w-[1200px] mx-auto py-14">
          <p className="text-[#f06135] font-semibold text-sm mb-3 tracking-wide uppercase">We're Hiring</p>
          <h1 className="font-['DM_Serif_Display'] text-[44px] md:text-[56px] text-[#1a3848] leading-tight max-w-3xl">
            Build the future of AI in Africa with us
          </h1>
          <p className="text-[18px] text-[#455c68] mt-5 max-w-2xl leading-relaxed">
            At Rieng, you're not just doing a job — you're shaping how AI understands Africa. Join a team that values rigour, dignity, and impact.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">

        {/* ── VALUES ── */}
        <section className="py-16 border-b border-[#e8e4de]">
          <h2 className="font-['DM_Serif_Display'] text-[30px] text-[#1a3848] mb-10">Why Rieng?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white border border-[#e8e4de] rounded-xl p-6">
                <h3 className="font-['DM_Serif_Display'] text-[20px] text-[#1a3848] mb-2">{v.title}</h3>
                <p className="text-sm text-[#595551] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── OPEN ROLES ── */}
        <section className="py-16">
          <h2 className="font-['DM_Serif_Display'] text-[30px] text-[#1a3848] mb-10">Open Positions</h2>
          <div className="space-y-4">
            {OPEN_ROLES.map((role, i) => (
              <div key={i} className="bg-white border border-[#e8e4de] rounded-xl p-7 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow group">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[rgba(240,97,53,0.08)] text-[#f06135]">{role.department}</span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f0ece5] text-[#455c68] flex items-center gap-1">
                        <Briefcase size={11} /> {role.type}
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f0ece5] text-[#455c68] flex items-center gap-1">
                        <MapPin size={11} /> {role.location}
                      </span>
                    </div>
                    <h3 className="font-['DM_Serif_Display'] text-[22px] text-[#1a3848] mb-2">{role.title}</h3>
                    <p className="text-sm text-[#595551] leading-relaxed max-w-2xl">{role.description}</p>
                  </div>
                  <a
                    href={`mailto:data@rieng.co.ke?subject=Application: ${encodeURIComponent(role.title)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3848] text-white rounded-lg text-sm font-semibold whitespace-nowrap self-start md:self-center group-hover:bg-[#f06135] transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    Apply Now <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SPONTANEOUS APPLICATION ── */}
        <section className="py-16 border-t border-[#e8e4de]">
          <div className="bg-[linear-gradient(135deg,#1a3848,#244f63)] rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-['DM_Serif_Display'] text-[28px] text-white mb-3">Don't see your role listed?</h2>
              <p className="text-[#a4b5be] max-w-lg leading-relaxed">
                We're always on the lookout for talented, mission-driven people. Send us your CV and a short note on how you'd like to contribute to Rieng's mission.
              </p>
            </div>
            <a
              href="mailto:data@rieng.co.ke?subject=Spontaneous Application — Rieng"
              style={{
                padding: "1rem 2rem", background: "#f06135", color: "#fff", borderRadius: "10px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem",
                textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                display: "inline-flex", alignItems: "center", gap: "0.5rem"
              }}
            >
              Send an Open Application <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </div>

      <MarketingFooter />
    </div>
  )
}
