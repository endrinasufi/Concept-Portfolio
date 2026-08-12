import Dexie, { type EntityTable } from "dexie";
import type { Project } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { WebDesignProject } from "@/types/web-design";
import type { MediaAsset } from "@/types/media";
import type { SiteSettings } from "@/types/settings";

export interface MediaBlobRecord {
  id: string;
  blob: Blob;
}

export class CmaDatabase extends Dexie {
  projects!: EntityTable<Project, "id">;
  socialMediaProjects!: EntityTable<SocialMediaProject, "id">;
  webDesignProjects!: EntityTable<WebDesignProject, "id">;
  media!: EntityTable<MediaAsset, "id">;
  mediaBlobs!: EntityTable<MediaBlobRecord, "id">;
  settings!: EntityTable<SiteSettings, "id">;

  constructor() {
    super("cma-portfolio-v1");
    this.version(1).stores({
      projects: "id, slug, service, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
    });
    this.version(2).stores({
      projects: "id, slug, service, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    // Social Media — tabela e ndarë; nuk prek projekte branding
    this.version(3).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    // Web Design — tabela e ndarë; nuk prek Branding / Social Media
    this.version(4).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      webDesignProjects: "id, slug, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
  }
}

let dbInstance: CmaDatabase | null = null;

export function getDb(): CmaDatabase {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!dbInstance) {
    dbInstance = new CmaDatabase();
  }
  return dbInstance;
}
