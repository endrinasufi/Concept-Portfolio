import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { contactPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { loadSiteSettings } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  path: "/kontakt",
  description:
    "Get in touch for branding, social media, web design, video, and photoshooting.",
  metaTitle: "Contact",
  metaDescription:
    "Contact Concept Marketing Albania — tell us about your next project.",
  service: "contact",
});

export default async function KontaktPage() {
  const settings = await loadSiteSettings();
  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <ContactPageClient settings={settings} />
    </>
  );
}
