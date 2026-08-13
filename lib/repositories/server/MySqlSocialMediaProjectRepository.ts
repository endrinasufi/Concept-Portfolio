import type { SocialMediaProject } from "@/types/social-media";
import {
  defaultBlock2,
  defaultPageAppearance,
} from "@/types/social-media";
import type { SocialMediaProjectRepository } from "@/lib/repositories/social-media-types";
import { createId, nowIso, slugify, sortByOrder } from "@/lib/utils/id";
import { execute, query } from "@/lib/server/db";
import {
  PortfolioItemRow,
  MaxOrderRow,
  rowToEntity,
  splitPortfolioEntity,
  toMysqlDateTime,
} from "./portfolioRow";

const SERVICE = "social-media" as const;

function normalize(raw: SocialMediaProject): SocialMediaProject {
  return {
    ...raw,
    service: "social-media",
    usernames: raw.usernames ?? [],
    pageAppearance: raw.pageAppearance ?? defaultPageAppearance(),
    block1: { ...raw.block1, feedPosts: raw.block1?.feedPosts ?? [] },
    block2: raw.block2 ?? defaultBlock2(),
    block3: raw.block3 ?? { stories: [] },
    seo: raw.seo ?? {},
  };
}

function toProject(row: PortfolioItemRow): SocialMediaProject {
  return normalize(rowToEntity<SocialMediaProject>(row));
}

async function upsert(project: SocialMediaProject): Promise<SocialMediaProject> {
  const { columns, content } = splitPortfolioEntity(
    project as unknown as Record<string, unknown>,
  );
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

export class MySqlSocialMediaProjectRepository
  implements SocialMediaProjectRepository
{
  async ensureSeeded(): Promise<void> {}

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<SocialMediaProject[]> {
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

  async getById(id: string): Promise<SocialMediaProject | null> {
    const rows = await query<PortfolioItemRow[]>(
      `SELECT * FROM portfolio_items WHERE id = :id AND service = :service LIMIT 1`,
      { id, service: SERVICE },
    );
    return rows[0] ? toProject(rows[0]) : null;
  }

  async getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<SocialMediaProject | null> {
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
    project: Omit<SocialMediaProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<SocialMediaProject> {
    const stamp = nowIso();
    const maxRows = await query<MaxOrderRow[]>(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE service = :service`,
      { service: SERVICE },
    );
    const record = normalize({
      ...project,
      id: project.id ?? createId(),
      service: "social-media",
      slug: project.slug || slugify(project.title),
      order: project.order ?? Number(maxRows[0]?.m ?? -1) + 1,
      createdAt: stamp,
      updatedAt: stamp,
    } as SocialMediaProject);
    return upsert(record);
  }

  async update(
    id: string,
    patch: Partial<SocialMediaProject>,
  ): Promise<SocialMediaProject> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Social media project not found: ${id}`);
    const next = normalize({
      ...existing,
      ...patch,
      id: existing.id,
      service: "social-media",
      updatedAt: nowIso(),
    });
    return upsert(next);
  }

  async delete(id: string): Promise<void> {
    await execute(
      `DELETE FROM portfolio_items WHERE id = :id AND service = :service`,
      { id, service: SERVICE },
    );
  }

  async duplicate(id: string): Promise<SocialMediaProject> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Social media project not found: ${id}`);
    const stamp = nowIso();
    const maxRows = await query<MaxOrderRow[]>(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE service = :service`,
      { service: SERVICE },
    );
    const copy = normalize({
      ...structuredClone(existing),
      id: createId(),
      title: `${existing.title} (kopje)`,
      slug: `${existing.slug}-copy-${Date.now().toString(36)}`,
      status: "draft",
      order: Number(maxRows[0]?.m ?? -1) + 1,
      createdAt: stamp,
      updatedAt: stamp,
      usernames: existing.usernames.map((u) => ({ ...u, id: createId() })),
      block1: {
        ...existing.block1,
        feedPosts: existing.block1.feedPosts.map((p) => ({
          ...p,
          id: createId(),
        })),
      },
      block2: {
        ...existing.block2,
        reels: existing.block2.reels.map((r) => ({ ...r, id: createId() })),
      },
      block3: {
        stories: existing.block3.stories.map((s) => ({ ...s, id: createId() })),
      },
    });
    return upsert(copy);
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
