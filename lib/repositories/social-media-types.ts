import type { SocialMediaProject } from "@/types/social-media";

export interface SocialMediaProjectRepository {
  list(options?: { includeDrafts?: boolean }): Promise<SocialMediaProject[]>;
  getById(id: string): Promise<SocialMediaProject | null>;
  getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<SocialMediaProject | null>;
  create(
    project: Omit<SocialMediaProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<SocialMediaProject>;
  update(id: string, patch: Partial<SocialMediaProject>): Promise<SocialMediaProject>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<SocialMediaProject>;
  reorder(orderedIds: string[]): Promise<void>;
  ensureSeeded(): Promise<void>;
}
