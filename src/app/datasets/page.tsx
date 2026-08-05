"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"
import { Database, Filter, Search, ChevronRight, Check } from "lucide-react"

// Mock Data for Kenyan probationary projects
const MOCK_DATASETS = [
  { id: "1", name: "Swahili General Dual Channel Conversations", hours: 2000, language: "Swahili", type: "Conversational" },
  { id: "2", name: "Kikuyu General Dual Channel Conversations", hours: 500, language: "Kikuyu", type: "Conversational" },
  { id: "3", name: "Luo General Dual Channel Conversations", hours: 500, language: "Luo", type: "Conversational" },
  { id: "4", name: "Sheng Voice Commands & Queries", hours: 600, language: "Sheng", type: "Voice Commands" },
  { id: "5", name: "Kalenjin Read Speech Corpus", hours: 300, language: "Kalenjin", type: "Read Speech" },
  { id: "6", name: "Kenyan English Customer Support Transcripts", hours: 1000, language: "English (KE)", type: "Text" },
]

const TYPES = ["All", "Read Speech", "Voice Commands", "Conversational", "Video", "Text"]
const LANGUAGES = ["All languages", "Swahili", "Kikuyu", "Luo", "Sheng", "Kalenjin", "English (KE)"]

export default function DatasetsCatalog() {
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [langFilter, setLangFilter] = useState<string>("All languages")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDatasets = useMemo(() => {
    return MOCK_DATASETS.filter(d => {
      const matchesType = typeFilter === "All" || d.type === typeFilter
      const matchesLang = langFilter === "All languages" || d.language === langFilter
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesLang && matchesSearch
    })
  }, [typeFilter, langFilter, searchQuery])

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>
      {/* Navigation */}
      <MarketingHeader />

      {/* Page Header */}
      <div className="bg-[#faf8f5] border-b border-[#cdd2ce] py-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-['DM_Serif_Display'] text-4xl text-[#1a3848]">Data Catalogue</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-10">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-56 shrink-0 space-y-10">
          <div>
            <div className="text-sm font-semibold tracking-wider text-[#1a3848] mb-4 uppercase">
              {filteredDatasets.length} Results
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-[#455c68] uppercase tracking-widest mb-4">Type</h3>
            <div className="space-y-3">
              {TYPES.map(type => (
                <button 
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className="flex items-center gap-3 w-full text-left text-sm font-medium text-[#455c68] hover:text-[#1a3848] transition group"
                >
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${typeFilter === type ? 'bg-[#1a3848] border-[#1a3848]' : 'border-[#b5c2c7] group-hover:border-[#1a3848]'}`}>
                    {typeFilter === type && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#455c68] uppercase tracking-widest mb-4">Language</h3>
            <div className="space-y-3">
              {LANGUAGES.map(lang => (
                <button 
                  key={lang}
                  onClick={() => setLangFilter(lang)}
                  className="flex items-center gap-3 w-full text-left text-sm font-medium text-[#455c68] hover:text-[#1a3848] transition group"
                >
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${langFilter === lang ? 'bg-[#1a3848] border-[#1a3848]' : 'border-[#b5c2c7] group-hover:border-[#1a3848]'}`}>
                    {langFilter === lang && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid and Search */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#cdd2ce]">
            <div className="relative w-full max-w-md flex items-center">
              <Search className="w-4 h-4 text-[#8a9b9e] absolute left-0" />
              <input 
                type="text" 
                placeholder="Search by language, domain, or type"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 pl-7 text-[#1a3848] placeholder:text-[#8a9b9e] font-medium"
                style={{ outline: 'none' }}
              />
            </div>
            <div className="text-sm font-medium text-[#455c68] flex items-center gap-2">
              Sort By: <span className="text-[#1a3848] flex items-center cursor-pointer">Default <ChevronRight className="w-4 h-4 ml-1 rotate-90" /></span>
            </div>
          </div>

          {filteredDatasets.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#455c68] font-medium">No datasets found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#cdd2ce] border border-[#cdd2ce]">
              {filteredDatasets.map(d => (
                <div key={d.id} className="bg-white p-8 flex flex-col hover:bg-neutral-50 transition cursor-pointer min-h-[220px]">
                  <h3 className="text-xl font-['DM_Serif_Display'] text-[#1a3848] leading-tight mb-auto">
                    {d.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-[#455c68] mt-8">
                    <span>{d.hours} hours</span>
                    <span className="text-[#b5c2c7]">|</span>
                    <span>{d.language}</span>
                    <span className="text-[#b5c2c7]">|</span>
                    <span>{d.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MarketingFooter />
    </div>
  )
}
