import type { WebDesignProject } from "@/types/web-design";
import {
  defaultFeaturedVisual,
  defaultWebDesignAppearance,
} from "@/types/web-design";
import type { WebDesignProjectRepository } from "@/lib/repositories/web-design-types";
import { createSeedWebDesignProjects } from "@/lib/web-design/seed";
import { createId, nowIso, slugify, sortByOrder } from "@/lib/utils/id";
import { getDb } from "./db";

function isValidSchema(project: WebDesignProject | Record<string, unknown>): boolean {
  if (!project || typeof project !== "object") return false;
  if (!("featuredVisual" in project) || !("gallery" in project)) return false;
  const p = project as WebDesignProject;
  return Boolean(p.featuredVisual && p.appearance);
}

function normalizeProject(raw: WebDesignProject): WebDesignProject {
  return {
    ...raw,
    service: "web-design",
    serviceLabel: raw.serviceLabel || "Web Design",
    services: raw.services ?? [],
    descriptionTitle: raw.descriptionTitle || "Description",
    description: raw.description ?? "",
    appearance: raw.appearance ?? defaultWebDesignAppearance(),
    featuredVisual: {
      ...defaultFeaturedVisual(),
      ...raw.featuredVisual,
    },
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery.map((item) => ({
          ...item,
          displayType: item.displayType === "mobile" ? "mobile" : "desktop",
        }))
      : [],
    seo: raw.seo ?? {},
  };
}

function remapNested(project: WebDesignProject): WebDesignProject {
  return {
    ...project,
    gallery: project.gallery.map((item) => ({ ...item, id: createId() })),
  };
}

export class LocalWebDesignProjectRepository implements WebDesignProjectRepository {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    const existing = await db.webDesignProjects.toArray();
    const needsReseed =
      existing.length === 0 || existing.some((p) => !isValidSchema(p));
    if (!needsReseed) return;
    await db.webDesignProjects.clear();
    await db.webDesignProjects.bulkPut(createSeedWebDesignProjects());
  }

  async list(options?: { includeDrafts?: boolean }): Promise<WebDesignProject[]> {
    await this.ensureSeeded();
    const db = getDb();
    let items = await db.webDesignProjects.toArray();
    if (!options?.includeDrafts) {
      items = items.filter((p) => p.status === "published");
    }
    return sortByOrder(items.map(normalizeProject));
  }

  async getById(id: string): Promise<WebDesignProject | null> {
    await this.ensureSeeded();
    const db = getDb();
    const project = await db.webDesignProjects.get(id);
    return project ? normalizeProject(project) : null;
  }

  async getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<WebDesignProject | null> {
    await this.ensureSeeded();
    const db = getDb();
    const project = await db.webDesignProjects.where("slug").equals(slug).first();
    if (!project) return null;
    if (!options?.includeDrafts && project.status !== "published") return null;
    return normalizeProject(project);
  }

  async create(
    project: Omit<WebDesignProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<WebDesignProject> {
    const db = getDb();
    const stamp = nowIso();
    const all = await db.webDesignProjects.toArray();
    const maxOrder = all.reduce((m, p) => Math.max(m, p.order), -1);
    const record: WebDesignProject = {
      ...emptyDefaults(project),
      id: project.id ?? createId(),
      slug: project.slug || slugify(project.title),
      order: project.order ?? maxOrder + 1,
      createdAt: stamp,
      updatedAt: stamp,
    };
    await db.webDesignProjects.put(record);
    return record;
  }

  async update(
    id: string,
    patch: Partial<WebDesignProject>,
  ): Promise<WebDesignProject> {
    const db = getDb();
    const existing = await db.webDesignProjects.get(id);
    if (!existing) throw new Error(`Web design project not found: ${id}`);
    const next: WebDesignProject = {
      ...normalizeProject(existing),
      ...patch,
      id: existing.id,
      service: "web-design",
      featuredVisual: patch.featuredVisual ?? existing.featuredVisual,
      appearance: patch.appearance ?? existing.appearance,
      gallery: patch.gallery ?? existing.gallery,
      updatedAt: nowIso(),
    };
    await db.webDesignProjects.put(next);
    return next;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.webDesignProjects.delete(id);
  }

  async duplicate(id: string): Promise<WebDesignProject> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Web design project not found: ${id}`);
    const stamp = nowIso();
    const copy = remapNested({
      ...structuredClone(existing),
      id: createId(),
      title: `${existing.title} (kopje)`,
      slug: `${existing.slug}-copy-${Date.now().toString(36)}`,
      status: "draft",
      createdAt: stamp,
      updatedAt: stamp,
    });
    const db = getDb();
    const all = await db.webDesignProjects.toArray();
    copy.order = all.reduce((m, p) => Math.max(m, p.order), -1) + 1;
    await db.webDesignProjects.put(copy);
    return copy;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const db = getDb();
    await db.transaction("rw", db.webDesignProjects, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const project = await db.webDesignProjects.get(id);
        if (project) {
          await db.webDesignProjects.put({
            ...project,
            order: i,
            updatedAt: nowIso(),
          });
        }
      }
    });
  }
}

function emptyDefaults(
  project: Omit<WebDesignProject, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): Omit<WebDesignProject, "id" | "createdAt" | "updatedAt"> {
  return {
    service: "web-design",
    slug: project.slug,
    title: project.title,
    serviceLabel: project.serviceLabel || "Web Design",
    projectNumber: project.projectNumber,
    client: project.client,
    industry: project.industry,
    year: project.year,
    services: project.services ?? [],
    descriptionTitle: project.descriptionTitle || "Description",
    description: project.description ?? "",
    websiteUrl: project.websiteUrl,
    status: project.status ?? "draft",
    order: project.order ?? 0,
    featured: project.featured ?? false,
    coverMediaId: project.coverMediaId,
    coverImageUrl: project.coverImageUrl,
    appearance: project.appearance ?? defaultWebDesignAppearance(),
    featuredVisual: {
      ...defaultFeaturedVisual(),
      ...project.featuredVisual,
    },
    gallery: project.gallery ?? [],
    seo: project.seo ?? {},
  };
}
