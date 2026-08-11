import type {
  GalleryColumns,
  GalleryItem,
  GalleryRow,
  BrandingProject,
} from "@/types/branding";
import { sortByOrder } from "@/lib/utils/id";

export const GALLERY_COLUMN_OPTIONS: GalleryColumns[] = [1, 2, 3, 4];

/** Rreshtat e galerisë — nga galleryRows, ose migrim nga gallery e vjetër. */
export function getGalleryRows(project: Pick<BrandingProject, "gallery" | "galleryRows">): GalleryRow[] {
  if (project.galleryRows?.length) {
    return sortByOrder(project.galleryRows).map((row) => ({
      ...row,
      columns: clampColumns(row.columns),
      items: sortByOrder(row.items ?? []).slice(0, clampColumns(row.columns)),
    }));
  }

  const flat = sortByOrder(project.gallery ?? []);
  if (!flat.length) return [];

  const rows: GalleryRow[] = [];
  const chunk = 2;
  for (let i = 0; i < flat.length; i += chunk) {
    const slice = flat.slice(i, i + chunk);
    rows.push({
      id: `migrated-row-${slice.map((s) => s.id).join("-")}`,
      order: rows.length,
      columns: Math.min(Math.max(slice.length, 1), 4) as GalleryColumns,
      items: slice.map((g, j) => ({ ...g, order: j })),
    });
  }
  return rows;
}

export function flattenGalleryRows(rows: GalleryRow[]): GalleryItem[] {
  const out: GalleryItem[] = [];
  for (const row of sortByOrder(rows)) {
    for (const item of sortByOrder(row.items)) {
      out.push({ ...item, order: out.length });
    }
  }
  return out;
}

export function clampColumns(n: number): GalleryColumns {
  if (n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 4;
}

export function gridColsClass(columns: GalleryColumns): string {
  switch (columns) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
  }
}

/** Hapësirë e njëjtë horizontalisht dhe vertikalisht midis boxeve */
export const GALLERY_GAP_CLASS = "gap-5";
export const GALLERY_PREVIEW_GAP_CLASS = "gap-1.5";
