import type { ProjectRepository } from "./types";
import type { MediaRepository } from "./media-types";
import type { SocialMediaProjectRepository } from "./social-media-types";
import type { WebDesignProjectRepository } from "./web-design-types";
import { LocalProjectRepository } from "./local/LocalProjectRepository";
import { LocalMediaRepository } from "./local/LocalMediaRepository";
import { LocalSocialMediaProjectRepository } from "./local/LocalSocialMediaProjectRepository";
import { LocalWebDesignProjectRepository } from "./local/LocalWebDesignProjectRepository";

let projectRepo: ProjectRepository | null = null;
let mediaRepo: MediaRepository | null = null;
let socialMediaRepo: SocialMediaProjectRepository | null = null;
let webDesignRepo: WebDesignProjectRepository | null = null;

export function getProjectRepository(): ProjectRepository {
  if (typeof window === "undefined") {
    throw new Error("Project repository requires browser environment");
  }
  if (!projectRepo) {
    projectRepo = new LocalProjectRepository();
  }
  return projectRepo;
}

export function getMediaRepository(): MediaRepository {
  if (typeof window === "undefined") {
    throw new Error("Media repository requires browser environment");
  }
  if (!mediaRepo) {
    mediaRepo = new LocalMediaRepository();
  }
  return mediaRepo;
}

export function getSocialMediaProjectRepository(): SocialMediaProjectRepository {
  if (typeof window === "undefined") {
    throw new Error("Social media repository requires browser environment");
  }
  if (!socialMediaRepo) {
    socialMediaRepo = new LocalSocialMediaProjectRepository();
  }
  return socialMediaRepo;
}

export function getWebDesignProjectRepository(): WebDesignProjectRepository {
  if (typeof window === "undefined") {
    throw new Error("Web design repository requires browser environment");
  }
  if (!webDesignRepo) {
    webDesignRepo = new LocalWebDesignProjectRepository();
  }
  return webDesignRepo;
}
