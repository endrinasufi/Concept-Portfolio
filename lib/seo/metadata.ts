import type { Metadata } from "next";

export const SITE_NAME = "Concept Marketing Albania";
export const SITE_DEFAULT_DESCRIPTION =
  "Concept Marketing Albania portfolio — branding, social media, web design, video, and photoshooting.";

export type SeoService =
  | "branding"
  | "social-media"
  | "web-design"
  | "photoshooting"
  | "video-production"
  | "contact"
  | "home";

export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function absoluteSiteUrl(path: string): string {
  const base = siteOrigin();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function siteMetadataBase(): URL {
  try {
    return new URL(siteOrigin());
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function serviceLabel(service: SeoService): string {
  switch (service) {
    case "branding":
      return "Branding";
    case "social-media":
      return "Social Media";
    case "web-design":
      return "Web Design";
    case "photoshooting":
      return "Photoshooting";
    case "video-production":
      return "Video Production";
    case "contact":
      return "Contact";
    default:
      return SITE_NAME;
  }
}

/** Title pa brand suffix — template i layout shton "| Concept Marketing Albania" */
export function buildMetaTitle(opts: {
  title: string;
  service?: SeoService;
  client?: string;
}): string {
  const title = opts.title.trim();
  const client = opts.client?.trim();
  const label = opts.service ? serviceLabel(opts.service) : "";
  if (client && label) return `${client} — ${label}`;
  if (label && title) return `${title} — ${label}`;
  return title || SITE_NAME;
}

export function buildMetaDescription(opts: {
  description?: string | null;
  title: string;
  service?: SeoService;
  client?: string;
}): string {
  const raw = opts.description?.trim();
  if (raw) {
    return raw.length > 160 ? `${raw.slice(0, 157).trim()}…` : raw;
  }
  const label = opts.service ? serviceLabel(opts.service) : "portfolio";
  const client = opts.client?.trim();
  const base = client
    ? `${label} project for ${client} by ${SITE_NAME}.`
    : `${opts.title} — ${label} project by ${SITE_NAME}.`;
  return base;
}

export function projectPath(
  service: Exclude<SeoService, "contact" | "home" | "video-production">,
  slug: string,
): string {
  return `/${service}/${slug}`;
}

export type ProjectSeoInput = {
  title: string;
  path: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  imageUrl?: string | null;
  isPreview?: boolean;
  service?: SeoService;
  client?: string;
};

export function buildPageMetadata(input: ProjectSeoInput): Metadata {
  const title =
    input.metaTitle?.trim() ||
    buildMetaTitle({
      title: input.title,
      service: input.service,
      client: input.client,
    });
  const description =
    input.metaDescription?.trim() ||
    buildMetaDescription({
      description: input.description,
      title: input.title,
      service: input.service,
      client: input.client,
    });
  const canonical = absoluteSiteUrl(input.path);
  const ogImage =
    input.imageUrl?.trim() || absoluteSiteUrl("/brand/logo-light.svg");

  return {
    title,
    description,
    alternates: { canonical },
    robots: input.isPreview
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
