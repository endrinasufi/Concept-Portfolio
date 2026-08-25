"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePhotoshootingProjects } from "@/lib/hooks/usePhotoshooting";
import { getPhotoshootingRepository } from "@/lib/repositories";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { PhotoshootingProject } from "@/types/photoshooting";

function CoverThumb({ project }: { project: PhotoshootingProject }) {
  const src = useResolvedSrc({
    mediaId: project.coverMediaId,
    imageUrl: project.coverImageUrl,
  });
  return (
    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

export function PhotoshootingList() {
  const { projects, loading, refresh } = usePhotoshootingProjects({
    includeDrafts: true,
  });
  const { confirm, dialog } = useConfirm();
  const router = useRouter();

  async function remove(id: string, title: string) {
    const ok = await confirm(
      "Delete project?",
      `“${title}” will be deleted from Photoshooting.`,
    );
    if (!ok) return;
    await getPhotoshootingRepository().delete(id);
    await refresh();
  }

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      {dialog}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Photoshooting</h1>
          <p className="mt-1 text-sm text-muted">
            Bento grid projects — photos only.
          </p>
        </div>
        <Link
          href="/admin/photoshooting/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <Plus size={16} /> New project
        </Link>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col gap-4 admin-card p-3 sm:flex-row sm:items-center"
          >
            <CoverThumb project={project} />
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
                {project.clientName} · {project.cells.length} cells · /
                {project.slug}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/photoshooting/${project.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => router.push(`/admin/photoshooting/${project.id}`)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => void remove(project.id, project.title)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-red-300/80 hover:text-red-200"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
