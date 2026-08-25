import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebDesignProjectPageClient } from "@/components/web-design/WebDesignProjectPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { creativeWorkJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  absoluteUrl,
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
  const previewRequested = sp.preview === "true";
  const project = await loadWebDesignBySlug(slug, previewRequested);
  if (!project) return { title: "Project not found", robots: { index: false } };
  const og = await mediaPublicUrl(project.coverMediaId);
  return buildPageMetadata({
    title: project.title,
    path: `/web-design/${project.slug}`,
    description: project.description,
    metaTitle: project.seo?.metaTitle,
    metaDescription: project.seo?.metaDescription,
    imageUrl: og,
    isPreview: previewRequested,
    service: "web-design",
    client: project.client,
  });
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
  const og = await mediaPublicUrl(project.coverMediaId);
  return (
    <>
      <JsonLd
        data={creativeWorkJsonLd({
          title: project.seo?.metaTitle || project.title,
          description: project.seo?.metaDescription || project.description,
          url: absoluteUrl(`/web-design/${project.slug}`),
          image: og,
          service: "web-design",
          client: project.client,
          dateModified: project.updatedAt,
        })}
      />
      <WebDesignProjectPageClient
        slug={slug}
        isPreview={isPreview && project.status === "draft"}
        initialProject={project}
        initialPublished={published}
      />
    </>
  );
}
