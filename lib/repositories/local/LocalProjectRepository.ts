import type { BrandingProject, Project } from "@/types/branding";
import type { ProjectRepository } from "@/lib/repositories/types";
import { createSeedProjects } from "@/lib/data/seed";
import { createId, nowIso, slugify, sortByOrder } from "@/lib/utils/id";
import { getDb } from "./db";

export class LocalProjectRepository implements ProjectRepository {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    const count = await db.projects.count();
    if (count > 0) return;
    const seeds = createSeedProjects();
    await db.projects.bulkPut(seeds);
  }

  async list(options?: { service?: string; includeDrafts?: boolean }): Promise<Project[]> {
    await this.ensureSeeded();
    const db = getDb();
    let items = await db.projects.toArray();
    if (options?.service) {
      items = items.filter((p) => p.service === options.service);
    }
    if (!options?.includeDrafts) {
      items = items.filter((p) => p.status === "published");
    }
    return sortByOrder(items);
  }

  async getById(id: string): Promise<Project | null> {
    await this.ensureSeeded();
    const db = getDb();
    return (await db.projects.get(id)) ?? null;
  }

  async getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<Project | null> {
    await this.ensureSeeded();
    const db = getDb();
    const project = await db.projects.where("slug").equals(slug).first();
    if (!project) return null;
    if (!options?.includeDrafts && project.status !== "published") return null;
    return project;
  }

  async create(
    project: Omit<BrandingProject, "id" | "createdAt" | "updatedAt"> & { id?: string },
  ): Promise<Project> {
    const db = getDb();
    const stamp = nowIso();
    const all = await db.projects.toArray();
    const maxOrder = all.reduce((m, p) => Math.max(m, p.order), -1);
    const record: BrandingProject = {
      ...project,
      id: project.id ?? createId(),
      slug: project.slug || slugify(project.title),
      order: project.order ?? maxOrder + 1,
      brandColors: project.brandColors ?? [],
      typography: project.typography ?? [],
      sections: project.sections ?? [],
      gallery: project.gallery ?? [],
      services: project.services ?? [],
      createdAt: stamp,
      updatedAt: stamp,
    };
    await db.projects.put(record);
    return record;
  }

  async update(id: string, patch: Partial<BrandingProject>): Promise<Project> {
    const db = getDb();
    const existing = await db.projects.get(id);
    if (!existing) throw new Error(`Project not found: ${id}`);
    const next: BrandingProject = {
      ...existing,
      ...patch,
      id: existing.id,
      service: "branding",
      updatedAt: nowIso(),
    };
    await db.projects.put(next);
    return next;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.projects.delete(id);
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
    };
    const db = getDb();
    const all = await db.projects.toArray();
    copy.order = all.reduce((m, p) => Math.max(m, p.order), -1) + 1;
    await db.projects.put(copy);
    return copy;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const db = getDb();
    await db.transaction("rw", db.projects, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const project = await db.projects.get(id);
        if (project) {
          await db.projects.put({ ...project, order: i, updatedAt: nowIso() });
        }
      }
    });
  }
}
