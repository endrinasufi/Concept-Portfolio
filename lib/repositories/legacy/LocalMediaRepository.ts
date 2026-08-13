import type { MediaAsset } from "@/types/media";
import type { MediaRepository } from "@/lib/repositories/media-types";
import { createId, nowIso } from "@/lib/utils/id";
import { getDb } from "./db";

export class LocalMediaRepository implements MediaRepository {
  private urlCache = new Map<string, string>();

  async upload(
    file: File | Blob,
    meta?: Partial<
      Pick<
        MediaAsset,
        "filename" | "width" | "height" | "objectPositionX" | "objectPositionY"
      >
    > & { id?: string },
  ): Promise<MediaAsset> {
    const db = getDb();
    const id = meta?.id ?? createId();
    const filename =
      meta?.filename ??
      (file instanceof File ? file.name : `upload-${id}`);
    const asset: MediaAsset = {
      id,
      mimeType: file.type || "application/octet-stream",
      filename,
      width: meta?.width,
      height: meta?.height,
      objectPositionX: meta?.objectPositionX ?? 50,
      objectPositionY: meta?.objectPositionY ?? 50,
      provider: "indexeddb",
      createdAt: nowIso(),
    };
    await db.transaction("rw", db.media, db.mediaBlobs, async () => {
      await db.media.put(asset);
      await db.mediaBlobs.put({ id, blob: file });
    });
    return asset;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    this.revokeUrl(id);
    await db.transaction("rw", db.media, db.mediaBlobs, async () => {
      await db.media.delete(id);
      await db.mediaBlobs.delete(id);
    });
  }

  async getById(id: string): Promise<MediaAsset | null> {
    const db = getDb();
    return (await db.media.get(id)) ?? null;
  }

  async getUrl(id: string): Promise<string | null> {
    if (!id) return null;
    const cached = this.urlCache.get(id);
    if (cached) return cached;
    const db = getDb();
    const record = await db.mediaBlobs.get(id);
    if (!record) return null;
    const url = URL.createObjectURL(record.blob);
    this.urlCache.set(id, url);
    return url;
  }

  async list(): Promise<MediaAsset[]> {
    const db = getDb();
    const items = await db.media.toArray();
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  revokeUrl(id: string): void {
    const url = this.urlCache.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      this.urlCache.delete(id);
    }
  }

  revokeAll(): void {
    for (const [id, url] of this.urlCache) {
      URL.revokeObjectURL(url);
      this.urlCache.delete(id);
    }
  }
}
