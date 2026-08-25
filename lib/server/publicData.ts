import "server-only";

import { getSession } from "@/lib/server/auth";
import {
  getServerProjectRepository,
  getServerSocialMediaRepository,
  getServerWebDesignRepository,
  getServerPhotoshootingRepository,
  getServerVideoProductionRepository,
  getServerSettingsRepository,
  getServerMediaRepository,
} from "@/lib/repositories/server";
import type { BrandingProject } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { WebDesignProject } from "@/types/web-design";
import type { PhotoshootingProject } from "@/types/photoshooting";
import type { VideoProductionItem } from "@/types/video-production";
import {
  DEFAULT_SITE_SETTINGS,
  sanitizeSettingsForPublic,
  type PublicSiteSettings,
  type SiteSettings,
} from "@/types/settings";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[publicData]", err);
    return fallback;
  }
}

export async function canPreviewDrafts(previewFlag: boolean): Promise<boolean> {
  if (!previewFlag) return false;
  const session = await getSession();
  return Boolean(session);
}

export async function loadPublishedBranding(): Promise<BrandingProject[]> {
  return safe(() => getServerProjectRepository().list(), []);
}

export async function loadPublishedSocial(): Promise<SocialMediaProject[]> {
  return safe(() => getServerSocialMediaRepository().list(), []);
}

export async function loadPublishedWebDesign(): Promise<WebDesignProject[]> {
  return safe(() => getServerWebDesignRepository().list(), []);
}

export async function loadPublishedPhotoshooting(): Promise<
  PhotoshootingProject[]
> {
  return safe(() => getServerPhotoshootingRepository().list(), []);
}

export async function loadPublishedVideo(): Promise<VideoProductionItem[]> {
  return safe(() => getServerVideoProductionRepository().list(), []);
}

export async function loadSiteSettings(): Promise<PublicSiteSettings> {
  return safe(
    async () =>
      sanitizeSettingsForPublic(await getServerSettingsRepository().get()),
    {
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: new Date().toISOString(),
      hasOpenaiApiKey: false,
    },
  );
}

/** Vetëm server — përfshin secrets (p.sh. OpenAI). */
export async function loadSiteSettingsRaw(): Promise<SiteSettings> {
  return safe(
    () => getServerSettingsRepository().get(),
    { ...DEFAULT_SITE_SETTINGS, updatedAt: new Date().toISOString() },
  );
}

export async function loadBrandingBySlug(
  slug: string,
  preview: boolean,
): Promise<BrandingProject | null> {
  const includeDrafts = await canPreviewDrafts(preview);
  return safe(
    () => getServerProjectRepository().getBySlug(slug, { includeDrafts }),
    null,
  );
}

export async function loadSocialBySlug(
  slug: string,
  preview: boolean,
): Promise<SocialMediaProject | null> {
  const includeDrafts = await canPreviewDrafts(preview);
  return safe(
    () =>
      getServerSocialMediaRepository().getBySlug(slug, { includeDrafts }),
    null,
  );
}

export async function loadWebDesignBySlug(
  slug: string,
  preview: boolean,
): Promise<WebDesignProject | null> {
  const includeDrafts = await canPreviewDrafts(preview);
  return safe(
    () => getServerWebDesignRepository().getBySlug(slug, { includeDrafts }),
    null,
  );
}

export async function loadPhotoshootingBySlug(
  slug: string,
  preview: boolean,
): Promise<PhotoshootingProject | null> {
  const includeDrafts = await canPreviewDrafts(preview);
  return safe(
    () =>
      getServerPhotoshootingRepository().getBySlug(slug, { includeDrafts }),
    null,
  );
}

export function absoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function mediaPublicUrl(
  mediaId?: string | null,
): Promise<string | undefined> {
  if (!mediaId) return undefined;
  return safe(async () => {
    const asset = await getServerMediaRepository().getById(mediaId);
    if (asset?.publicUrl?.startsWith("http")) return asset.publicUrl;
    return absoluteUrl(`/api/media/${encodeURIComponent(mediaId)}`);
  }, absoluteUrl(`/api/media/${encodeURIComponent(mediaId)}`));
}
