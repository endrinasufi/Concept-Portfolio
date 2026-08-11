import Dexie, { type EntityTable } from "dexie";
import type { Project } from "@/types/branding";
import type { MediaAsset } from "@/types/media";
import type { SiteSettings } from "@/types/settings";

export interface MediaBlobRecord {
  id: string;
  blob: Blob;
}

export class CmaDatabase extends Dexie {
  projects!: EntityTable<Project, "id">;
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
