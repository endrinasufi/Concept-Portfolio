import type { VideoProductionItem } from "@/types/video-production";
import { normalizeVideoOrientation } from "@/types/video-production";
import type { VideoProductionRepository } from "@/lib/repositories/video-production-types";
import { createSeedVideoProductionItems } from "@/lib/video-production/seed";
import { createId, nowIso } from "@/lib/utils/id";
import { getDb } from "./db";

function normalizeItem(item: VideoProductionItem): VideoProductionItem {
  return {
    ...item,
    orientation: normalizeVideoOrientation(item.orientation),
  };
}

export class LocalVideoProductionRepository implements VideoProductionRepository {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    const count = await db.videoProduction.count();
    if (count > 0) return;
    await db.videoProduction.bulkPut(createSeedVideoProductionItems());
  }

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<VideoProductionItem[]> {
    await this.ensureSeeded();
    const db = getDb();
    let items = await db.videoProduction.orderBy("order").toArray();
    if (!options?.includeDrafts) {
      items = items.filter((v) => v.status === "published");
    }
    return items.map(normalizeItem);
  }

  async getById(id: string): Promise<VideoProductionItem | null> {
    await this.ensureSeeded();
    const item = await getDb().videoProduction.get(id);
    return item ? normalizeItem(item) : null;
  }

  async create(
    item: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<VideoProductionItem> {
    const db = getDb();
    const existing = await db.videoProduction.orderBy("order").toArray();
    const now = nowIso();
    const row: VideoProductionItem = {
      ...item,
      orientation: normalizeVideoOrientation(item.orientation),
      id: item.id ?? createId(),
      order: item.order ?? existing.length,
      createdAt: now,
      updatedAt: now,
    };
    await db.videoProduction.put(row);
    return row;
  }

  async update(
    id: string,
    patch: Partial<VideoProductionItem>,
  ): Promise<VideoProductionItem> {
    const db = getDb();
    const current = await db.videoProduction.get(id);
    if (!current) throw new Error("Video nuk u gjet");
    const next: VideoProductionItem = normalizeItem({
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    });
    await db.videoProduction.put(next);
    return next;
  }

  async delete(id: string): Promise<void> {
    await getDb().videoProduction.delete(id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const db = getDb();
    await db.transaction("rw", db.videoProduction, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.videoProduction.update(orderedIds[i], {
          order: i,
          updatedAt: nowIso(),
        });
      }
    });
  }
}
