import Dexie, { type EntityTable } from "dexie";
import type { Project } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { VideoProductionItem } from "@/types/video-production";
import type { PhotoshootingProject } from "@/types/photoshooting";
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
  videoProduction!: EntityTable<VideoProductionItem, "id">;
  photoshooting!: EntityTable<PhotoshootingProject, "id">;
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
    this.version(3).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    this.version(4).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      videoProduction: "id, clientName, status, order",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    this.version(5)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("videoProduction").clear();
      });
    this.version(6)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("videoProduction").clear();
      });
    this.version(7)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("videoProduction").clear();
      });
    this.version(8)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("videoProduction").clear();
      });
    this.version(9).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      videoProduction: "id, clientName, status, order",
      photoshooting: "id, slug, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    this.version(10)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        photoshooting: "id, slug, status, order, featured",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("photoshooting").clear();
      });
    this.version(11)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        photoshooting: "id, slug, status, order, featured",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("photoshooting").clear();
      });
    this.version(12)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        photoshooting: "id, slug, status, order, featured",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("photoshooting").clear();
      });
    this.version(13)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        photoshooting: "id, slug, status, order, featured",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("photoshooting").clear();
      });
    this.version(14)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        photoshooting: "id, slug, status, order, featured",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("photoshooting").clear();
      });
    this.version(15)
      .stores({
        projects: "id, slug, service, status, order, featured",
        socialMediaProjects: "id, slug, status, order, featured",
        videoProduction: "id, clientName, status, order",
        photoshooting: "id, slug, status, order, featured",
        media: "id, createdAt",
        mediaBlobs: "id",
        settings: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("photoshooting").clear();
      });
    // Web Design (nga krismando) + të gjitha tabelat ekzistuese
    this.version(16).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      videoProduction: "id, clientName, status, order",
      photoshooting: "id, slug, status, order, featured",
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
