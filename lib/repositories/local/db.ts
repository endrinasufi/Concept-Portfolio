import Dexie, { type EntityTable } from "dexie";
import type { Project } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { VideoProductionItem } from "@/types/video-production";
import type { PhotoshootingProject } from "@/types/photoshooting";
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
    // Video Production — YouTube portfolio sipas klientëve
    this.version(4).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      videoProduction: "id, clientName, status, order",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    // Video Production — reseed (orientim + 10×10 klientë)
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
    // Video Production — rresht i shembur + mix horizontal/vertikal
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
    // Video Production — vetëm reels (portrait)
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
    // Video — social (reels) + production (horizontal)
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
    // Photoshooting — bento grid portfolio
    this.version(9).stores({
      projects: "id, slug, service, status, order, featured",
      socialMediaProjects: "id, slug, status, order, featured",
      videoProduction: "id, clientName, status, order",
      photoshooting: "id, slug, status, order, featured",
      media: "id, createdAt",
      mediaBlobs: "id",
      settings: "id",
    });
    // Photoshooting — paleta të vogla të shpërndara
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
    // Photoshooting — shumica e fotove vertikale
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
    // Photoshooting — layout pa vrima (bande 6-kolonëshe)
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
    // Photoshooting — bento asimetrik (1 e madhe vs 2–4 të vogla)
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
    // Photoshooting — bento + dominance vertikale
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
    // Photoshooting — vetëm foto (pa logo/paletë)
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
