import { getDb } from "./db";
import {
  DEFAULT_SITE_SETTINGS,
  normalizeHomeFeatured,
  type SiteSettings,
} from "@/types/settings";
import { nowIso } from "@/lib/utils/id";

export class LocalSettingsRepository {
  async get(): Promise<SiteSettings> {
    const db = getDb();
    const row = await db.settings.get("site");
    if (!row) {
      return { ...DEFAULT_SITE_SETTINGS, updatedAt: nowIso() };
    }
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...row,
      clientLogos: row.clientLogos ?? [],
      homeFeatured: normalizeHomeFeatured(row.homeFeatured),
    };
  }

  async update(patch: Partial<Omit<SiteSettings, "id">>): Promise<SiteSettings> {
    const db = getDb();
    const current = await this.get();
    const next: SiteSettings = {
      ...current,
      ...patch,
      id: "site",
      clientLogos: patch.clientLogos ?? current.clientLogos,
      homeFeatured: normalizeHomeFeatured(
        patch.homeFeatured ?? current.homeFeatured,
      ),
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
    await db.settings.put(next);
    return next;
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
