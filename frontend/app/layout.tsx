import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HPC Summer School Mini Hackathon Leaderboard",
  description:
    "Live leaderboard for the HCMUT HPC Summer School Mini Hackathon — real-time team rankings, score breakdowns, and agentic workflow metrics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
