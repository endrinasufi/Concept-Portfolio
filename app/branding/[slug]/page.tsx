import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandingProjectPageClient } from "@/components/branding/BrandingProjectPageClient";
import {
  absoluteUrl,
  canPreviewDrafts,
  loadBrandingBySlug,
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
  const previewRequested = sp.preview === "true";
  const project = await loadBrandingBySlug(slug, previewRequested);
  if (!project) {
    return { title: "Projekt nuk u gjet" };
  }
  const og = await mediaPublicUrl(project.coverMediaId);
  return {
    title: project.metaTitle || project.title,
    description:
      project.metaDescription ||
      project.shortDescription ||
      `Projekt branding: ${project.title} — Concept Marketing Albania`,
    openGraph: og
      ? { images: [{ url: og }] }
      : { images: [{ url: absoluteUrl("/og-default.png") }] },
  };
}

export default async function BrandingProjectPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const previewRequested = sp.preview === "true";
  const isPreview = await canPreviewDrafts(previewRequested);
  const project = await loadBrandingBySlug(slug, previewRequested);
  if (!project) notFound();
  return (
    <BrandingProjectPageClient
      slug={slug}
      isPreview={isPreview && project.status === "draft"}
      initialProject={project}
    />
  );
}
