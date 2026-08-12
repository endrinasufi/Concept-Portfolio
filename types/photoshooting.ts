export type PhotoshootingStatus = "draft" | "published";

/** Sa kolona/rreshta zë qeliza në grid (grid 6 kolonash). */
export type GridColSpan = 1 | 2 | 3 | 4 | 6;
export type GridRowSpan = 1 | 2 | 3;

export type PhotoshootingCellType = "photo";

export interface PhotoshootingCell {
  id: string;
  type: PhotoshootingCellType;
  order: number;
  colSpan: GridColSpan;
  rowSpan: GridRowSpan;
  imageUrl?: string;
  mediaId?: string;
  alt?: string;
}

export interface PhotoshootingProject {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  year?: number;
  shortDescription?: string;
  coverImageUrl?: string;
  coverMediaId?: string;
  status: PhotoshootingStatus;
  order: number;
  featured: boolean;
  cells: PhotoshootingCell[];
  createdAt: string;
  updatedAt: string;
}

export function emptyPhotoshootingDraft(): Omit<
  PhotoshootingProject,
  "id" | "createdAt" | "updatedAt"
> {
  return {
    slug: "",
    title: "",
    clientName: "",
    year: new Date().getFullYear(),
    shortDescription: "",
    coverImageUrl: "",
    coverMediaId: undefined,
    status: "draft",
    order: 0,
    featured: false,
    cells: [],
  };
}
