import type { WebDesignProject } from "@/types/web-design";
import type { WebDesignProjectRepository } from "@/lib/repositories/web-design-types";
import { apiGet, apiSend } from "./http";

const BASE = "/api/admin/web-design";

export class ApiWebDesignProjectRepository
  implements WebDesignProjectRepository
{
  async ensureSeeded(): Promise<void> {}

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<WebDesignProject[]> {
    const includeDrafts = options?.includeDrafts !== false;
    return apiGet(`${BASE}?includeDrafts=${includeDrafts}`);
  }

  async getById(id: string): Promise<WebDesignProject | null> {
    try {
      return await apiGet(`${BASE}/${id}`);
    } catch {
      return null;
    }
  }

  async getBySlug(): Promise<WebDesignProject | null> {
    throw new Error("getBySlug is server-only for public pages");
  }

  async create(
    project: Omit<WebDesignProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<WebDesignProject> {
    return apiSend(BASE, "POST", project);
  }

  async update(
    id: string,
    patch: Partial<WebDesignProject>,
  ): Promise<WebDesignProject> {
    return apiSend(`${BASE}/${id}`, "PATCH", patch);
  }

  async delete(id: string): Promise<void> {
    await apiSend(`${BASE}/${id}`, "DELETE");
  }

  async duplicate(id: string): Promise<WebDesignProject> {
    return apiSend(`${BASE}/${id}/duplicate`, "POST");
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await apiSend(`${BASE}/reorder`, "POST", { orderedIds });
  }
}
