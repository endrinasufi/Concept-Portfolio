"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVideoProduction } from "@/lib/hooks/useVideoProduction";
import { getVideoProductionRepository } from "@/lib/repositories";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { youtubeThumbnailUrl } from "@/lib/video-production/youtube";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

export function VideoProductionList() {
  const { videos, loading, refresh } = useVideoProduction({ includeDrafts: true });
  const { confirm, dialog } = useConfirm();
  const router = useRouter();

  async function onReorder(ids: string[]) {
    await getVideoProductionRepository().reorder(ids);
    await refresh();
  }

  async function toggleStatus(id: string, status: "draft" | "published") {
    await getVideoProductionRepository().update(id, {
      status: status === "published" ? "draft" : "published",
    });
    await refresh();
  }

  async function remove(id: string, title: string) {
    const ok = await confirm(
      "Delete video?",
      `“${title}” will be permanently deleted from IndexedDB (Video Production).`,
    );
    if (!ok) return;
    await getVideoProductionRepository().delete(id);
    await refresh();
  }

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      {dialog}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Video Production</h1>
          <p className="mt-1 text-sm text-muted">
            Social Media videos (reels) and Production (landscape).
          </p>
        </div>
        <Link
          href="/admin/video-production/new"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <Plus size={16} /> New video
        </Link>
      </div>

      <SortableList
        ids={videos.map((v) => v.id)}
        onReorder={(ids) => void onReorder(ids)}
      >
        <div className="space-y-3">
          {videos.map((video) => (
            <SortableItem key={video.id} id={video.id} className="pl-9">
              <div className="flex flex-col gap-4 admin-card p-3 sm:flex-row sm:items-center">
                <div
                  className={`relative shrink-0 overflow-hidden rounded-lg bg-surface-elevated ${
                    video.orientation === "portrait"
                      ? "h-28 w-16"
                      : "h-20 w-32"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={youtubeThumbnailUrl(video.youtubeId, "mq")}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl">{video.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        video.status === "published"
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-[#FDD85D] text-[#1a1a1a]"
                      }`}
                    >
                      {video.status}
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: video.accentColor }}
                      title={video.accentColor}
                    />
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {video.clientName} ·{" "}
                    {video.orientation === "portrait"
                      ? "Social Media"
                      : "Production"}{" "}
                    · {video.youtubeId}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleStatus(video.id, video.status)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    {video.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    <ExternalLink size={12} /> YouTube
                  </a>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/video-production/${video.id}`)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(video.id, video.title)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-red-300/80 hover:text-red-200"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>
    </div>
  );
}
