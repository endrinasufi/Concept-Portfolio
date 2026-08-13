import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoshootingProjectPageClient } from "@/components/photoshooting/PhotoshootingProjectPageClient";
import {
  canPreviewDrafts,
  loadPhotoshootingBySlug,
  mediaPublicUrl,
} from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const project = await loadPhotoshootingBySlug(slug, sp.preview === "true");
  if (!project) return { title: "Projekt nuk u gjet" };
  const og = await mediaPublicUrl(project.coverMediaId);
  return {
    title: project.title,
    description:
      project.shortDescription ||
      `Photoshooting: ${project.title} — Concept Marketing Albania`,
    openGraph: og ? { images: [{ url: og }] } : undefined,
  };
}

export default async function PhotoshootingProjectPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const previewRequested = sp.preview === "true";
  const isPreview = await canPreviewDrafts(previewRequested);
  const project = await loadPhotoshootingBySlug(slug, previewRequested);
  if (!project) notFound();
  return (
    <PhotoshootingProjectPageClient
      slug={slug}
      isPreview={isPreview && project.status === "draft"}
      initialProject={project}
    />
  );
}
