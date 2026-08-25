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

export type ContactChannelKind =
  | "email"
  | "phone"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "website"
  | "other";

export interface ContactChannel {
  id: string;
  kind: ContactChannelKind;
  label: string;
  value: string;
  order: number;
}

export interface ContactLocation {
  /** Rruga / adresa e plotë */
  address: string;
  city?: string;
  country?: string;
  /** Query për Google Maps (nëse bosh, përdoret address) */
  mapQuery?: string;
}

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
  /** Adresa për faqen Kontakt + hartë */
  contactLocation?: ContactLocation;
  /** Email, tel, rrjete sociale etj. */
  contactChannels: ContactChannel[];
  /** Ku dërgohen njoftimet e formës së kontaktit */
  contactNotifyEmail?: string;
  /** SMTP për dërgimin e formës (Admin → Settings) */
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  /** OpenAI key për SEO automatik (ruhet në DB, mos e ekspozo publikisht) */
  openaiApiKey?: string;
  openaiSeoModel?: string;
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

/** PATCH body — null fshin openaiApiKey / smtpPass / contactLocation. */
export type SettingsUpdatePatch = Partial<
  Omit<
    SiteSettings,
    "id" | "openaiApiKey" | "smtpPass" | "contactLocation"
  >
> & {
  openaiApiKey?: string | null;
  smtpPass?: string | null;
  contactLocation?: ContactLocation | null;
};

/** Settings të sigurta për API — pa raw secrets. */
export type PublicSiteSettings = Omit<
  SiteSettings,
  "openaiApiKey" | "smtpPass"
> & {
  hasOpenaiApiKey?: boolean;
  openaiApiKeyMasked?: string;
  hasSmtpPass?: boolean;
  smtpPassMasked?: string;
};

export function sanitizeSettingsForPublic(
  settings: SiteSettings,
): PublicSiteSettings {
  const {
    openaiApiKey: _k,
    openaiSeoModel: _m,
    smtpPass: _p,
    smtpUser: _u,
    smtpHost: _h,
    smtpPort: _port,
    smtpSecure: _s,
    smtpFrom: _f,
    ...rest
  } = settings;
  return {
    ...rest,
    contactChannels: normalizeContactChannels(settings.contactChannels),
    contactLocation: normalizeContactLocation(settings.contactLocation),
    contactNotifyEmail:
      settings.contactNotifyEmail?.trim() ||
      DEFAULT_SITE_SETTINGS.contactNotifyEmail,
    hasOpenaiApiKey: Boolean(settings.openaiApiKey?.trim()),
    hasSmtpPass: Boolean(settings.smtpPass?.trim()),
  };
}

export function sanitizeSettingsForAdmin(
  settings: SiteSettings,
): PublicSiteSettings {
  const key = settings.openaiApiKey?.trim();
  const pass = settings.smtpPass?.trim();
  const { openaiApiKey: _k, smtpPass: _p, ...rest } = settings;
  return {
    ...rest,
    contactChannels: normalizeContactChannels(settings.contactChannels),
    contactLocation: normalizeContactLocation(settings.contactLocation),
    contactNotifyEmail:
      settings.contactNotifyEmail?.trim() ||
      DEFAULT_SITE_SETTINGS.contactNotifyEmail,
    smtpHost: settings.smtpHost?.trim() || DEFAULT_SITE_SETTINGS.smtpHost,
    smtpPort: settings.smtpPort ?? DEFAULT_SITE_SETTINGS.smtpPort,
    smtpSecure: settings.smtpSecure ?? DEFAULT_SITE_SETTINGS.smtpSecure,
    smtpUser: settings.smtpUser?.trim() || DEFAULT_SITE_SETTINGS.smtpUser,
    smtpFrom: settings.smtpFrom?.trim() || DEFAULT_SITE_SETTINGS.smtpFrom,
    hasOpenaiApiKey: Boolean(key),
    openaiApiKeyMasked: key
      ? `${key.slice(0, 7)}…${key.slice(-4)}`
      : undefined,
    hasSmtpPass: Boolean(pass),
    smtpPassMasked: pass
      ? `${pass.slice(0, 2)}…${pass.slice(-2)}`
      : undefined,
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "site",
  clientLogos: [],
  contactChannels: [],
  contactNotifyEmail: "info@conceptmarketing.al",
  smtpHost: "smtp.hostinger.com",
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: "info@conceptmarketing.al",
  smtpFrom: "Concept Marketing <info@conceptmarketing.al>",
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

export function normalizeContactChannels(
  raw?: ContactChannel[] | null,
): ContactChannel[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c.id === "string" && typeof c.value === "string")
    .map((c, i) => ({
      id: c.id,
      kind: (c.kind || "other") as ContactChannelKind,
      label: (c.label || "").trim() || defaultChannelLabel(c.kind),
      value: c.value.trim(),
      order: typeof c.order === "number" ? c.order : i,
    }))
    .filter((c) => c.value.length > 0);
}

export function normalizeContactLocation(
  raw?: ContactLocation | null,
): ContactLocation | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const address = (raw.address || "").trim();
  if (!address) return undefined;
  return {
    address,
    city: raw.city?.trim() || undefined,
    country: raw.country?.trim() || undefined,
    mapQuery: raw.mapQuery?.trim() || undefined,
  };
}

export function defaultChannelLabel(kind?: ContactChannelKind): string {
  switch (kind) {
    case "email":
      return "Email";
    case "phone":
      return "Phone";
    case "whatsapp":
      return "WhatsApp";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "linkedin":
      return "LinkedIn";
    case "website":
      return "Website";
    default:
      return "Contact";
  }
}

export function contactChannelHref(channel: ContactChannel): string {
  const v = channel.value.trim();
  switch (channel.kind) {
    case "email":
      return `mailto:${v}`;
    case "phone":
      return `tel:${v.replace(/\s+/g, "")}`;
    case "whatsapp": {
      const digits = v.replace(/[^\d+]/g, "").replace(/^\+/, "");
      return `https://wa.me/${digits}`;
    }
    default:
      if (/^https?:\/\//i.test(v)) return v;
      if (v.includes("@") && !v.includes(" ")) return `mailto:${v}`;
      return `https://${v.replace(/^\/\//, "")}`;
  }
}

export function contactMapEmbedUrl(location: ContactLocation): string {
  const q = (location.mapQuery || location.address).trim();
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
}

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
