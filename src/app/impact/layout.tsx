import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Impact | Rieng",
  description: "Learn how Rieng creates positive social impact, offering high wages and dignified living for data workers in Africa.",
}

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
