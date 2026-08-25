import type { Metadata } from "next";
import { Fraunces, Inter, Six_Caps } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteFavicon } from "@/components/layout/SiteFavicon";
import { AdminFrontDock } from "@/components/layout/AdminFrontDock";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_NAME,
  siteMetadataBase,
} from "@/lib/seo/metadata";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
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
  metadataBase: siteMetadataBase(),
  title: {
    default: `${SITE_NAME} — Branding`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Branding`,
    description: SITE_DEFAULT_DESCRIPTION,
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${sixCaps.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <OrganizationJsonLd />
        <main className="relative z-0 flex-1">{children}</main>
        <SiteFooter />
        <SiteHeader />
        <SiteFavicon />
        <AdminFrontDock />
        <PageViewTracker />
      </body>
    </html>
  );
}
