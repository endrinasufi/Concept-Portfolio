import {
  DEFAULT_SITE_SETTINGS,
  normalizeContactChannels,
  normalizeContactLocation,
  normalizeHomeFeatured,
  type SettingsUpdatePatch,
  type SiteSettings,
} from "@/types/settings";
import { nowIso } from "@/lib/utils/id";
import { execute, query, type RowDataPacket } from "@/lib/server/db";
import { parseJsonField, toMysqlDateTime, fromMysqlDateTime } from "./portfolioRow";

interface SettingsRow extends RowDataPacket {
  id: string;
  data_json: unknown;
  updated_at: Date | string;
}

export class MySqlSettingsRepository {
  async get(): Promise<SiteSettings> {
    const rows = await query<SettingsRow[]>(
      `SELECT * FROM site_settings WHERE id = 'site' LIMIT 1`,
    );
    const row = rows[0];
    if (!row) {
      return { ...DEFAULT_SITE_SETTINGS, updatedAt: nowIso() };
    }
    const data = parseJsonField<Partial<SiteSettings>>(row.data_json, {});
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      id: "site",
      clientLogos: data.clientLogos ?? [],
      contactChannels: normalizeContactChannels(data.contactChannels),
      contactLocation: normalizeContactLocation(data.contactLocation),
      contactNotifyEmail:
        data.contactNotifyEmail?.trim() ||
        DEFAULT_SITE_SETTINGS.contactNotifyEmail,
      homeFeatured: normalizeHomeFeatured(data.homeFeatured),
      updatedAt: fromMysqlDateTime(row.updated_at),
    };
  }

  async update(patch: SettingsUpdatePatch): Promise<SiteSettings> {
    const current = await this.get();
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
    await execute(
      `INSERT INTO site_settings (id, data_json, updated_at)
       VALUES ('site', :data_json, :updated_at)
       ON DUPLICATE KEY UPDATE
         data_json = VALUES(data_json),
         updated_at = VALUES(updated_at)`,
      {
        data_json: JSON.stringify(next),
        updated_at: toMysqlDateTime(next.updatedAt),
      },
    );
    return next;
  }
}

let settingsRepo: MySqlSettingsRepository | null = null;

export function getServerSettingsRepository(): MySqlSettingsRepository {
  if (!settingsRepo) settingsRepo = new MySqlSettingsRepository();
  return settingsRepo;
}
