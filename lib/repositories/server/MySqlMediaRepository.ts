import type { MediaAsset } from "@/types/media";
import type { MediaRepository } from "@/lib/repositories/media-types";
import { createId, nowIso } from "@/lib/utils/id";
import { execute, query, type RowDataPacket } from "@/lib/server/db";
import { getMediaStorageProvider } from "@/lib/server/media";
import {
  fromMysqlDateTime,
  toMysqlDateTime,
} from "./portfolioRow";
import { sniffMimeType } from "@/lib/server/api";

interface MediaRow extends RowDataPacket {
  id: string;
  filename: string;
  mime_type: string;
  provider: string;
  provider_key: string | null;
  public_url: string | null;
  width: number | null;
  height: number | null;
  object_position_x: number | null;
  object_position_y: number | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function rowToAsset(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    provider: (row.provider as MediaAsset["provider"]) || "local",
    providerKey: row.provider_key ?? undefined,
    publicUrl: row.public_url ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    objectPositionX: row.object_position_x ?? 50,
    objectPositionY: row.object_position_y ?? 50,
    createdAt: fromMysqlDateTime(row.created_at),
    updatedAt: fromMysqlDateTime(row.updated_at),
  };
}

export class MySqlMediaRepository implements MediaRepository {
  async upload(
    file: File | Blob,
    meta?: Partial<
      Pick<
        MediaAsset,
        | "filename"
        | "width"
        | "height"
        | "objectPositionX"
        | "objectPositionY"
      >
    > & { id?: string },
  ): Promise<MediaAsset> {
    const id = meta?.id ?? createId();
    const filename =
      meta?.filename ??
      (file instanceof File ? file.name : `upload-${id}`);
    const mimeType = sniffMimeType(filename, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await getMediaStorageProvider().upload(buffer, {
      filename,
      mimeType,
      id,
    });
    const stamp = nowIso();
    const asset: MediaAsset = {
      id,
      filename,
      mimeType,
      provider: stored.provider,
      providerKey: stored.providerKey,
      publicUrl: stored.publicUrl,
      width: meta?.width ?? stored.width,
      height: meta?.height ?? stored.height,
      objectPositionX: meta?.objectPositionX ?? 50,
      objectPositionY: meta?.objectPositionY ?? 50,
      createdAt: stamp,
      updatedAt: stamp,
    };
    await execute(
      `INSERT INTO media_assets (
        id, filename, mime_type, provider, provider_key, public_url,
        width, height, object_position_x, object_position_y, created_at, updated_at
      ) VALUES (
        :id, :filename, :mime_type, :provider, :provider_key, :public_url,
        :width, :height, :object_position_x, :object_position_y, :created_at, :updated_at
      )
      ON DUPLICATE KEY UPDATE
        filename = VALUES(filename),
        mime_type = VALUES(mime_type),
        provider = VALUES(provider),
        provider_key = VALUES(provider_key),
        public_url = VALUES(public_url),
        width = VALUES(width),
        height = VALUES(height),
        object_position_x = VALUES(object_position_x),
        object_position_y = VALUES(object_position_y),
        updated_at = VALUES(updated_at)`,
      {
        id: asset.id,
        filename: asset.filename,
        mime_type: asset.mimeType,
        provider: asset.provider,
        provider_key: asset.providerKey ?? null,
        public_url: asset.publicUrl ?? null,
        width: asset.width ?? null,
        height: asset.height ?? null,
        object_position_x: asset.objectPositionX ?? 50,
        object_position_y: asset.objectPositionY ?? 50,
        created_at: toMysqlDateTime(asset.createdAt),
        updated_at: toMysqlDateTime(asset.updatedAt || asset.createdAt),
      },
    );
    return asset;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (existing?.providerKey) {
      try {
        await getMediaStorageProvider().delete(existing.providerKey);
      } catch {
        /* continue deleting DB row */
      }
    }
    await execute(`DELETE FROM media_assets WHERE id = :id`, { id });
  }

  async getById(id: string): Promise<MediaAsset | null> {
    const rows = await query<MediaRow[]>(
      `SELECT * FROM media_assets WHERE id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ? rowToAsset(rows[0]) : null;
  }

  async getUrl(id: string): Promise<string | null> {
    const asset = await this.getById(id);
    return asset?.publicUrl ?? null;
  }

  async list(): Promise<MediaAsset[]> {
    const rows = await query<MediaRow[]>(
      `SELECT * FROM media_assets ORDER BY created_at DESC`,
    );
    return rows.map(rowToAsset);
  }

  revokeUrl(): void {
    /* no blob URLs on server */
  }

  revokeAll(): void {
    /* no blob URLs on server */
  }
}
