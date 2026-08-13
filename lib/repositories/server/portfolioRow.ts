import type { RowDataPacket } from "@/lib/server/db";

export type PortfolioService =
  | "branding"
  | "social-media"
  | "web-design"
  | "photoshooting"
  | "video-production";

export interface PortfolioItemRow extends RowDataPacket {
  id: string;
  service: PortfolioService;
  slug: string | null;
  title: string;
  client_name: string | null;
  status: "draft" | "published";
  featured: number | boolean;
  sort_order: number;
  content_json: unknown;
  meta_title: string | null;
  meta_description: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface MaxOrderRow extends RowDataPacket {
  m: number | string | null;
}

export function toMysqlDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 23).replace("T", " ");
  }
  return d.toISOString().slice(0, 23).replace("T", " ");
}

export function fromMysqlDateTime(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const normalized = String(value).includes("T")
    ? String(value)
    : `${String(value).replace(" ", "T")}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

/** Column fields stored outside content_json */
const COLUMN_KEYS = new Set([
  "id",
  "service",
  "slug",
  "title",
  "client",
  "clientName",
  "status",
  "featured",
  "order",
  "metaTitle",
  "metaDescription",
  "createdAt",
  "updatedAt",
]);

export function splitPortfolioEntity(entity: Record<string, unknown>): {
  columns: {
    id: string;
    service: PortfolioService;
    slug: string | null;
    title: string;
    client_name: string | null;
    status: "draft" | "published";
    featured: boolean;
    sort_order: number;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
  };
  content: Record<string, unknown>;
} {
  const service = entity.service as PortfolioService;
  const clientName =
    (typeof entity.clientName === "string" && entity.clientName) ||
    (typeof entity.client === "string" && entity.client) ||
    null;

  let metaTitle =
    typeof entity.metaTitle === "string" ? entity.metaTitle : null;
  let metaDescription =
    typeof entity.metaDescription === "string" ? entity.metaDescription : null;

  const seo = entity.seo as { metaTitle?: string; metaDescription?: string } | undefined;
  if (!metaTitle && seo?.metaTitle) metaTitle = seo.metaTitle;
  if (!metaDescription && seo?.metaDescription) {
    metaDescription = seo.metaDescription;
  }

  const content: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entity)) {
    if (!COLUMN_KEYS.has(key)) content[key] = value;
  }

  return {
    columns: {
      id: String(entity.id),
      service,
      slug:
        typeof entity.slug === "string" && entity.slug.length > 0
          ? entity.slug
          : null,
      title: String(entity.title ?? ""),
      client_name: clientName,
      status: entity.status === "published" ? "published" : "draft",
      featured: Boolean(entity.featured),
      sort_order: Number(entity.order ?? 0),
      meta_title: metaTitle,
      meta_description: metaDescription,
      created_at: String(entity.createdAt),
      updated_at: String(entity.updatedAt),
    },
    content,
  };
}

export function rowToEntity<T>(
  row: PortfolioItemRow,
  extras: Partial<T> = {},
): T {
  const content = parseJsonField<Record<string, unknown>>(row.content_json, {});
  const base: Record<string, unknown> = {
    ...content,
    ...extras,
    id: row.id,
    service: row.service,
    title: row.title,
    status: row.status,
    featured: Boolean(row.featured),
    order: row.sort_order,
    createdAt: fromMysqlDateTime(row.created_at),
    updatedAt: fromMysqlDateTime(row.updated_at),
  };

  if (row.slug != null) base.slug = row.slug;

  if (row.service === "branding") {
    base.client = row.client_name ?? content.client ?? "";
    if (row.meta_title) base.metaTitle = row.meta_title;
    if (row.meta_description) base.metaDescription = row.meta_description;
  } else if (row.service === "video-production") {
    base.clientName = row.client_name ?? content.clientName ?? "";
  } else {
    base.clientName =
      row.client_name ?? content.clientName ?? content.client ?? "";
    if (row.meta_title || row.meta_description) {
      base.seo = {
        ...((content.seo as object) || {}),
        ...(row.meta_title ? { metaTitle: row.meta_title } : {}),
        ...(row.meta_description
          ? { metaDescription: row.meta_description }
          : {}),
      };
    }
  }

  return base as T;
}
