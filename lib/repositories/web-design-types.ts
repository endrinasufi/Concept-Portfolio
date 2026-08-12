import type { WebDesignProject } from "@/types/web-design";

export interface WebDesignProjectRepository {
  list(options?: { includeDrafts?: boolean }): Promise<WebDesignProject[]>;
  getById(id: string): Promise<WebDesignProject | null>;
  getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<WebDesignProject | null>;
  create(
    project: Omit<WebDesignProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<WebDesignProject>;
  update(id: string, patch: Partial<WebDesignProject>): Promise<WebDesignProject>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<WebDesignProject>;
  reorder(orderedIds: string[]): Promise<void>;
  ensureSeeded(): Promise<void>;
}
