import type { BrandingProject } from "@/types/branding";
import { SEED_COVERS } from "@/lib/data/seed";

export function getProjectCover(project: BrandingProject): {
  coverUrl?: string;
  coverMediaId?: string;
  logoUrl?: string;
  mockupMediaId?: string;
  mockupUrl?: string;
} {
  const seed = SEED_COVERS[project.slug];
  const imageSection = project.sections.find((s) =>
    ["image", "fullWidthImage", "brandApplication"].includes(s.type),
  );
  const mockupSection = project.sections.find((s) => s.type === "mockup");

  const coverMediaId =
    project.coverMediaId ??
    (imageSection?.content.mediaId as string | undefined) ??
    undefined;
  const coverUrl =
    (imageSection?.content.imageUrl as string | undefined) ?? seed?.cover;

  const mockupMediaId =
    project.mockupMediaId ??
    (mockupSection?.content.mediaId as string | undefined) ??
    coverMediaId;
  const mockupUrl =
    (mockupSection?.content.imageUrl as string | undefined) ?? coverUrl;

  return {
    coverUrl,
    coverMediaId,
    logoUrl: seed?.logo,
    mockupMediaId,
    mockupUrl,
  };
}
