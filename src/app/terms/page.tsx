"use client"
import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <MarketingHeader />

      <div className="border-b border-[#cdd2ce] bg-[#faf8f5] px-6">
        <div className="max-w-[1200px] mx-auto py-10">
          <p className="text-sm text-[#738a94] mb-2">Legal</p>
          <h1 className="font-['DM_Serif_Display'] text-[40px] text-[#1a3848]">Terms & Conditions</h1>
          <p className="text-sm text-[#738a94] mt-2">Last updated: August 2025</p>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 py-16 space-y-12 text-[16px] leading-[1.85] text-[#455c68]">

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using any services provided by Rieng Technologies Ltd ("Rieng", "we", "us", or "our"), including our website at <strong>rieng.co.ke</strong> and any associated platforms, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">2. Description of Services</h2>
          <p>Rieng Technologies Ltd provides data collection, data annotation, and AI training dataset services across Kenya and broader Africa. Our services include but are not limited to: audio collection, image captioning, language dataset creation, field data collection, and related consulting services.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">3. User Eligibility</h2>
          <p>You must be at least 18 years of age to use our platform services. By using our services, you represent and warrant that you have the legal capacity to enter into a binding agreement with Rieng.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">4. Data Ownership & Licensing</h2>
          <p>All data collected through Rieng-managed projects, unless otherwise agreed in writing, shall be owned by the client who commissioned the dataset. Rieng retains the right to use anonymised, aggregate insights derived from such data for internal research and service improvement purposes, subject to applicable laws and contractual obligations.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">5. Contributor Rights</h2>
          <p>Data contributors (field agents, annotators, and other workers) retain their rights as employees or contractors under applicable Kenyan labour law. Rieng is committed to ethical practices, fair compensation, and safe working conditions. Contributors will not be compelled to submit data without informed consent.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">6. Prohibited Activities</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Misrepresent your identity or affiliation when accessing our platforms</li>
            <li>Submit fraudulent, fabricated, or plagiarised data</li>
            <li>Attempt to reverse-engineer, hack, or disrupt our systems</li>
            <li>Use our services for any unlawful purpose or in violation of any regulations</li>
            <li>Resell or redistribute Rieng datasets without written authorisation</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">7. Intellectual Property</h2>
          <p>All trademarks, logos, platform designs, and proprietary methodologies used by Rieng are the exclusive intellectual property of Rieng Technologies Ltd. Unauthorised reproduction or use is strictly prohibited.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Rieng shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of our services, including loss of data, loss of profits, or business interruption.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">9. Changes to Terms</h2>
          <p>Rieng reserves the right to modify these Terms at any time. We will notify registered users via email of any material changes. Continued use of our services after changes constitutes acceptance of the revised terms.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">10. Governing Law</h2>
          <p>These Terms are governed by the laws of the Republic of Kenya. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.</p>
        </section>

        <section className="border-t border-[#e8e4de] pt-10">
          <p className="text-sm text-[#738a94]">For questions about these Terms, contact us at <a href="mailto:data@rieng.co.ke" className="text-[#f06135] underline">data@rieng.co.ke</a> or reach out via our <Link href="/contact" className="text-[#f06135] underline">Contact page</Link>.</p>
        </section>
      </div>

      <MarketingFooter />
    </div>
  )
}
