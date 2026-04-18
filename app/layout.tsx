import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpthaEdgeDR — Diabetic Eye Disease Detection",
  description:
    "AI-powered diabetic retinopathy screening, severity grading, and multi-disease classification from retinal fundus images using a multi-task learning model.",
  keywords: [
    "diabetic retinopathy",
    "retinal screening",
    "eye disease detection",
    "AI diagnostics",
    "fundus image analysis",
    "OpthaEdgeDR",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
