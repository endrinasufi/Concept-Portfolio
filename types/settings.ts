export interface SiteSettings {
  id: "site";
  logoMediaId?: string;
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "site",
  updatedAt: new Date(0).toISOString(),
};
