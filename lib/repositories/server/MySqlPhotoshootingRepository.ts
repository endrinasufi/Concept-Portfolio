import type { PhotoshootingProject } from "@/types/photoshooting";
import type { PhotoshootingRepository } from "@/lib/repositories/photoshooting-types";
import { createId, nowIso, slugify, sortByOrder } from "@/lib/utils/id";
import { execute, query } from "@/lib/server/db";
import {
  PortfolioItemRow,
  MaxOrderRow,
  rowToEntity,
  splitPortfolioEntity,
  toMysqlDateTime,
} from "./portfolioRow";

const SERVICE = "photoshooting" as const;

function normalize(raw: PhotoshootingProject): PhotoshootingProject {
  return {
    ...raw,
    cells: raw.cells ?? [],
  };
}

function toProject(row: PortfolioItemRow): PhotoshootingProject {
  return normalize(rowToEntity<PhotoshootingProject>(row));
}

async function upsert(
  project: PhotoshootingProject,
): Promise<PhotoshootingProject> {
  const { columns, content } = splitPortfolioEntity({
    ...(project as unknown as Record<string, unknown>),
    service: SERVICE,
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
      slug = VALUES(slug),
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
      featured: columns.featured ? 1 : 0,
      content_json: JSON.stringify(content),
      created_at: toMysqlDateTime(columns.created_at),
      updated_at: toMysqlDateTime(columns.updated_at),
    },
  );
  return project;
}

export class MySqlPhotoshootingRepository implements PhotoshootingRepository {
  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<PhotoshootingProject[]> {
    const rows = options?.includeDrafts
      ? await query<PortfolioItemRow[]>(
          `SELECT * FROM portfolio_items WHERE service = :service ORDER BY sort_order ASC`,
          { service: SERVICE },
        )
      : await query<PortfolioItemRow[]>(
          `SELECT * FROM portfolio_items WHERE service = :service AND status = 'published' ORDER BY sort_order ASC`,
          { service: SERVICE },
        );
    return sortByOrder(rows.map(toProject));
  }

  async getById(id: string): Promise<PhotoshootingProject | null> {
    const rows = await query<PortfolioItemRow[]>(
      `SELECT * FROM portfolio_items WHERE id = :id AND service = :service LIMIT 1`,
      { id, service: SERVICE },
    );
    return rows[0] ? toProject(rows[0]) : null;
  }

  async getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<PhotoshootingProject | null> {
    const rows = await query<PortfolioItemRow[]>(
      `SELECT * FROM portfolio_items WHERE service = :service AND slug = :slug LIMIT 1`,
      { service: SERVICE, slug },
    );
    const row = rows[0];
    if (!row) return null;
    if (!options?.includeDrafts && row.status !== "published") return null;
    return toProject(row);
  }

  async create(
    item: Omit<PhotoshootingProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<PhotoshootingProject> {
    const stamp = nowIso();
    const maxRows = await query<MaxOrderRow[]>(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE service = :service`,
      { service: SERVICE },
    );
    return upsert(
      normalize({
        ...item,
        id: item.id ?? createId(),
        slug: item.slug || slugify(item.title),
        order: item.order ?? Number(maxRows[0]?.m ?? -1) + 1,
        createdAt: stamp,
        updatedAt: stamp,
      } as PhotoshootingProject),
    );
  }

  async update(
    id: string,
    patch: Partial<PhotoshootingProject>,
  ): Promise<PhotoshootingProject> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Photoshooting project not found: ${id}`);
    return upsert(
      normalize({
        ...existing,
        ...patch,
        id: existing.id,
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
}
