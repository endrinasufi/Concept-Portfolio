import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Concept Marketing Albania — Branding",
    template: "%s | Concept Marketing Albania",
  },
  description:
    "Portfolio branding nga Concept Marketing Albania. Identitete vizuale, sisteme marke dhe drejtim artistik.",
  openGraph: {
    title: "Concept Marketing Albania — Branding",
    description: "Portfolio branding editorial nga CMA.",
    type: "website",
    locale: "sq_AL",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" className={`${fraunces.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
