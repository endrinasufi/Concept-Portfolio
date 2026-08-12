import type { PhotoshootingProject } from "@/types/photoshooting";

export interface PhotoshootingRepository {
  list(options?: { includeDrafts?: boolean }): Promise<PhotoshootingProject[]>;
  getBySlug(slug: string): Promise<PhotoshootingProject | null>;
  getById(id: string): Promise<PhotoshootingProject | null>;
  create(
    item: Omit<PhotoshootingProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<PhotoshootingProject>;
  update(
    id: string,
    patch: Partial<PhotoshootingProject>,
  ): Promise<PhotoshootingProject>;
  delete(id: string): Promise<void>;
}
