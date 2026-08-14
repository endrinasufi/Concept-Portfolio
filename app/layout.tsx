import type { Metadata } from "next";
import { Fraunces, Outfit, Six_Caps } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
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

const sixCaps = Six_Caps({
  variable: "--font-six-caps",
  weight: "400",
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
    <html
      lang="sq"
      className={`${fraunces.variable} ${outfit.variable} ${sixCaps.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <main className="relative z-0 flex-1">{children}</main>
        <SiteFooter />
        <SiteHeader />
        <PageViewTracker />
      </body>
    </html>
  );
}
