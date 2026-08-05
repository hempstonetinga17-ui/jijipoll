"use client"
import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <MarketingHeader />

      <div className="border-b border-[#cdd2ce] bg-[#faf8f5] px-6">
        <div className="max-w-[1200px] mx-auto py-10">
          <p className="text-sm text-[#738a94] mb-2">Legal</p>
          <h1 className="font-['DM_Serif_Display'] text-[40px] text-[#1a3848]">Cookie Policy</h1>
          <p className="text-sm text-[#738a94] mt-2">Last updated: August 2025</p>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 py-16 space-y-12 text-[16px] leading-[1.85] text-[#455c68]">

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">1. What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences and activity, making your experience smoother and more personalised. Rieng Technologies Ltd ("Rieng") uses cookies on this website to improve functionality and understand how visitors interact with our content.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">2. Types of Cookies We Use</h2>
          <div className="space-y-6 mt-2">
            <div className="bg-white border border-[#e8e4de] rounded-xl p-6">
              <h3 className="font-semibold text-[#1a3848] mb-2">Strictly Necessary Cookies</h3>
              <p className="text-sm">These cookies are essential for the website to function properly. They enable core features like security, authentication, and session management. You cannot opt out of these cookies.</p>
            </div>
            <div className="bg-white border border-[#e8e4de] rounded-xl p-6">
              <h3 className="font-semibold text-[#1a3848] mb-2">Performance & Analytics Cookies</h3>
              <p className="text-sm">These cookies collect anonymous information about how visitors use our website — such as which pages are most visited and any error messages encountered. This helps us improve site performance. We may use tools such as Google Analytics for this purpose.</p>
            </div>
            <div className="bg-white border border-[#e8e4de] rounded-xl p-6">
              <h3 className="font-semibold text-[#1a3848] mb-2">Functionality Cookies</h3>
              <p className="text-sm">These cookies allow the website to remember choices you make (such as language preferences or form data) to provide a more personalised experience.</p>
            </div>
            <div className="bg-white border border-[#e8e4de] rounded-xl p-6">
              <h3 className="font-semibold text-[#1a3848] mb-2">Targeting / Marketing Cookies</h3>
              <p className="text-sm">These cookies may be set by our advertising partners to build a profile of your interests and show relevant ads on other sites. We currently use these on a limited basis and only with your consent.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">3. Third-Party Cookies</h2>
          <p>Some cookies may be set by third-party services embedded on our site, such as Google Analytics, LinkedIn Insight Tag, or embedded video players. These third parties have their own privacy policies and we recommend reviewing them. Rieng does not control these cookies.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">4. Cookie Retention</h2>
          <p>Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period, ranging from 30 days to 2 years, depending on their purpose.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">5. Managing Cookies</h2>
          <p>You can control and/or delete cookies at any time through your browser settings. Most browsers allow you to refuse cookies or delete existing ones. Please note that disabling certain cookies may affect the functionality of our website.</p>
          <p className="mt-3">For guidance on managing cookies in popular browsers:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies</li>
            <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security</li>
            <li><strong>Safari:</strong> Preferences → Privacy</li>
            <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">6. Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>
        </section>

        <section className="border-t border-[#e8e4de] pt-10">
          <p className="text-sm text-[#738a94]">Questions about our use of cookies? Email us at <a href="mailto:data@rieng.co.ke" className="text-[#f06135] underline">data@rieng.co.ke</a> or visit our <Link href="/privacy" className="text-[#f06135] underline">Privacy Policy</Link>.</p>
        </section>
      </div>

      <MarketingFooter />
    </div>
  )
}
