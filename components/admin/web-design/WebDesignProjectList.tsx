"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";
import { getWebDesignProjectRepository } from "@/lib/repositories";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { MediaImage } from "@/components/branding/MediaImage";
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

export function WebDesignProjectList() {
  const { projects, loading, refresh } = useWebDesignProjects({
    includeDrafts: true,
  });
  const { confirm, dialog } = useConfirm();
  const router = useRouter();

  async function onReorder(ids: string[]) {
    await getWebDesignProjectRepository().reorder(ids);
    await refresh();
  }

  async function toggleStatus(id: string, status: "draft" | "published") {
    await getWebDesignProjectRepository().update(id, {
      status: status === "published" ? "draft" : "published",
    });
    await refresh();
  }

  async function duplicate(id: string) {
    const copy = await getWebDesignProjectRepository().duplicate(id);
    await refresh();
    router.push(`/admin/web-design/${copy.id}`);
  }

  async function remove(id: string, title: string) {
    const ok = await confirm(
      "Delete project?",
      `“${title}” will be permanently deleted from IndexedDB (Web Design).`,
    );
    if (!ok) return;
    await getWebDesignProjectRepository().delete(id);
    await refresh();
  }

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      {dialog}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Web Design</h1>
          <p className="mt-1 text-sm text-muted">Drag to reorder.</p>
        </div>
        <Link
          href="/admin/web-design/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <Plus size={16} /> New project
        </Link>
      </div>

      <SortableList
        ids={projects.map((p) => p.id)}
        onReorder={(ids) => void onReorder(ids)}
      >
        <div className="space-y-3">
          {projects.map((project) => (
            <SortableItem key={project.id} id={project.id} className="pl-9">
              <div className="flex flex-col gap-4 admin-card p-3 sm:flex-row sm:items-center">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
                  <MediaImage
                    mediaId={
                      project.coverMediaId ??
                      project.featuredVisual.desktopMediaId
                    }
                    imageUrl={
                      project.coverImageUrl ??
                      project.featuredVisual.desktopImageUrl ??
                      project.featuredVisual.backgroundImageUrl
                    }
                    alt=""
                    fit="cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl">{project.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        project.status === "published"
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-[#FDD85D] text-[#1a1a1a]"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {project.client || "—"} · /{project.slug}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {project.gallery.length} screenshots
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/admin/web-design/${project.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <Link
                    href={`/web-design/${project.slug}?preview=true`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                  >
                    <ExternalLink size={12} /> Preview
                  </Link>
                  <button
                    type="button"
                    onClick={() => void toggleStatus(project.id, project.status)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                  >
                    {project.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void duplicate(project.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(project.id, project.title)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>

      {!projects.length ? (
        <p className="text-muted">No projects yet. Create one.</p>
      ) : null}
    </div>
  );
}
