import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Rieng — We Solve Data Gaps",
  description: "Rieng: Africa's leading field intelligence platform for field sales mapping, agent management, and territory planning.",
  icons: {
    icon: "/rieng_logo.jpg",
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
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

