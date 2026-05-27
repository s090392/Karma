import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karma - Career Safety Intelligence",
  description:
    "Find your Career Safety Score, Career Safety Window, and 90-day action plan for the AI and robotics era.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Karma - Is your career protected from AI?",
    description: "Career Safety Score in minutes. Private, global-English, and built for professionals under automation pressure.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e9270",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
