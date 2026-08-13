import type { Metadata } from "next";
import { WebDesignListClient } from "@/components/web-design/WebDesignListClient";
import { loadPublishedWebDesign } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Web Design",
  description: "Projekte Web Design — Concept Marketing Albania.",
};

export default async function WebDesignPage() {
  const projects = await loadPublishedWebDesign();
  return <WebDesignListClient initialProjects={projects} />;
}
