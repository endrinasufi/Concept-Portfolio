import type { VideoProductionItem } from "@/types/video-production";
import type { VideoProductionRepository } from "@/lib/repositories/video-production-types";
import { apiGet, apiSend } from "./http";

const BASE = "/api/admin/video-production";

export class ApiVideoProductionRepository
  implements VideoProductionRepository
{
  async ensureSeeded(): Promise<void> {}

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<VideoProductionItem[]> {
    const includeDrafts = options?.includeDrafts !== false;
    return apiGet(`${BASE}?includeDrafts=${includeDrafts}`);
  }

  async getById(id: string): Promise<VideoProductionItem | null> {
    try {
      return await apiGet(`${BASE}/${id}`);
    } catch {
      return null;
    }
  }

  async create(
    item: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<VideoProductionItem> {
    return apiSend(BASE, "POST", item);
  }

  async update(
    id: string,
    patch: Partial<VideoProductionItem>,
  ): Promise<VideoProductionItem> {
    return apiSend(`${BASE}/${id}`, "PATCH", patch);
  }

  async delete(id: string): Promise<void> {
    await apiSend(`${BASE}/${id}`, "DELETE");
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await apiSend(`${BASE}/reorder`, "POST", { orderedIds });
  }
}
