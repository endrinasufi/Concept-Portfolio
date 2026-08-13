import type { PhotoshootingProject } from "@/types/photoshooting";
import type { PhotoshootingRepository } from "@/lib/repositories/photoshooting-types";
import { apiGet, apiSend } from "./http";

const BASE = "/api/admin/photoshooting";

export class ApiPhotoshootingRepository implements PhotoshootingRepository {
  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<PhotoshootingProject[]> {
    const includeDrafts = options?.includeDrafts !== false;
    return apiGet(`${BASE}?includeDrafts=${includeDrafts}`);
  }

  async getById(id: string): Promise<PhotoshootingProject | null> {
    try {
      return await apiGet(`${BASE}/${id}`);
    } catch {
      return null;
    }
  }

  async getBySlug(): Promise<PhotoshootingProject | null> {
    throw new Error("getBySlug is server-only for public pages");
  }

  async create(
    item: Omit<PhotoshootingProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<PhotoshootingProject> {
    return apiSend(BASE, "POST", item);
  }

  async update(
    id: string,
    patch: Partial<PhotoshootingProject>,
  ): Promise<PhotoshootingProject> {
    return apiSend(`${BASE}/${id}`, "PATCH", patch);
  }

  async delete(id: string): Promise<void> {
    await apiSend(`${BASE}/${id}`, "DELETE");
  }
}
