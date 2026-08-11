import type { BrandingProject } from "@/types/branding";
import { SEED_COVERS } from "@/lib/data/seed";

export type ProjectPhoto = {
  mediaId?: string;
  imageUrl?: string;
};

/** Të gjitha fotot e projektit përveç logos. */
export function collectProjectPhotos(project: BrandingProject): ProjectPhoto[] {
  const exclude = new Set<string>();
  if (project.logoMediaId) exclude.add(project.logoMediaId);

  const out: ProjectPhoto[] = [];
  const seen = new Set<string>();

  function add(mediaId?: string | null, imageUrl?: string | null) {
    const mid = mediaId?.trim() || undefined;
    const url = imageUrl?.trim() || undefined;
    if (mid && exclude.has(mid)) return;
    if (!mid && !url) return;
    const key = mid ? `id:${mid}` : `url:${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ mediaId: mid, imageUrl: url });
  }

  add(project.coverMediaId);
  add(project.mockupMediaId);
  add(project.coverInsetMediaId);

  for (const id of project.aboutPuzzleMediaIds ?? []) {
    add(id);
  }

  for (const g of project.gallery ?? []) {
    add(g.mediaId);
  }
  for (const row of project.galleryRows ?? []) {
    for (const g of row.items ?? []) {
      add(g.mediaId);
    }
  }

  for (const section of project.sections ?? []) {
    if (section.type === "logo") continue;
    const c = section.content ?? {};
    add(
      c.mediaId as string | undefined,
      c.imageUrl as string | undefined,
    );
    for (const key of ["A", "B", "C"] as const) {
      add(
        c[`mediaId${key}`] as string | undefined,
        c[`imageUrl${key}`] as string | undefined,
      );
    }
    if (Array.isArray(c.mediaIds)) {
      for (const id of c.mediaIds) {
        if (typeof id === "string") add(id);
      }
    }
  }

  const seed = SEED_COVERS[project.slug];
  if (seed?.cover) add(undefined, seed.cover);

  return out;
}
