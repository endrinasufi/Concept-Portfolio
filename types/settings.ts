import type { SiteCategoryId } from "@/lib/data/categories";

export interface ClientLogo {
  id: string;
  mediaId: string;
  order: number;
}

export interface HomeFeaturedItem {
  projectId: string;
  thumbnailMediaId?: string;
}

export type HomeFeatured = Record<SiteCategoryId, HomeFeaturedItem[]>;

export const EMPTY_HOME_FEATURED: HomeFeatured = {
  branding: [],
  "social-media": [],
  "web-design": [],
  "video-production": [],
  photoshooting: [],
};

export interface SiteSettings {
  id: "site";
  logoMediaId?: string;
  logoDarkMediaId?: string;
  adminLogoMediaId?: string;
  faviconMediaId?: string;
  clientLogos: ClientLogo[];
  homeFeatured: HomeFeatured;
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "site",
  clientLogos: [],
  homeFeatured: { ...EMPTY_HOME_FEATURED },
  updatedAt: new Date(0).toISOString(),
};

export function normalizeHomeFeatured(
  raw?: Partial<HomeFeatured> | null,
): HomeFeatured {
  return {
    branding: raw?.branding ?? [],
    "social-media": raw?.["social-media"] ?? [],
    "web-design": raw?.["web-design"] ?? [],
    "video-production": raw?.["video-production"] ?? [],
    photoshooting: raw?.photoshooting ?? [],
  };
}
