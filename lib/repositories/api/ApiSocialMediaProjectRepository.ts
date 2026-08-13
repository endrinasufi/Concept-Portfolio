import type { SocialMediaProject } from "@/types/social-media";
import type { SocialMediaProjectRepository } from "@/lib/repositories/social-media-types";
import { apiGet, apiSend } from "./http";

const BASE = "/api/admin/social-media";

export class ApiSocialMediaProjectRepository
  implements SocialMediaProjectRepository
{
  async ensureSeeded(): Promise<void> {}

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<SocialMediaProject[]> {
    const includeDrafts = options?.includeDrafts !== false;
    return apiGet(`${BASE}?includeDrafts=${includeDrafts}`);
  }

  async getById(id: string): Promise<SocialMediaProject | null> {
    try {
      return await apiGet(`${BASE}/${id}`);
    } catch {
      return null;
    }
  }

  async getBySlug(): Promise<SocialMediaProject | null> {
    throw new Error("getBySlug is server-only for public pages");
  }

  async create(
    project: Omit<SocialMediaProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<SocialMediaProject> {
    return apiSend(BASE, "POST", project);
  }

  async update(
    id: string,
    patch: Partial<SocialMediaProject>,
  ): Promise<SocialMediaProject> {
    return apiSend(`${BASE}/${id}`, "PATCH", patch);
  }

  async delete(id: string): Promise<void> {
    await apiSend(`${BASE}/${id}`, "DELETE");
  }

  async duplicate(id: string): Promise<SocialMediaProject> {
    return apiSend(`${BASE}/${id}/duplicate`, "POST");
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await apiSend(`${BASE}/reorder`, "POST", { orderedIds });
  }
}
