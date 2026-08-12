import type { SocialMediaProject } from "@/types/social-media";
import {
  defaultBlock2,
  defaultPageAppearance,
} from "@/types/social-media";
import type { SocialMediaProjectRepository } from "@/lib/repositories/social-media-types";
import { createSeedSocialMediaProjects } from "@/lib/social-media/seed";
import { createId, nowIso, slugify, sortByOrder } from "@/lib/utils/id";
import { getDb } from "./db";

function isNewSchema(project: SocialMediaProject | Record<string, unknown>): boolean {
  if (!project || typeof project !== "object") return false;
  if (!("block1" in project) || !("usernames" in project)) return false;
  const p = project as SocialMediaProject;
  const appearance = p.pageAppearance;
  if (!appearance || !("backgroundColor" in appearance)) return false;
  if (!Array.isArray(p.block1?.feedPosts) || p.block1.feedPosts.length === 0) return false;
  return true;
}

function normalizeProject(raw: SocialMediaProject): SocialMediaProject {
  const legacy = raw as SocialMediaProject & {
    feedPosts?: SocialMediaProject["block1"]["feedPosts"];
  };
  const feedPosts =
    raw.block1?.feedPosts ??
    legacy.feedPosts ??
    [];
  return {
    ...raw,
    usernames: raw.usernames ?? [],
    pageAppearance: raw.pageAppearance ?? defaultPageAppearance(),
    block1: {
      ...raw.block1,
      feedPosts,
    },
    block2: raw.block2 ?? defaultBlock2(),
    block3: raw.block3 ?? { stories: [] },
  };
}

function remapNested(project: SocialMediaProject): SocialMediaProject {
  return {
    ...project,
    usernames: project.usernames.map((u) => ({ ...u, id: createId() })),
    block1: {
      ...project.block1,
      feedPosts: project.block1.feedPosts.map((p) => ({ ...p, id: createId() })),
    },
    block2: {
      ...project.block2,
      reels: project.block2.reels.map((r) => ({ ...r, id: createId() })),
    },
    block3: {
      stories: project.block3.stories.map((s) => ({ ...s, id: createId() })),
    },
  };
}

export class LocalSocialMediaProjectRepository implements SocialMediaProjectRepository {
  async ensureSeeded(): Promise<void> {
    const db = getDb();
    const existing = await db.socialMediaProjects.toArray();
    const needsReseed =
      existing.length === 0 || existing.some((p) => !isNewSchema(p));
    if (!needsReseed) return;
    await db.socialMediaProjects.clear();
    await db.socialMediaProjects.bulkPut(createSeedSocialMediaProjects());
  }

  async list(options?: { includeDrafts?: boolean }): Promise<SocialMediaProject[]> {
    await this.ensureSeeded();
    const db = getDb();
    let items = await db.socialMediaProjects.toArray();
    if (!options?.includeDrafts) {
      items = items.filter((p) => p.status === "published");
    }
    return sortByOrder(items.map(normalizeProject));
  }

  async getById(id: string): Promise<SocialMediaProject | null> {
    await this.ensureSeeded();
    const db = getDb();
    const project = await db.socialMediaProjects.get(id);
    return project ? normalizeProject(project) : null;
  }

  async getBySlug(
    slug: string,
    options?: { includeDrafts?: boolean },
  ): Promise<SocialMediaProject | null> {
    await this.ensureSeeded();
    const db = getDb();
    const project = await db.socialMediaProjects.where("slug").equals(slug).first();
    if (!project) return null;
    if (!options?.includeDrafts && project.status !== "published") return null;
    return normalizeProject(project);
  }

  async create(
    project: Omit<SocialMediaProject, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ): Promise<SocialMediaProject> {
    const db = getDb();
    const stamp = nowIso();
    const all = await db.socialMediaProjects.toArray();
    const maxOrder = all.reduce((m, p) => Math.max(m, p.order), -1);
    const record: SocialMediaProject = {
      ...project,
      id: project.id ?? createId(),
      service: "social-media",
      slug: project.slug || slugify(project.title || project.clientName),
      order: project.order ?? maxOrder + 1,
      usernames: project.usernames ?? [],
      pageAppearance: project.pageAppearance ?? defaultPageAppearance(),
      block1: project.block1 ?? { feedPosts: [] },
      block2: project.block2 ?? defaultBlock2(),
      block3: project.block3 ?? { stories: [] },
      seo: project.seo ?? {},
      createdAt: stamp,
      updatedAt: stamp,
    };
    await db.socialMediaProjects.put(record);
    return record;
  }

  async update(
    id: string,
    patch: Partial<SocialMediaProject>,
  ): Promise<SocialMediaProject> {
    const db = getDb();
    const existing = await db.socialMediaProjects.get(id);
    if (!existing) throw new Error(`Social media project not found: ${id}`);
    const next: SocialMediaProject = {
      ...existing,
      ...patch,
      id: existing.id,
      service: "social-media",
      block1: patch.block1 ?? existing.block1,
      block2: patch.block2 ?? existing.block2,
      block3: patch.block3 ?? existing.block3,
      pageAppearance: patch.pageAppearance ?? existing.pageAppearance,
      updatedAt: nowIso(),
    };
    await db.socialMediaProjects.put(next);
    return next;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.socialMediaProjects.delete(id);
  }

  async duplicate(id: string): Promise<SocialMediaProject> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Social media project not found: ${id}`);
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
    const all = await db.socialMediaProjects.toArray();
    copy.order = all.reduce((m, p) => Math.max(m, p.order), -1) + 1;
    await db.socialMediaProjects.put(copy);
    return copy;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const db = getDb();
    await db.transaction("rw", db.socialMediaProjects, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const project = await db.socialMediaProjects.get(id);
        if (project) {
          await db.socialMediaProjects.put({
            ...project,
            order: i,
            updatedAt: nowIso(),
          });
        }
      }
    });
  }
}
