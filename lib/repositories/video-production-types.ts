import type { VideoProductionItem } from "@/types/video-production";

export interface VideoProductionRepository {
  list(options?: { includeDrafts?: boolean }): Promise<VideoProductionItem[]>;
  getById(id: string): Promise<VideoProductionItem | null>;
  create(
    item: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<VideoProductionItem>;
  update(
    id: string,
    patch: Partial<VideoProductionItem>,
  ): Promise<VideoProductionItem>;
  delete(id: string): Promise<void>;
  reorder(orderedIds: string[]): Promise<void>;
  ensureSeeded(): Promise<void>;
}
