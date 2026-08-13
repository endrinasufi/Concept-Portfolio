import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebDesignProjectPageClient } from "@/components/web-design/WebDesignProjectPageClient";
import {
  canPreviewDrafts,
  loadPublishedWebDesign,
  loadWebDesignBySlug,
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
  const project = await loadWebDesignBySlug(slug, sp.preview === "true");
  if (!project) return { title: "Projekt nuk u gjet" };
  const og = await mediaPublicUrl(project.coverMediaId);
  return {
    title: project.seo?.metaTitle || project.title,
    description:
      project.seo?.metaDescription ||
      project.description ||
      `Projekt Web Design: ${project.title} — Concept Marketing Albania`,
    openGraph: og ? { images: [{ url: og }] } : undefined,
  };
}

export default async function WebDesignProjectPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const previewRequested = sp.preview === "true";
  const isPreview = await canPreviewDrafts(previewRequested);
  const [project, published] = await Promise.all([
    loadWebDesignBySlug(slug, previewRequested),
    loadPublishedWebDesign(),
  ]);
  if (!project) notFound();
  return (
    <WebDesignProjectPageClient
      slug={slug}
      isPreview={isPreview && project.status === "draft"}
      initialProject={project}
      initialPublished={published}
    />
  );
}
