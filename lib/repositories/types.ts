import type { BrandingProject, Project } from "@/types/branding";

export interface ProjectRepository {
  list(options?: { service?: string; includeDrafts?: boolean }): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  getBySlug(slug: string, options?: { includeDrafts?: boolean }): Promise<Project | null>;
  create(project: Omit<BrandingProject, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Project>;
  update(id: string, patch: Partial<BrandingProject>): Promise<Project>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Project>;
  reorder(orderedIds: string[]): Promise<void>;
  ensureSeeded(): Promise<void>;
}
