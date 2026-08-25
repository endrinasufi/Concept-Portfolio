import type {
  PublicSiteSettings,
  SettingsUpdatePatch,
} from "@/types/settings";
import { apiGet, apiSend } from "./http";

export class ApiSettingsRepository {
  async get(): Promise<PublicSiteSettings> {
    return apiGet<PublicSiteSettings>("/api/admin/settings");
  }

  async update(patch: SettingsUpdatePatch): Promise<PublicSiteSettings> {
    return apiSend<PublicSiteSettings>("/api/admin/settings", "PATCH", patch);
  }
}
