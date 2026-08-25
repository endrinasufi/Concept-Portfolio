import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { loadSiteSettings } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Na shkruani Concept Marketing Albania — branding, social media, web design dhe drejtim artistik.",
};

export default async function ContactPage() {
  const settings = await loadSiteSettings();
  return <ContactPageClient initialSettings={settings} />;
}
