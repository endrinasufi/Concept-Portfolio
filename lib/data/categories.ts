/**
 * Kategoritë e portfolio — homepage dhe navigim.
 * Seksionet e homepage (0–2): Branding, Social Media, Web Design.
 */
export const SITE_CATEGORIES = [
  { id: "branding", label: "Branding", href: "/branding" },
  { id: "social-media", label: "Social Media", href: "/social-media" },
  { id: "web-design", label: "Web Design", href: "/web-design" },
  { id: "video-production", label: "Video Production", href: "/video-production" },
  { id: "photoshooting", label: "Photoshooting", href: "/photoshooting" },
] as const;

export type SiteCategory = (typeof SITE_CATEGORIES)[number];
export type SiteCategoryId = SiteCategory["id"];
