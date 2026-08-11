import { getDb } from "./db";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/types/settings";
import { nowIso } from "@/lib/utils/id";

export class LocalSettingsRepository {
  async get(): Promise<SiteSettings> {
    const db = getDb();
    const row = await db.settings.get("site");
    return row ?? { ...DEFAULT_SITE_SETTINGS, updatedAt: nowIso() };
  }

  async update(patch: Partial<Omit<SiteSettings, "id">>): Promise<SiteSettings> {
    const db = getDb();
    const current = await this.get();
    const next: SiteSettings = {
      ...current,
      ...patch,
      id: "site",
      updatedAt: nowIso(),
    };
    if ("logoMediaId" in patch && !patch.logoMediaId) {
      delete next.logoMediaId;
    }
    await db.settings.put(next);
    return next;
  }
}

let settingsRepo: LocalSettingsRepository | null = null;

export function getSettingsRepository(): LocalSettingsRepository {
  if (typeof window === "undefined") {
    throw new Error("Settings repository requires browser environment");
  }
  if (!settingsRepo) {
    settingsRepo = new LocalSettingsRepository();
  }
  return settingsRepo;
}
