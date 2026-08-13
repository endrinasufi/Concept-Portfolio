import type { BrandingProject, Project } from "@/types/branding";
import type { ProjectRepository } from "@/lib/repositories/types";
import { apiGet, apiSend } from "./http";

const BASE = "/api/admin/branding";

export class ApiProjectRepository implements ProjectRepository {
  async ensureSeeded(): Promise<void> {}

  async list(options?: {
    service?: string;
    includeDrafts?: boolean;
  }): Promise<Project[]> {
    const includeDrafts = options?.includeDrafts !== false;
    return apiGet<Project[]>(`${BASE}?includeDrafts=${includeDrafts}`);
  }

  async getById(id: string): Promise<Project | null> {
    try {
      return await apiGet<Project>(`${BASE}/${id}`);
    } catch {
      return null;
    }
  }

  async getBySlug(): Promise<Project | null> {
    throw new Error("getBySlug is server-only for public pages");
  }

  async create(
    project: Omit<BrandingProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<Project> {
    return apiSend<Project>(BASE, "POST", project);
  }

  async update(id: string, patch: Partial<BrandingProject>): Promise<Project> {
    return apiSend<Project>(`${BASE}/${id}`, "PATCH", patch);
  }

  async delete(id: string): Promise<void> {
    await apiSend(`${BASE}/${id}`, "DELETE");
  }

  async duplicate(id: string): Promise<Project> {
    return apiSend<Project>(`${BASE}/${id}/duplicate`, "POST");
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await apiSend(`${BASE}/reorder`, "POST", { orderedIds });
  }
}
