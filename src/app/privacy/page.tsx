"use client"
import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <MarketingHeader />

      <div className="border-b border-[#cdd2ce] bg-[#faf8f5] px-6">
        <div className="max-w-[1200px] mx-auto py-10">
          <p className="text-sm text-[#738a94] mb-2">Legal</p>
          <h1 className="font-['DM_Serif_Display'] text-[40px] text-[#1a3848]">Privacy Policy</h1>
          <p className="text-sm text-[#738a94] mt-2">Last updated: August 2025</p>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 py-16 space-y-12 text-[16px] leading-[1.85] text-[#455c68]">

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">1. Introduction</h2>
          <p>Rieng Technologies Ltd ("Rieng", "we", "us", or "our") is committed to protecting the privacy of all individuals who interact with our website and services. This Privacy Policy explains how we collect, use, store, and share your personal information in compliance with the Kenya Data Protection Act 2019 and applicable international data protection standards.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">2. Information We Collect</h2>
          <p>We may collect the following categories of information:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Identity Data:</strong> Full name, date of birth, national ID or passport number (for contributor verification)</li>
            <li><strong>Contact Data:</strong> Email address, phone number, physical address</li>
            <li><strong>Financial Data:</strong> Bank account or M-Pesa details (for contributor payments)</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device identifiers, and usage logs</li>
            <li><strong>Contribution Data:</strong> Audio recordings, images, text annotations, and survey responses submitted through our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">3. How We Use Your Data</h2>
          <p>We use your personal data to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Manage accounts, onboarding, and payments for contributors and clients</li>
            <li>Deliver and improve our data collection and annotation services</li>
            <li>Comply with legal obligations, including tax and employment law</li>
            <li>Communicate service updates, relevant opportunities, and support</li>
            <li>Detect and prevent fraud or misuse of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">4. Legal Basis for Processing</h2>
          <p>We process personal data based on one or more of the following grounds: your explicit <strong>consent</strong>, the necessity to fulfil a <strong>contract</strong> with you, compliance with a <strong>legal obligation</strong>, or our <strong>legitimate interests</strong> in operating and improving our services.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">5. Data Sharing</h2>
          <p>Rieng does not sell personal data. We may share data with:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Clients:</strong> Datasets delivered to clients are anonymised or de-identified unless otherwise agreed</li>
            <li><strong>Service Providers:</strong> Cloud storage, payment processors, and other third parties operating under strict data processing agreements</li>
            <li><strong>Regulators:</strong> When required by Kenyan law or court order</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">6. Data Retention</h2>
          <p>We retain personal data only as long as necessary for the purposes outlined in this policy, or as required by law. Contributor payment records are retained for a minimum of 7 years in accordance with Kenyan tax law. You may request deletion of your data at any time, subject to legal retention requirements.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">7. Your Rights</h2>
          <p>Under the Kenya Data Protection Act 2019, you have the right to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (where no legal obligation to retain exists)</li>
            <li>Object to certain types of processing</li>
            <li>Lodge a complaint with the Office of the Data Protection Commissioner (ODPC)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">8. Data Security</h2>
          <p>We implement industry-standard technical and organisational measures to protect your data, including encryption in transit and at rest, role-based access controls, and regular security audits.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">9. International Transfers</h2>
          <p>Some of our service providers may be located outside Kenya. Where data is transferred internationally, we ensure appropriate safeguards are in place, including Standard Contractual Clauses or equivalent mechanisms.</p>
        </section>

        <section className="border-t border-[#e8e4de] pt-10">
          <p className="text-sm text-[#738a94]">To exercise your rights or ask questions about this policy, contact our Data Protection Officer at <a href="mailto:data@rieng.co.ke" className="text-[#f06135] underline">data@rieng.co.ke</a>.</p>
        </section>
      </div>

      <MarketingFooter />
    </div>
  )
}
