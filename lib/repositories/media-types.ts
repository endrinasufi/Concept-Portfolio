import type { MediaAsset } from "@/types/media";

export interface MediaRepository {
  upload(file: File | Blob, meta?: Partial<Pick<MediaAsset, "filename" | "width" | "height" | "objectPositionX" | "objectPositionY">>): Promise<MediaAsset>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<MediaAsset | null>;
  getUrl(id: string): Promise<string | null>;
  list(): Promise<MediaAsset[]>;
  revokeUrl(id: string): void;
  revokeAll(): void;
}
