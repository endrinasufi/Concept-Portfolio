import type { SiteSettings } from "@/types/settings";
import { apiGet, apiSend } from "./http";

export class ApiSettingsRepository {
  async get(): Promise<SiteSettings> {
    return apiGet<SiteSettings>("/api/admin/settings");
  }

  async update(patch: Partial<Omit<SiteSettings, "id">>): Promise<SiteSettings> {
    return apiSend<SiteSettings>("/api/admin/settings", "PATCH", patch);
  }
}
