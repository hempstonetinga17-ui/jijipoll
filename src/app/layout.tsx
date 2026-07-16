import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });

export const metadata: Metadata = {
  title: "JijiPoll — Field Maps & Agent Management",
  description: "Field sales mapping, agent management, and team coordination platform.",
  icons: {
    icon: "/jijipoll.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to tile servers to reduce map load latency */}
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://c.basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://ipapi.co" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
