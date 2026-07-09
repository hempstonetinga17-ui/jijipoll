import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JijiPoll — Field Maps & Agent Management",
  description: "Field sales mapping, agent management, and team coordination platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
