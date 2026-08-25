import type { Metadata } from "next";
import { SocialMediaListClient } from "@/components/social-media/SocialMediaListClient";
import { loadPublishedSocial } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Social Media",
  description: "Social Media projects — Concept Marketing Albania.",
};

export default async function SocialMediaPage() {
  const projects = await loadPublishedSocial();
  return <SocialMediaListClient initialProjects={projects} />;
}
