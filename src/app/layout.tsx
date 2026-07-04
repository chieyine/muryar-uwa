import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muryar Uwa - Digital Health & Nutrition Follow-Up",
  description: "A secure, voice-first digital follow-up platform supporting mothers, pregnant women, and caregivers across Primary Health Care centers.",
  keywords: [
    "Muryar Uwa",
    "FRAD Foundation",
    "Maternal Health Portal",
    "Nutrition Tracing",
    "MUAC Screening",
    "Tom Brown Demonstration",
    "Secondary Care Referrals",
  ],
  authors: [{ name: "FRAD Foundation Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
