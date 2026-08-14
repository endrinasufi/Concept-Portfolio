"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { getProjectRepository } from "@/lib/repositories";
import { SortableList, SortableItem } from "./SortableList";
import { useConfirm } from "./ConfirmDialog";
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { getProjectCover } from "@/lib/utils/projectCover";
import { MediaImage } from "@/components/branding/MediaImage";

export function BrandingProjectList() {
  const { projects, loading, refresh } = useProjects({
    service: "branding",
    includeDrafts: true,
  });
  const { confirm, dialog } = useConfirm();
  const router = useRouter();

  async function onReorder(ids: string[]) {
    await getProjectRepository().reorder(ids);
    await refresh();
  }

  async function toggleStatus(id: string, status: "draft" | "published") {
    await getProjectRepository().update(id, {
      status: status === "published" ? "draft" : "published",
    });
    await refresh();
  }

  async function duplicate(id: string) {
    const copy = await getProjectRepository().duplicate(id);
    await refresh();
    router.push(`/admin/branding/${copy.id}`);
  }

  async function remove(id: string, title: string) {
    const ok = await confirm(
      "Fshi projektin?",
      `“${title}” do të fshihet përgjithmonë nga IndexedDB.`,
    );
    if (!ok) return;
    await getProjectRepository().delete(id);
    await refresh();
  }

  if (loading) {
    return <p className="text-muted">Duke ngarkuar…</p>;
  }

  return (
    <div>
      {dialog}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Branding</h1>
          <p className="mt-1 text-sm text-muted">Zvarris për të ndryshuar renditjen.</p>
        </div>
        <Link
          href="/admin/branding/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <Plus size={16} /> Projekt i ri
        </Link>
      </div>

      <SortableList ids={projects.map((p) => p.id)} onReorder={(ids) => void onReorder(ids)}>
        <div className="space-y-3">
          {projects.map((project) => {
            const { coverUrl, coverMediaId } = getProjectCover(project);
            return (
              <SortableItem key={project.id} id={project.id} className="pl-9">
                <div className="flex flex-col gap-4 admin-card p-3 sm:flex-row sm:items-center">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
                    <MediaImage
                      mediaId={coverMediaId}
                      imageUrl={coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl truncate">{project.title}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                          project.status === "published"
                            ? "bg-[#1a1a1a] text-white"
                            : "bg-[#FDD85D] text-[#1a1a1a]"
                        }`}
                      >
                        {project.status}
                      </span>
                      {project.featured ? (
                        <span className="rounded-full bg-[#FDD85D] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#1a1a1a]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">
                      {project.client} · /{project.slug}
                    </p>
                    <div className="mt-2 flex gap-1">
                      {project.brandColors.map((c) => (
                        <span
                          key={c.id}
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/admin/branding/${project.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <Link
                      href={`/branding/${project.slug}?preview=true`}
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
                      {project.status === "published" ? "Bëj draft" : "Publiko"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void duplicate(project.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated"
                    >
                      <Copy size={12} /> Dupliko
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(project.id, project.title)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={12} /> Fshi
                    </button>
                  </div>
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableList>

      {!projects.length ? (
        <p className="text-muted">Nuk ka projekte. Krijo një të ri.</p>
      ) : null}
    </div>
  );
}
