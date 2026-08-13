import type { MediaAsset } from "@/types/media";
import type { MediaRepository } from "@/lib/repositories/media-types";
import { apiGet, apiUpload } from "./http";

const BASE = "/api/admin/media";

export class ApiMediaRepository implements MediaRepository {
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
    const form = new FormData();
    const filename =
      meta?.filename ??
      (file instanceof File ? file.name : `upload-${Date.now()}`);
    form.append("file", file, filename);
    if (meta?.id) form.append("id", meta.id);
    if (meta?.width != null) form.append("width", String(meta.width));
    if (meta?.height != null) form.append("height", String(meta.height));
    return apiUpload<MediaAsset>(BASE, form);
  }

  async delete(id: string): Promise<void> {
    this.revokeUrl(id);
    const res = await fetch(`${BASE}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(data.error || "Delete failed");
  }

  async getById(id: string): Promise<MediaAsset | null> {
    const list = await this.list();
    return list.find((m) => m.id === id) ?? null;
  }

  async getUrl(id: string): Promise<string | null> {
    if (!id) return null;
    const cached = this.urlCache.get(id);
    if (cached) return cached;
    const url = `/api/media/${encodeURIComponent(id)}`;
    this.urlCache.set(id, url);
    return url;
  }

  async list(): Promise<MediaAsset[]> {
    return apiGet<MediaAsset[]>(BASE);
  }

  revokeUrl(id: string): void {
    this.urlCache.delete(id);
  }

  revokeAll(): void {
    this.urlCache.clear();
  }
}
