import { getDb } from "./db";
import {
  DEFAULT_SITE_SETTINGS,
  normalizeContactChannels,
  normalizeContactLocation,
  normalizeHomeFeatured,
  sanitizeSettingsForAdmin,
  type PublicSiteSettings,
  type SettingsUpdatePatch,
  type SiteSettings,
} from "@/types/settings";
import { nowIso } from "@/lib/utils/id";

export class LocalSettingsRepository {
  async get(): Promise<PublicSiteSettings> {
    const db = getDb();
    const row = await db.settings.get("site");
    if (!row) {
      return sanitizeSettingsForAdmin({
        ...DEFAULT_SITE_SETTINGS,
        updatedAt: nowIso(),
      });
    }
    return sanitizeSettingsForAdmin({
      ...DEFAULT_SITE_SETTINGS,
      ...row,
      clientLogos: row.clientLogos ?? [],
      contactChannels: normalizeContactChannels(row.contactChannels),
      contactLocation: normalizeContactLocation(row.contactLocation),
      contactNotifyEmail:
        row.contactNotifyEmail?.trim() ||
        DEFAULT_SITE_SETTINGS.contactNotifyEmail,
      homeFeatured: normalizeHomeFeatured(row.homeFeatured),
    });
  }

  async update(patch: SettingsUpdatePatch): Promise<PublicSiteSettings> {
    const db = getDb();
    const raw = await db.settings.get("site");
    const current: SiteSettings = raw
      ? {
          ...DEFAULT_SITE_SETTINGS,
          ...raw,
          clientLogos: raw.clientLogos ?? [],
          contactChannels: normalizeContactChannels(raw.contactChannels),
          contactLocation: normalizeContactLocation(raw.contactLocation),
          contactNotifyEmail:
            raw.contactNotifyEmail?.trim() ||
            DEFAULT_SITE_SETTINGS.contactNotifyEmail,
          homeFeatured: normalizeHomeFeatured(raw.homeFeatured),
        }
      : { ...DEFAULT_SITE_SETTINGS, updatedAt: nowIso() };
    const next: SiteSettings = {
      ...current,
      ...patch,
      id: "site",
      clientLogos: patch.clientLogos ?? current.clientLogos,
      contactChannels: normalizeContactChannels(
        patch.contactChannels ?? current.contactChannels,
      ),
      contactLocation:
        "contactLocation" in patch
          ? normalizeContactLocation(patch.contactLocation)
          : current.contactLocation,
      contactNotifyEmail:
        "contactNotifyEmail" in patch
          ? patch.contactNotifyEmail?.trim() ||
            DEFAULT_SITE_SETTINGS.contactNotifyEmail
          : current.contactNotifyEmail ||
            DEFAULT_SITE_SETTINGS.contactNotifyEmail,
      homeFeatured: normalizeHomeFeatured(
        patch.homeFeatured ?? current.homeFeatured,
      ),
      openaiApiKey:
        "openaiApiKey" in patch
          ? patch.openaiApiKey || undefined
          : current.openaiApiKey,
      smtpPass:
        "smtpPass" in patch
          ? patch.smtpPass || undefined
          : current.smtpPass,
      updatedAt: nowIso(),
    };
    if ("logoMediaId" in patch && !patch.logoMediaId) {
      delete next.logoMediaId;
    }
    if ("logoDarkMediaId" in patch && !patch.logoDarkMediaId) {
      delete next.logoDarkMediaId;
    }
    if ("adminLogoMediaId" in patch && !patch.adminLogoMediaId) {
      delete next.adminLogoMediaId;
    }
    if ("faviconMediaId" in patch && !patch.faviconMediaId) {
      delete next.faviconMediaId;
    }
    if ("openaiApiKey" in patch && !patch.openaiApiKey) {
      delete next.openaiApiKey;
    }
    if ("smtpPass" in patch && !patch.smtpPass) {
      delete next.smtpPass;
    }
    if ("openaiSeoModel" in patch && !patch.openaiSeoModel) {
      delete next.openaiSeoModel;
    }
    if ("contactLocation" in patch && !next.contactLocation) {
      delete next.contactLocation;
    }
    await db.settings.put(next);
    return sanitizeSettingsForAdmin(next);
  }
}

let settingsRepo: LocalSettingsRepository | null = null;

/** @deprecated Use getSettingsRepository from @/lib/repositories */
export function getSettingsRepository(): LocalSettingsRepository {
  if (typeof window === "undefined") {
    throw new Error("Settings repository requires browser environment");
  }
  if (!settingsRepo) {
    settingsRepo = new LocalSettingsRepository();
  }
  return settingsRepo;
}
