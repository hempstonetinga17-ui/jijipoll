"use client"
import Link from "next/link"
import { MarketingHeader } from "@/components/layout/MarketingHeader"
import { MarketingFooter } from "@/components/layout/MarketingFooter"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 font-sans pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <MarketingHeader />

      <div className="border-b border-[#cdd2ce] bg-[#faf8f5] px-6">
        <div className="max-w-[1200px] mx-auto py-10">
          <p className="text-sm text-[#738a94] mb-2">Legal</p>
          <h1 className="font-['DM_Serif_Display'] text-[40px] text-[#1a3848]">Refund & Cancellation Policy</h1>
          <p className="text-sm text-[#738a94] mt-2">Last updated: August 2025</p>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 py-16 space-y-12 text-[16px] leading-[1.85] text-[#455c68]">

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">1. Overview</h2>
          <p>This Refund and Cancellation Policy outlines the conditions under which Rieng Technologies Ltd ("Rieng") will process refunds or cancellations for services rendered. Because our services involve coordination of human labour, data processing, and custom deliverables, our refund policy reflects the nature of these bespoke engagements.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">2. Project Cancellations</h2>
          <div className="space-y-5">
            <div className="border-l-4 border-[#f06135] pl-5">
              <h3 className="font-semibold text-[#1a3848] mb-1">Before Work Commences</h3>
              <p className="text-sm">If a client cancels a project before any data collection, annotation, or field work has begun, a full refund will be issued, minus any applicable administrative or onboarding fees (not exceeding 10% of the project value).</p>
            </div>
            <div className="border-l-4 border-[#d98324] pl-5">
              <h3 className="font-semibold text-[#1a3848] mb-1">After Work Has Commenced</h3>
              <p className="text-sm">If a client cancels after work has started, Rieng will invoice for the proportion of work completed at the agreed rate. Any unused prepaid balance beyond completed work will be refunded within 14 business days.</p>
            </div>
            <div className="border-l-4 border-[#1a3848] pl-5">
              <h3 className="font-semibold text-[#1a3848] mb-1">After Delivery</h3>
              <p className="text-sm">Refunds are not available for delivered datasets or completed services unless a quality issue is substantiated (see Section 4).</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">3. Subscription & Platform Fees</h2>
          <p>If Rieng offers subscription-based platform access, cancellations must be submitted at least <strong>7 days before the next billing cycle</strong> to avoid charges for the upcoming period. Refunds will not be issued for the current billing period once access has been granted, except in the case of a demonstrable platform outage exceeding 72 hours.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">4. Quality Disputes</h2>
          <p>If a delivered dataset does not meet the agreed quality specifications as defined in the project statement of work, clients must raise a formal quality dispute within <strong>14 days of delivery</strong>. Rieng will investigate and may offer one of the following resolutions:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Re-collection or re-annotation of affected data at no additional charge</li>
            <li>Partial credit toward future projects</li>
            <li>Partial refund proportional to the unmet deliverable volume</li>
          </ul>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">5. Contributor Payments</h2>
          <p>Payments to field agents and annotators are non-refundable once processed. Rieng ensures all contributor payments are made in full and on schedule as a commitment to our workers. In the event of fraudulent contribution submissions, Rieng reserves the right to withhold payment pending investigation.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">6. How to Request a Refund</h2>
          <p>To initiate a refund or cancellation, please contact us in writing at <a href="mailto:data@rieng.co.ke" className="text-[#f06135] underline">data@rieng.co.ke</a> with your project reference number, the reason for the request, and any supporting documentation. We aim to respond within 5 business days.</p>
        </section>

        <section>
          <h2 className="font-['DM_Serif_Display'] text-[24px] text-[#1a3848] mb-4">7. Force Majeure</h2>
          <p>Rieng shall not be liable for delays or cancellations caused by events beyond our reasonable control, including but not limited to natural disasters, government-imposed restrictions, or widespread telecommunications failures. In such cases, project timelines will be extended or renegotiated in good faith.</p>
        </section>

        <section className="border-t border-[#e8e4de] pt-10">
          <p className="text-sm text-[#738a94]">For cancellation or refund requests, contact us at <a href="mailto:data@rieng.co.ke" className="text-[#f06135] underline">data@rieng.co.ke</a> or call <strong>0710 588 758</strong>.</p>
        </section>
      </div>

      <MarketingFooter />
    </div>
  )
}
