import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SocialMediaProjectPageClient } from "@/components/social-media/SocialMediaProjectPageClient";
import {
  canPreviewDrafts,
  loadSocialBySlug,
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
  const project = await loadSocialBySlug(slug, sp.preview === "true");
  if (!project) return { title: "Projekt nuk u gjet" };
  const og = await mediaPublicUrl(project.coverMediaId);
  return {
    title: project.seo?.metaTitle || project.title,
    description:
      project.seo?.metaDescription ||
      `Projekt Social Media: ${project.title} — Concept Marketing Albania`,
    openGraph: og ? { images: [{ url: og }] } : undefined,
  };
}

export default async function SocialMediaProjectPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const previewRequested = sp.preview === "true";
  const isPreview = await canPreviewDrafts(previewRequested);
  const project = await loadSocialBySlug(slug, previewRequested);
  if (!project) notFound();
  return (
    <SocialMediaProjectPageClient
      slug={slug}
      isPreview={isPreview && project.status === "draft"}
      initialProject={project}
    />
  );
}
