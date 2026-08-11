import type { ProjectRepository } from "./types";
import type { MediaRepository } from "./media-types";
import { LocalProjectRepository } from "./local/LocalProjectRepository";
import { LocalMediaRepository } from "./local/LocalMediaRepository";

let projectRepo: ProjectRepository | null = null;
let mediaRepo: MediaRepository | null = null;

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
