import type { ServiceType } from "./service";

export type ProjectStatus = "draft" | "published";

export interface BrandColor {
  id: string;
  hex: string;
  order: number;
}

export interface TypographyItem {
  id: string;
  role: "primary" | "secondary" | "custom";
  fontName: string;
  fontWeight: string;
  sampleText: string;
  customFontRef?: string;
}

export type BrandingSectionType =
  | "logo"
  | "text"
  | "image"
  | "fullWidthImage"
  | "imageGrid2"
  | "imageGrid3"
  | "typography"
  | "colorPalette"
  | "video"
  | "brandApplication"
  | "mockup"
  | "spacer"
  | "gallery";

export interface BrandingSection {
  id: string;
  type: BrandingSectionType;
  order: number;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
}

export interface GalleryItem {
  id: string;
  mediaId: string;
  order: number;
}

/** Sa foto në një rresht të galerisë */
export type GalleryColumns = 1 | 2 | 3 | 4;

export interface GalleryRow {
  id: string;
  order: number;
  columns: GalleryColumns;
  items: GalleryItem[];
}

export interface BrandingProject {
  id: string;
  service: Extract<ServiceType, "branding">;
  slug: string;
  title: string;
  shortDescription: string;
  /** Tekst shpjegues i brandit poshtë mosaikut të fotove */
  brandAbout?: string;
  client: string;
  industry: string;
  year: number;
  services: string[];
  logoMediaId?: string;
  /** Hero bento — paneli i madh (cover) */
  coverMediaId?: string;
  /** Foto e vogël inset në cover (si në referencë) */
  coverInsetMediaId?: string;
  /** Titulli i madh në cover (nëse bosh → title) */
  coverHeadline?: string;
  coverStat1Value?: string;
  coverStat1Label?: string;
  coverStat2Value?: string;
  coverStat2Label?: string;
  coverCtaLabel?: string;
  coverCtaHref?: string;
  /** Hero bento — paneli majtas-poshtë (mockup) */
  mockupMediaId?: string;
  /** Sfondi i panelit të logos */
  logoBackgroundColor?: string;
  /** Sfondi i kartës Industria */
  industryBackgroundColor?: string;
  /** Sfondi i kartës Shërbimet */
  servicesBackgroundColor?: string;
  /** Ngjyra kryesore e sfondit të faqes */
  primaryBackgroundColor: string;
  /** Ngjyra e dytë e sfondit (gradient — vetëm këto dy) */
  secondaryBackgroundColor?: string;
  /** 3 foto për bllokun puzzle poshtë hero (tekst + mosaic) */
  aboutPuzzleMediaIds?: string[];
  /** Video opsionale e projektit (upload) — shfaqet në fund */
  videoMediaId?: string;
  brandColors: BrandColor[];
  /** @deprecated nuk përdoret më në UI */
  typography: TypographyItem[];
  status: ProjectStatus;
  featured: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  sections: BrandingSection[];
  /** @deprecated prefer galleryRows — mbahet për kompatibilitet */
  gallery: GalleryItem[];
  /** Galeria në rreshta me 1–4 foto */
  galleryRows?: GalleryRow[];
  createdAt: string;
  updatedAt: string;
}

export type Project = BrandingProject;
