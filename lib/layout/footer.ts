import type {
  ContactChannel,
  ContactChannelKind,
  ContactLocation,
  FooterNavLink,
  PublicSiteSettings,
  SiteSettings,
} from "@/types/settings";
import {
  contactChannelHref,
  DEFAULT_FOOTER_BRAND_NAME,
  DEFAULT_FOOTER_CONTACT_LABEL,
  DEFAULT_FOOTER_CTA_TITLE,
  DEFAULT_FOOTER_CTA_URL,
  DEFAULT_FOOTER_EMAIL,
  DEFAULT_FOOTER_EXPLORE_LABEL,
  DEFAULT_FOOTER_LOCATION,
  DEFAULT_FOOTER_LOCATION_LABEL,
  DEFAULT_FOOTER_SOCIAL_LABEL,
  normalizeContactChannels,
} from "@/types/settings";
import { SITE_CATEGORIES } from "@/lib/data/categories";

export const FOOTER_SOCIAL_KINDS: ContactChannelKind[] = [
  "instagram",
  "facebook",
  "linkedin",
  "website",
  "whatsapp",
  "other",
];

export const FOOTER_EXPLORE_OPTIONS: FooterNavLink[] = [
  ...SITE_CATEGORIES.map((item, order) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    order,
  })),
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
    order: SITE_CATEGORIES.length,
  },
];

export const DEFAULT_FOOTER_EXPLORE_IDS = [
  "branding",
  "social-media",
  "web-design",
  "contact",
];

/** @deprecated Use resolveFooterSettings().exploreLinks */
export const FOOTER_EXPLORE_LINKS = FOOTER_EXPLORE_OPTIONS.filter((item) =>
  DEFAULT_FOOTER_EXPLORE_IDS.includes(item.id),
);

type FooterSource = SiteSettings | PublicSiteSettings;

function filled(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function isFooterSocialChannel(channel: ContactChannel) {
  return FOOTER_SOCIAL_KINDS.includes(channel.kind);
}

export function contactSocialChannels(settings: FooterSource): ContactChannel[] {
  return normalizeContactChannels(settings.contactChannels).filter(
    isFooterSocialChannel,
  );
}

export function formatFooterLocation(
  location: ContactLocation | undefined,
  fallback: string,
) {
  if (!location) return fallback;
  const cityCountry = [location.city, location.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  if (cityCountry) return cityCountry;
  return location.address.trim() || fallback;
}

function resolveEmail(settings: FooterSource) {
  const email = normalizeContactChannels(settings.contactChannels).find(
    (channel) => channel.kind === "email",
  );
  return filled(email?.value, filled(settings.footerEmail, DEFAULT_FOOTER_EMAIL));
}

function resolveSocialLinks(settings: FooterSource): FooterNavLink[] {
  const available = contactSocialChannels(settings);
  const byId = new Map(available.map((channel) => [channel.id, channel]));
  const selected = settings.footerSocialChannelIds;
  const shown =
    selected == null
      ? available
      : selected
          .map((id) => byId.get(id))
          .filter((channel): channel is ContactChannel => Boolean(channel));

  return shown.map((channel, order) => ({
    id: channel.id,
    label: channel.label,
    href: contactChannelHref(channel),
    order,
  }));
}

function resolveExploreLinks(settings: FooterSource): FooterNavLink[] {
  const ids = Array.isArray(settings.footerExploreIds)
    ? settings.footerExploreIds
    : DEFAULT_FOOTER_EXPLORE_IDS;
  const byId = new Map(FOOTER_EXPLORE_OPTIONS.map((item) => [item.id, item]));
  return ids
    .map((id) => byId.get(id))
    .filter((item): item is FooterNavLink => Boolean(item))
    .map((item, order) => ({ ...item, order }));
}

export function resolveFooterSettings(settings: FooterSource) {
  return {
    ctaTitle: filled(settings.footerCtaTitle, DEFAULT_FOOTER_CTA_TITLE),
    ctaUrl: filled(settings.footerCtaUrl, DEFAULT_FOOTER_CTA_URL),
    email: resolveEmail(settings),
    location: formatFooterLocation(
      settings.contactLocation,
      filled(settings.footerLocation, DEFAULT_FOOTER_LOCATION),
    ),
    brandName: filled(settings.footerBrandName, DEFAULT_FOOTER_BRAND_NAME),
    contactLabel: filled(
      settings.footerContactLabel,
      DEFAULT_FOOTER_CONTACT_LABEL,
    ),
    locationLabel: filled(
      settings.footerLocationLabel,
      DEFAULT_FOOTER_LOCATION_LABEL,
    ),
    socialLabel: filled(settings.footerSocialLabel, DEFAULT_FOOTER_SOCIAL_LABEL),
    exploreLabel: filled(
      settings.footerExploreLabel,
      DEFAULT_FOOTER_EXPLORE_LABEL,
    ),
    socialLinks: resolveSocialLinks(settings),
    exploreLinks: resolveExploreLinks(settings),
  };
}

export function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

export type Rgb = { r: number; g: number; b: number };

export function parseCssColor(input: string): Rgb | null {
  const value = input.trim();
  if (!value) return null;

  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split("")
        .map((ch) => ch + ch)
        .join("");
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    if (hex.length !== 6) return null;
    const n = Number.parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const rgb = value.match(
    /rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)/i,
  );
  if (!rgb) return null;
  return {
    r: Number(rgb[1]),
    g: Number(rgb[2]),
    b: Number(rgb[3]),
  };
}

export function relativeLuminance({ r, g, b }: Rgb) {
  const channel = (c: number) => {
    const s = Math.min(Math.max(c, 0), 255) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
