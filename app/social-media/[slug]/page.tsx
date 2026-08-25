import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SocialMediaProjectPageClient } from "@/components/social-media/SocialMediaProjectPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { creativeWorkJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  absoluteUrl,
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
  const previewRequested = sp.preview === "true";
  const project = await loadSocialBySlug(slug, previewRequested);
  if (!project) return { title: "Project not found", robots: { index: false } };
  const og = await mediaPublicUrl(project.coverMediaId);
  return buildPageMetadata({
    title: project.title,
    path: `/social-media/${project.slug}`,
    description:
      project.block2?.projectChallenge ||
      project.block2?.result ||
      project.serviceLabel,
    metaTitle: project.seo?.metaTitle,
    metaDescription: project.seo?.metaDescription,
    imageUrl: og,
    isPreview: previewRequested,
    service: "social-media",
    client: project.clientName,
  });
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
  const og = await mediaPublicUrl(project.coverMediaId);
  return (
    <>
      <JsonLd
        data={creativeWorkJsonLd({
          title: project.seo?.metaTitle || project.title,
          description:
            project.seo?.metaDescription ||
            project.block2?.projectChallenge ||
            project.serviceLabel,
          url: absoluteUrl(`/social-media/${project.slug}`),
          image: og,
          service: "social-media",
          client: project.clientName,
          dateModified: project.updatedAt,
        })}
      />
      <SocialMediaProjectPageClient
        slug={slug}
        isPreview={isPreview && project.status === "draft"}
        initialProject={project}
      />
    </>
  );
}
