import type { VideoProductionItem } from "@/types/video-production";
import { normalizeVideoOrientation } from "@/types/video-production";
import type { VideoProductionRepository } from "@/lib/repositories/video-production-types";
import { createId, nowIso, sortByOrder } from "@/lib/utils/id";
import { execute, query } from "@/lib/server/db";
import {
  PortfolioItemRow,
  MaxOrderRow,
  rowToEntity,
  splitPortfolioEntity,
  toMysqlDateTime,
} from "./portfolioRow";

const SERVICE = "video-production" as const;

function normalize(item: VideoProductionItem): VideoProductionItem {
  return {
    ...item,
    orientation: normalizeVideoOrientation(item.orientation),
  };
}

function toItem(row: PortfolioItemRow): VideoProductionItem {
  return normalize(rowToEntity<VideoProductionItem>(row));
}

async function upsert(item: VideoProductionItem): Promise<VideoProductionItem> {
  const { columns, content } = splitPortfolioEntity({
    ...(item as unknown as Record<string, unknown>),
    service: SERVICE,
    slug: null,
  });
  await execute(
    `INSERT INTO portfolio_items (
      id, service, slug, title, client_name, status, featured, sort_order,
      content_json, meta_title, meta_description, created_at, updated_at
    ) VALUES (
      :id, :service, :slug, :title, :client_name, :status, :featured, :sort_order,
      :content_json, :meta_title, :meta_description, :created_at, :updated_at
    )
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      client_name = VALUES(client_name),
      status = VALUES(status),
      featured = VALUES(featured),
      sort_order = VALUES(sort_order),
      content_json = VALUES(content_json),
      meta_title = VALUES(meta_title),
      meta_description = VALUES(meta_description),
      updated_at = VALUES(updated_at)`,
    {
      ...columns,
      slug: null,
      featured: columns.featured ? 1 : 0,
      content_json: JSON.stringify(content),
      created_at: toMysqlDateTime(columns.created_at),
      updated_at: toMysqlDateTime(columns.updated_at),
    },
  );
  return item;
}

export class MySqlVideoProductionRepository
  implements VideoProductionRepository
{
  async ensureSeeded(): Promise<void> {}

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<VideoProductionItem[]> {
    const rows = options?.includeDrafts
      ? await query<PortfolioItemRow[]>(
          `SELECT * FROM portfolio_items WHERE service = :service ORDER BY sort_order ASC`,
          { service: SERVICE },
        )
      : await query<PortfolioItemRow[]>(
          `SELECT * FROM portfolio_items WHERE service = :service AND status = 'published' ORDER BY sort_order ASC`,
          { service: SERVICE },
        );
    return sortByOrder(rows.map(toItem));
  }

  async getById(id: string): Promise<VideoProductionItem | null> {
    const rows = await query<PortfolioItemRow[]>(
      `SELECT * FROM portfolio_items WHERE id = :id AND service = :service LIMIT 1`,
      { id, service: SERVICE },
    );
    return rows[0] ? toItem(rows[0]) : null;
  }

  async create(
    item: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<VideoProductionItem> {
    const stamp = nowIso();
    const maxRows = await query<MaxOrderRow[]>(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE service = :service`,
      { service: SERVICE },
    );
    return upsert(
      normalize({
        ...item,
        id: item.id ?? createId(),
        order: item.order ?? Number(maxRows[0]?.m ?? -1) + 1,
        createdAt: stamp,
        updatedAt: stamp,
      } as VideoProductionItem),
    );
  }

  async update(
    id: string,
    patch: Partial<VideoProductionItem>,
  ): Promise<VideoProductionItem> {
    const existing = await this.getById(id);
    if (!existing) throw new Error("Video nuk u gjet");
    return upsert(
      normalize({
        ...existing,
        ...patch,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: nowIso(),
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await execute(
      `DELETE FROM portfolio_items WHERE id = :id AND service = :service`,
      { id, service: SERVICE },
    );
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const stamp = toMysqlDateTime(nowIso());
    for (let i = 0; i < orderedIds.length; i++) {
      await execute(
        `UPDATE portfolio_items SET sort_order = :sort_order, updated_at = :updated_at
         WHERE id = :id AND service = :service`,
        { id: orderedIds[i], service: SERVICE, sort_order: i, updated_at: stamp },
      );
    }
  }
}
