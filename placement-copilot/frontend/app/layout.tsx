import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Placement Copilot | AI-Powered Placement Prep",
  description:
    "AI-powered mock interviews, resume review, and skill gap analysis to accelerate your career journey.",
  keywords: "placement prep, AI interview, resume review, skill gap analysis, coding practice",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#7C3AED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        style={{
          fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
          backgroundColor: "#FCFCFF",
          color: "#6B7280",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  );
}
