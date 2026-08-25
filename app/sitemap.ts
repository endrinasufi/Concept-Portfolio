import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  loadPublishedBranding,
  loadPublishedPhotoshooting,
  loadPublishedSocial,
  loadPublishedWebDesign,
} from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [branding, social, web, photo] = await Promise.all([
    loadPublishedBranding(),
    loadPublishedSocial(),
    loadPublishedWebDesign(),
    loadPublishedPhotoshooting(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/branding",
    "/social-media",
    "/web-design",
    "/photoshooting",
    "/contact",
    "/video-production/social",
    "/video-production/production",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...branding.map((p) => ({
      url: absoluteUrl(`/branding/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...social.map((p) => ({
      url: absoluteUrl(`/social-media/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...web.map((p) => ({
      url: absoluteUrl(`/web-design/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...photo.map((p) => ({
      url: absoluteUrl(`/photoshooting/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
