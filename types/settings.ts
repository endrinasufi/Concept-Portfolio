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

export const DEFAULT_FOOTER_CTA_TITLE =
  "LET'S MAKE SOMETHING\nPEOPLE REMEMBER.";
export const DEFAULT_FOOTER_CTA_URL = "/contact";
export const DEFAULT_FOOTER_EMAIL = "hello@conceptmarketing.al";
export const DEFAULT_FOOTER_LOCATION = "Tirana, Albania";
export const DEFAULT_FOOTER_BRAND_NAME = "Concept Marketing Albania";
export const DEFAULT_FOOTER_CONTACT_LABEL = "Contact";
export const DEFAULT_FOOTER_LOCATION_LABEL = "Location";
export const DEFAULT_FOOTER_SOCIAL_LABEL = "Social";
export const DEFAULT_FOOTER_EXPLORE_LABEL = "Explore";

export interface FooterNavLink {
  id: string;
  label: string;
  href: string;
  order: number;
}

export const DEFAULT_FOOTER_SOCIAL_LINKS: FooterNavLink[] = [
  { id: "instagram", label: "Instagram", href: "", order: 0 },
  { id: "linkedin", label: "LinkedIn", href: "", order: 1 },
  { id: "behance", label: "Behance", href: "", order: 2 },
];

export const DEFAULT_FOOTER_EXPLORE_LINKS: FooterNavLink[] = [
  { id: "branding", label: "Branding", href: "/branding", order: 0 },
  { id: "social-media", label: "Social Media", href: "/social-media", order: 1 },
  { id: "web-design", label: "Web Design", href: "/web-design", order: 2 },
  { id: "contact", label: "Contact", href: "/contact", order: 3 },
];

export interface SiteSettings {
  id: "site";
  logoMediaId?: string;
  logoDarkMediaId?: string;
  adminLogoMediaId?: string;
  faviconMediaId?: string;
  clientLogos: ClientLogo[];
  homeFeatured: HomeFeatured;
  footerCtaTitle?: string;
  footerCtaUrl?: string;
  footerEmail?: string;
  footerLocation?: string;
  footerBrandName?: string;
  footerContactLabel?: string;
  footerLocationLabel?: string;
  footerSocialLabel?: string;
  footerExploreLabel?: string;
  footerInstagramUrl?: string;
  footerLinkedinUrl?: string;
  footerBehanceUrl?: string;
  footerSocialLinks?: FooterNavLink[];
  footerExploreLinks?: FooterNavLink[];
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "site",
  clientLogos: [],
  homeFeatured: { ...EMPTY_HOME_FEATURED },
  footerCtaTitle: DEFAULT_FOOTER_CTA_TITLE,
  footerCtaUrl: DEFAULT_FOOTER_CTA_URL,
  footerEmail: DEFAULT_FOOTER_EMAIL,
  footerLocation: DEFAULT_FOOTER_LOCATION,
  footerBrandName: DEFAULT_FOOTER_BRAND_NAME,
  footerContactLabel: DEFAULT_FOOTER_CONTACT_LABEL,
  footerLocationLabel: DEFAULT_FOOTER_LOCATION_LABEL,
  footerSocialLabel: DEFAULT_FOOTER_SOCIAL_LABEL,
  footerExploreLabel: DEFAULT_FOOTER_EXPLORE_LABEL,
  footerInstagramUrl: "",
  footerLinkedinUrl: "",
  footerBehanceUrl: "",
  footerSocialLinks: DEFAULT_FOOTER_SOCIAL_LINKS.map((item) => ({ ...item })),
  footerExploreLinks: DEFAULT_FOOTER_EXPLORE_LINKS.map((item) => ({ ...item })),
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
