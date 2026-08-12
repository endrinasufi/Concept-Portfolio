import type { PhotoshootingProject } from "@/types/photoshooting";
import type { PhotoshootingRepository } from "@/lib/repositories/photoshooting-types";
import { createSeedPhotoshootingProjects } from "@/lib/photoshooting/seed";
import { createId, nowIso, slugify } from "@/lib/utils/id";
import { getDb } from "./db";

export class LocalPhotoshootingRepository implements PhotoshootingRepository {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    const count = await db.photoshooting.count();
    if (count > 0) return;
    await db.photoshooting.bulkPut(createSeedPhotoshootingProjects());
  }

  async list(options?: {
    includeDrafts?: boolean;
  }): Promise<PhotoshootingProject[]> {
    await this.ensureSeeded();
    let items = await getDb().photoshooting.orderBy("order").toArray();
    if (!options?.includeDrafts) {
      items = items.filter((p) => p.status === "published");
    }
    return items;
  }

  async getBySlug(slug: string): Promise<PhotoshootingProject | null> {
    await this.ensureSeeded();
    return (
      (await getDb().photoshooting.where("slug").equals(slug).first()) ?? null
    );
  }

  async getById(id: string): Promise<PhotoshootingProject | null> {
    await this.ensureSeeded();
    return (await getDb().photoshooting.get(id)) ?? null;
  }

  async create(
    item: Omit<PhotoshootingProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<PhotoshootingProject> {
    const db = getDb();
    const existing = await db.photoshooting.orderBy("order").toArray();
    const now = nowIso();
    const row: PhotoshootingProject = {
      ...item,
      id: item.id ?? createId(),
      slug: item.slug || slugify(item.title),
      order: item.order ?? existing.length,
      cells: item.cells ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await db.photoshooting.put(row);
    return row;
  }

  async update(
    id: string,
    patch: Partial<PhotoshootingProject>,
  ): Promise<PhotoshootingProject> {
    const db = getDb();
    const current = await db.photoshooting.get(id);
    if (!current) throw new Error("Projekti nuk u gjet");
    const next: PhotoshootingProject = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    };
    await db.photoshooting.put(next);
    return next;
  }

  async delete(id: string): Promise<void> {
    await getDb().photoshooting.delete(id);
  }
}
