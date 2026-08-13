import {
  DEFAULT_SITE_SETTINGS,
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
      updatedAt: fromMysqlDateTime(row.updated_at),
    };
  }

  async update(patch: Partial<Omit<SiteSettings, "id">>): Promise<SiteSettings> {
    const current = await this.get();
    const next: SiteSettings = {
      ...current,
      ...patch,
      id: "site",
      clientLogos: patch.clientLogos ?? current.clientLogos,
      updatedAt: nowIso(),
    };
    if ("logoMediaId" in patch && !patch.logoMediaId) {
      delete next.logoMediaId;
    }
    await execute(
      `INSERT INTO site_settings (id, data_json, updated_at)
       VALUES ('site', CAST(:data_json AS JSON), :updated_at)
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
