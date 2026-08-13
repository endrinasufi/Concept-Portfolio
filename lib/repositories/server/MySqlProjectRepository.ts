import type { BrandingProject, Project } from "@/types/branding";
import type { ProjectRepository } from "@/lib/repositories/types";
import { createId, nowIso, slugify, sortByOrder } from "@/lib/utils/id";
import { execute, query } from "@/lib/server/db";
import {
  PortfolioItemRow,
  MaxOrderRow,
  rowToEntity,
  splitPortfolioEntity,
  toMysqlDateTime,
} from "./portfolioRow";

const SERVICE = "branding" as const;

function toProject(row: PortfolioItemRow): BrandingProject {
  return rowToEntity<BrandingProject>(row, { service: "branding" });
}

export class MySqlProjectRepository implements ProjectRepository {
  async ensureSeeded(): Promise<void> {
    /* no-op in MySQL / production */
  }

  async list(options?: {
    service?: string;
    includeDrafts?: boolean;
  }): Promise<Project[]> {
    const service = options?.service || SERVICE;
    const includeDrafts = Boolean(options?.includeDrafts);
    const rows = includeDrafts
      ? await query<PortfolioItemRow[]>(
          `SELECT * FROM portfolio_items
           WHERE service = :service
           ORDER BY sort_order ASC`,
          { service },
        )
      : await query<PortfolioItemRow[]>(
          `SELECT * FROM portfolio_items
           WHERE service = :service AND status = 'published'
           ORDER BY sort_order ASC`,
          { service },
        );
    return sortByOrder(rows.map(toProject));
  }

  async getById(id: string): Promise<Project | null> {
    const rows = await query<PortfolioItemRow[]>(
      `SELECT * FROM portfolio_items WHERE id = :id AND service = :service LIMIT 1`,
      { id, service: SERVICE },
    );
    return rows[0] ? toProject(rows[0]) : null;
  }

  async getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<Project | null> {
    const rows = await query<PortfolioItemRow[]>(
      `SELECT * FROM portfolio_items
       WHERE service = :service AND slug = :slug
       LIMIT 1`,
      { service: SERVICE, slug },
    );
    const row = rows[0];
    if (!row) return null;
    if (!options?.includeDrafts && row.status !== "published") return null;
    return toProject(row);
  }

  private async insert(project: BrandingProject): Promise<Project> {
    const { columns, content } = splitPortfolioEntity(
      project as unknown as Record<string, unknown>,
    );
    await execute(
      `INSERT INTO portfolio_items (
        id, service, slug, title, client_name, status, featured, sort_order,
        content_json, meta_title, meta_description, created_at, updated_at
      ) VALUES (
        :id, :service, :slug, :title, :client_name, :status, :featured, :sort_order,
        CAST(:content_json AS JSON), :meta_title, :meta_description, :created_at, :updated_at
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

  async create(
    project: Omit<BrandingProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<Project> {
    const stamp = nowIso();
    const maxRows = await query<MaxOrderRow[]>(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE service = :service`,
      { service: SERVICE },
    );
    const maxOrder = Number(maxRows[0]?.m ?? -1);
    const record: BrandingProject = {
      ...project,
      id: project.id ?? createId(),
      service: "branding",
      slug: project.slug || slugify(project.title),
      order: project.order ?? maxOrder + 1,
      brandColors: project.brandColors ?? [],
      typography: project.typography ?? [],
      sections: project.sections ?? [],
      gallery: project.gallery ?? [],
      galleryRows: project.galleryRows ?? [],
      services: project.services ?? [],
      createdAt: stamp,
      updatedAt: stamp,
    };
    return this.insert(record);
  }

  async update(id: string, patch: Partial<BrandingProject>): Promise<Project> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Project not found: ${id}`);
    const next: BrandingProject = {
      ...existing,
      ...patch,
      id: existing.id,
      service: "branding",
      updatedAt: nowIso(),
    };
    await this.insert(next);
    return next;
  }

  async delete(id: string): Promise<void> {
    await execute(
      `DELETE FROM portfolio_items WHERE id = :id AND service = :service`,
      { id, service: SERVICE },
    );
  }

  async duplicate(id: string): Promise<Project> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Project not found: ${id}`);
    const stamp = nowIso();
    const copy: BrandingProject = {
      ...structuredClone(existing),
      id: createId(),
      title: `${existing.title} (kopje)`,
      slug: `${existing.slug}-copy-${Date.now().toString(36)}`,
      status: "draft",
      featured: false,
      createdAt: stamp,
      updatedAt: stamp,
      brandColors: existing.brandColors.map((c) => ({ ...c, id: createId() })),
      typography: existing.typography.map((t) => ({ ...t, id: createId() })),
      sections: existing.sections.map((s) => ({ ...s, id: createId() })),
      gallery: existing.gallery.map((g) => ({ ...g, id: createId() })),
      galleryRows: (existing.galleryRows ?? []).map((row) => ({
        ...row,
        id: createId(),
        items: row.items.map((g) => ({ ...g, id: createId() })),
      })),
    };
    const maxRows = await query<MaxOrderRow[]>(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE service = :service`,
      { service: SERVICE },
    );
    copy.order = Number(maxRows[0]?.m ?? -1) + 1;
    return this.insert(copy);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const stamp = toMysqlDateTime(nowIso());
    for (let i = 0; i < orderedIds.length; i++) {
      await execute(
        `UPDATE portfolio_items
         SET sort_order = :sort_order, updated_at = :updated_at
         WHERE id = :id AND service = :service`,
        {
          id: orderedIds[i],
          service: SERVICE,
          sort_order: i,
          updated_at: stamp,
        },
      );
    }
  }
}
