import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export const metadata = {
  title: "Case Studies | Rieng",
  description: "Explore how Rieng's high-quality Kenyan datasets are powering AI models across the globe.",
}

const CASE_STUDIES = [
  {
    tag: "Multilingual Captioning",
    title: "A pipeline for image and scene captioning across 10 Kenyan languages, providing nuanced local context.",
    stat: "500k+ captions collected",
    client: "Global AI Lab",
    year: "2024",
    desc: "Working with a leading AI research institution, we built a full data pipeline to collect, annotate, and verify over 500,000 image captions across 10 Kenyan languages — enabling culturally aware vision-language models.",
    tags: ["Computer Vision", "NLP", "Multilingual"],
  },
  {
    tag: "Audio Dataset Project",
    title: "High-fidelity speech recordings across Swahili, Kikuyu, Luo, and Kalenjin for frontier ASR and TTS models.",
    stat: "80k+ audio clips · 12 languages",
    client: "Speech AI Startup",
    year: "2024",
    desc: "We deployed our distributed workforce to collect diverse, high-quality audio recordings across Kenya's major language groups. The dataset now powers a leading ASR and TTS system serving millions of users.",
    tags: ["Speech", "ASR", "TTS", "Audio"],
  },
  {
    tag: "LLM Bias Evaluation",
    title: "Community-led evaluation of large language models for cultural sensitivity in East African contexts.",
    stat: "15k+ evaluation prompts",
    client: "International NGO",
    year: "2023",
    desc: "We ran a structured evaluation study using local community members to assess LLM responses for cultural sensitivity, bias, and factual accuracy in East African contexts — producing a benchmark dataset used by 3 major AI labs.",
    tags: ["LLM", "Bias", "Evaluation", "Benchmarking"],
  },
  {
    tag: "Visual Grounding",
    title: "Geo-tagged images of everyday Kenyan environments precisely labeled for computer vision training.",
    stat: "200k+ geo-tagged images",
    client: "AgriTech Partner",
    year: "2023",
    desc: "Using our field agent network, we captured and precisely labeled 200,000+ geo-tagged images of agricultural environments, market scenes, and urban infrastructure across 45 Kenyan counties.",
    tags: ["Computer Vision", "Geo-tagging", "Agriculture"],
  },
  {
    tag: "Human-in-the-Loop",
    title: "Verified data enrichment tasks, crowdsourced and quality-checked by our skilled local workforce.",
    stat: "1M+ verified data points",
    client: "E-commerce Platform",
    year: "2024",
    desc: "For a pan-African e-commerce platform, we provided structured HITL data enrichment services — categorizing, translating, and verifying product listings in Swahili and local languages at scale.",
    tags: ["HITL", "Data Enrichment", "E-commerce"],
  },
]

export default function CaseStudiesPage() {
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
        .case-study-card {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .case-study-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
      `}</style>

      <MarketingHeader />

      {/* Page Header */}
      <div style={{ borderBottom: "1px solid #e0d9d0", background: "#faf8f5", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#f06135", marginBottom: "0.5rem" }}>
            Our Work
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1a1a1a", lineHeight: 1.1, margin: 0 }}>
            Case Studies
          </h1>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 400, fontSize: "1rem", color: "#6a6460", marginTop: "0.75rem", maxWidth: "560px" }}>
            Real-world projects where our datasets and workforce powered breakthrough AI capabilities.
          </p>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {CASE_STUDIES.map((cs, i) => (
            <div key={i} className="case-study-card" style={{
              background: "#fff", border: "1px solid #e0d9d0", borderRadius: "16px",
              padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{
                  background: "rgba(240,97,53,0.08)", color: "#f06135",
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", padding: "0.3rem 0.75rem", borderRadius: "999px",
                  border: "1px solid rgba(240,97,53,0.15)"
                }}>{cs.tag}</span>
                <span style={{ fontSize: "0.78rem", color: "#a09890", fontWeight: 500 }}>{cs.year}</span>
              </div>

              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "1.15rem", color: "#1a1a1a", lineHeight: 1.4, margin: 0 }}>
                {cs.title}
              </h2>

              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.875rem", color: "#6a6460", lineHeight: 1.65, margin: 0 }}>
                {cs.desc}
              </p>

              <div style={{ padding: "0.9rem 1rem", background: "#faf8f5", borderRadius: "10px", border: "1px solid #e0d9d0" }}>
                <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.1rem", color: "#f06135", margin: 0, marginBottom: "0.2rem" }}>{cs.stat}</p>
                <p style={{ fontSize: "0.72rem", color: "#8a8178", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Impact</p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {cs.tags.map(t => (
                  <span key={t} style={{
                    background: "#f0ece5", color: "#6a6460",
                    fontSize: "0.7rem", fontWeight: 600, padding: "0.25rem 0.6rem", borderRadius: "6px"
                  }}>{t}</span>
                ))}
              </div>

              <div style={{ marginTop: "auto", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "#a09890", fontWeight: 500 }}>Client: {cs.client}</span>
                <Link href="/contact" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.3rem",
                  fontSize: "0.82rem", fontWeight: 700, color: "#f06135", textDecoration: "none"
                }}>
                  Get Similar Data <ArrowUpRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: "4rem", background: "linear-gradient(135deg, #e8f4f0 0%, #d4eae4 100%)",
          borderRadius: "20px", padding: "3rem 2rem", textAlign: "center"
        }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#1a3a34", marginBottom: "1rem" }}>
            Ready to start your own data project?
          </h2>
          <p style={{ fontFamily: "'Manrope', sans-serif", color: "#3a6a5a", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
            Tell us what you need and we'll deploy our workforce to collect it.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" style={{
              padding: "0.85rem 2rem", background: "#f06135", color: "#fff", borderRadius: "8px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none", boxShadow: "0 4px 18px rgba(240,97,53,0.35)"
            }}>Contact Our Data Team</Link>
            <Link href="/datasets" style={{
              padding: "0.85rem 2rem", background: "transparent", color: "#1a3a34",
              border: "1.5px solid #1a3a34", borderRadius: "8px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none"
            }}>Browse Data Catalogue</Link>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
