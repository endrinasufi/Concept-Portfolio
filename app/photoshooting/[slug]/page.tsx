import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoshootingProjectPageClient } from "@/components/photoshooting/PhotoshootingProjectPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { creativeWorkJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  absoluteUrl,
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
  const previewRequested = sp.preview === "true";
  const project = await loadPhotoshootingBySlug(slug, previewRequested);
  if (!project) return { title: "Project not found", robots: { index: false } };
  const og = await mediaPublicUrl(project.coverMediaId);
  return buildPageMetadata({
    title: project.title,
    path: `/photoshooting/${project.slug}`,
    description: project.shortDescription,
    metaTitle: project.metaTitle,
    metaDescription: project.metaDescription,
    imageUrl: og,
    isPreview: previewRequested,
    service: "photoshooting",
    client: project.clientName,
  });
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
  const og = await mediaPublicUrl(project.coverMediaId);
  return (
    <>
      <JsonLd
        data={creativeWorkJsonLd({
          title: project.metaTitle || project.title,
          description: project.metaDescription || project.shortDescription,
          url: absoluteUrl(`/photoshooting/${project.slug}`),
          image: og,
          service: "photoshooting",
          client: project.clientName,
          dateModified: project.updatedAt,
        })}
      />
      <PhotoshootingProjectPageClient
        slug={slug}
        isPreview={isPreview && project.status === "draft"}
        initialProject={project}
      />
    </>
  );
}
