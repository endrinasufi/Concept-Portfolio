import type { FooterNavLink, SiteSettings } from "@/types/settings";
import {
  DEFAULT_FOOTER_BRAND_NAME,
  DEFAULT_FOOTER_CONTACT_LABEL,
  DEFAULT_FOOTER_CTA_TITLE,
  DEFAULT_FOOTER_CTA_URL,
  DEFAULT_FOOTER_EMAIL,
  DEFAULT_FOOTER_EXPLORE_LABEL,
  DEFAULT_FOOTER_EXPLORE_LINKS,
  DEFAULT_FOOTER_LOCATION,
  DEFAULT_FOOTER_LOCATION_LABEL,
  DEFAULT_FOOTER_SOCIAL_LABEL,
  DEFAULT_FOOTER_SOCIAL_LINKS,
} from "@/types/settings";
import { sortByOrder } from "@/lib/utils/id";

/** @deprecated Use resolveFooterSettings().exploreLinks */
export const FOOTER_EXPLORE_LINKS = DEFAULT_FOOTER_EXPLORE_LINKS;

function filled(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function cloneLinks(links: FooterNavLink[]): FooterNavLink[] {
  return links.map((item) => ({ ...item }));
}

function normalizeLinks(raw: FooterNavLink[] | undefined): FooterNavLink[] {
  if (!raw?.length) return [];
  return sortByOrder(raw).map((item, index) => ({
    id: item.id || `footer-${index}`,
    label: item.label ?? "",
    href: item.href ?? "",
    order: Number.isFinite(item.order) ? item.order : index,
  }));
}

function resolveSocialLinks(settings: SiteSettings): FooterNavLink[] {
  const hasOwn = Array.isArray(settings.footerSocialLinks);
  const links = hasOwn
    ? normalizeLinks(settings.footerSocialLinks)
    : cloneLinks(DEFAULT_FOOTER_SOCIAL_LINKS);

  if (hasOwn && links.length === 0) return [];

  const anyHref = links.some((item) => item.href.trim());
  if (anyHref) return links;

  const legacy: Record<string, string> = {
    instagram: settings.footerInstagramUrl?.trim() ?? "",
    linkedin: settings.footerLinkedinUrl?.trim() ?? "",
    behance: settings.footerBehanceUrl?.trim() ?? "",
  };

  return links.map((item) => ({
    ...item,
    href: item.href.trim() || legacy[item.id] || "",
  }));
}

function resolveExploreLinks(settings: SiteSettings): FooterNavLink[] {
  if (Array.isArray(settings.footerExploreLinks)) {
    return normalizeLinks(settings.footerExploreLinks).filter((item) =>
      item.label.trim(),
    );
  }
  return cloneLinks(DEFAULT_FOOTER_EXPLORE_LINKS);
}

export function resolveFooterSettings(settings: SiteSettings) {
  return {
    ctaTitle: filled(settings.footerCtaTitle, DEFAULT_FOOTER_CTA_TITLE),
    ctaUrl: filled(settings.footerCtaUrl, DEFAULT_FOOTER_CTA_URL),
    email: filled(settings.footerEmail, DEFAULT_FOOTER_EMAIL),
    location: filled(settings.footerLocation, DEFAULT_FOOTER_LOCATION),
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
