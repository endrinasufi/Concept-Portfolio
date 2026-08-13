import type { Metadata } from "next";
import { PhotoshootingListClient } from "@/components/photoshooting/PhotoshootingListClient";
import { loadPublishedPhotoshooting } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photoshooting",
  description: "Projekte Photoshooting — Concept Marketing Albania.",
};

export default async function PhotoshootingPage() {
  const projects = await loadPublishedPhotoshooting();
  return <PhotoshootingListClient initialProjects={projects} />;
}
