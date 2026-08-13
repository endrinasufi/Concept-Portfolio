import type { ProjectRepository } from "./types";
import type { MediaRepository } from "./media-types";
import type { SocialMediaProjectRepository } from "./social-media-types";
import type { VideoProductionRepository } from "./video-production-types";
import type { PhotoshootingRepository } from "./photoshooting-types";
import type { WebDesignProjectRepository } from "./web-design-types";
import { LocalProjectRepository } from "./legacy/LocalProjectRepository";
import { LocalMediaRepository } from "./legacy/LocalMediaRepository";
import { LocalSocialMediaProjectRepository } from "./legacy/LocalSocialMediaProjectRepository";
import { LocalVideoProductionRepository } from "./legacy/LocalVideoProductionRepository";
import { LocalPhotoshootingRepository } from "./legacy/LocalPhotoshootingRepository";
import { LocalWebDesignProjectRepository } from "./legacy/LocalWebDesignProjectRepository";
import {
  LocalSettingsRepository,
} from "./legacy/LocalSettingsRepository";
import { ApiProjectRepository } from "./api/ApiProjectRepository";
import { ApiMediaRepository } from "./api/ApiMediaRepository";
import { ApiSocialMediaProjectRepository } from "./api/ApiSocialMediaProjectRepository";
import { ApiVideoProductionRepository } from "./api/ApiVideoProductionRepository";
import { ApiPhotoshootingRepository } from "./api/ApiPhotoshootingRepository";
import { ApiWebDesignProjectRepository } from "./api/ApiWebDesignProjectRepository";
import { ApiSettingsRepository } from "./api/ApiSettingsRepository";

function useLocalData(): boolean {
  return process.env.NEXT_PUBLIC_USE_LOCAL_DATA === "true";
}

let projectRepo: ProjectRepository | null = null;
let mediaRepo: MediaRepository | null = null;
let socialMediaRepo: SocialMediaProjectRepository | null = null;
let videoProductionRepo: VideoProductionRepository | null = null;
let photoshootingRepo: PhotoshootingRepository | null = null;
let webDesignRepo: WebDesignProjectRepository | null = null;
let settingsRepo: LocalSettingsRepository | ApiSettingsRepository | null = null;

function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Browser repository requires browser environment");
  }
}

export function getProjectRepository(): ProjectRepository {
  assertBrowser();
  if (!projectRepo) {
    projectRepo = useLocalData()
      ? new LocalProjectRepository()
      : new ApiProjectRepository();
  }
  return projectRepo;
}

export function getMediaRepository(): MediaRepository {
  assertBrowser();
  if (!mediaRepo) {
    mediaRepo = useLocalData()
      ? new LocalMediaRepository()
      : new ApiMediaRepository();
  }
  return mediaRepo;
}

export function getSocialMediaProjectRepository(): SocialMediaProjectRepository {
  assertBrowser();
  if (!socialMediaRepo) {
    socialMediaRepo = useLocalData()
      ? new LocalSocialMediaProjectRepository()
      : new ApiSocialMediaProjectRepository();
  }
  return socialMediaRepo;
}

export function getVideoProductionRepository(): VideoProductionRepository {
  assertBrowser();
  if (!videoProductionRepo) {
    videoProductionRepo = useLocalData()
      ? new LocalVideoProductionRepository()
      : new ApiVideoProductionRepository();
  }
  return videoProductionRepo;
}

export function getPhotoshootingRepository(): PhotoshootingRepository {
  assertBrowser();
  if (!photoshootingRepo) {
    photoshootingRepo = useLocalData()
      ? new LocalPhotoshootingRepository()
      : new ApiPhotoshootingRepository();
  }
  return photoshootingRepo;
}

export function getWebDesignProjectRepository(): WebDesignProjectRepository {
  assertBrowser();
  if (!webDesignRepo) {
    webDesignRepo = useLocalData()
      ? new LocalWebDesignProjectRepository()
      : new ApiWebDesignProjectRepository();
  }
  return webDesignRepo;
}

export function getSettingsRepository():
  | LocalSettingsRepository
  | ApiSettingsRepository {
  assertBrowser();
  if (!settingsRepo) {
    settingsRepo = useLocalData()
      ? new LocalSettingsRepository()
      : new ApiSettingsRepository();
  }
  return settingsRepo;
}
