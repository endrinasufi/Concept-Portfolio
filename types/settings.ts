export interface ClientLogo {
  id: string;
  mediaId: string;
  order: number;
}

export interface SiteSettings {
  id: "site";
  logoMediaId?: string;
  clientLogos: ClientLogo[];
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "site",
  clientLogos: [],
  updatedAt: new Date(0).toISOString(),
};
