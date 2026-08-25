import type { Metadata } from "next";
import { BrandingListClient } from "@/components/branding/BrandingListClient";
import { loadPublishedBranding } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Branding",
  description: "Branding projects from Concept Marketing Albania.",
};

export default async function BrandingPage() {
  const projects = await loadPublishedBranding();
  return <BrandingListClient initialProjects={projects} />;
}
