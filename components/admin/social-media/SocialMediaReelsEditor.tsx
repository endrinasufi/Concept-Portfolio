"use client";

import type { SocialMediaReel } from "@/types/social-media";
import { AdminUploadDropzone } from "@/components/admin/AdminUploadDropzone";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadSocialMediaAsset } from "@/lib/social-media/media";
import { extractVideoFrame } from "@/lib/social-media/video-frame";
import {
  extractYoutubeId,
  isYoutubeThumbnailUrl,
  youtubePosterFromUrl,
  youtubeReelThumbProps,
} from "@/lib/video-production/youtube";
import { createId } from "@/lib/utils/id";
import { Plus, Trash2 } from "lucide-react";

export function SocialMediaReelsEditor({
  reels,
  onChange,
}: {
  reels: SocialMediaReel[];
  onChange: (next: SocialMediaReel[]) => void;
}) {
  const ordered = [...reels].sort((a, b) => a.order - b.order);

  async function addReel() {
    onChange([
      ...ordered,
      {
        id: createId(),
        title: `Reel ${ordered.length + 1}`,
        order: ordered.length,
      },
    ]);
  }

  async function uploadThumb(id: string, file: File | undefined) {
    if (!file) return;
    const asset = await uploadSocialMediaAsset(file);
    onChange(
      ordered.map((r) =>
        r.id === id
          ? { ...r, thumbnailMediaId: asset.id, thumbnailUrl: undefined }
          : r,
      ),
    );
  }

  async function uploadVideo(id: string, file: File | undefined) {
    if (!file) return;
    const asset = await uploadSocialMediaAsset(file);
    const current = ordered.find((r) => r.id === id);
    const needsThumb = !current?.thumbnailMediaId && !current?.thumbnailUrl;

    let thumbnailMediaId = current?.thumbnailMediaId;
    if (needsThumb) {
      try {
        const frame = await extractVideoFrame(file);
        const thumb = await uploadSocialMediaAsset(frame, {
          width: undefined,
          height: undefined,
        });
        thumbnailMediaId = thumb.id;
      } catch {
        // Thumbnail opsionale — video mbetet e vlefshme edhe pa frame
      }
    }

    onChange(
      ordered.map((r) =>
        r.id === id
          ? {
              ...r,
              videoMediaId: asset.id,
              videoUrl: undefined,
              ...(needsThumb && thumbnailMediaId
                ? { thumbnailMediaId, thumbnailUrl: undefined }
                : {}),
            }
          : r,
      ),
    );
  }

  function remove(id: string) {
    onChange(
      ordered.filter((r) => r.id !== id).map((r, i) => ({ ...r, order: i })),
    );
  }

  function reorder(ids: string[]) {
    const map = new Map(ordered.map((r) => [r.id, r]));
    onChange(ids.map((id, i) => ({ ...map.get(id)!, order: i })));
  }

  function update(id: string, patch: Partial<SocialMediaReel>) {
    onChange(ordered.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function setVideoUrl(id: string, raw: string) {
    const current = ordered.find((r) => r.id === id);
    const ytId = extractYoutubeId(raw);
    const keepUploaded = Boolean(current?.thumbnailMediaId);
    onChange(
      ordered.map((r) => {
        if (r.id !== id) return r;
        const next: SocialMediaReel = {
          ...r,
          videoUrl: raw.trim() || undefined,
        };
        if (!keepUploaded) {
          if (ytId) {
            next.thumbnailUrl = youtubePosterFromUrl(raw);
          } else if (isYoutubeThumbnailUrl(r.thumbnailUrl)) {
            next.thumbnailUrl = undefined;
          }
        }
        return next;
      }),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Reels</h3>
          <p className="text-xs text-muted">
            Drag to reorder · auto thumbnail from video or YouTube
          </p>
        </div>
        <button
          type="button"
          onClick={() => void addReel()}
          className="admin-upload-btn"
        >
          <Plus size={12} /> Add reel
        </button>
      </div>

      <SortableList ids={ordered.map((r) => r.id)} onReorder={reorder}>
        <div className="space-y-3">
          {ordered.map((reel) => (
            <SortableItem key={reel.id} id={reel.id}>
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-3 pl-9 sm:flex-row">
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
                  <MediaImage
                    mediaId={reel.thumbnailMediaId}
                    {...youtubeReelThumbProps(reel)}
                    alt={reel.title ?? ""}
                    fit="cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={reel.title ?? ""}
                    onChange={(e) => update(reel.id, { title: e.target.value })}
                    placeholder="Title"
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <AdminUploadDropzone
                      label="Thumbnail"
                      hint="optional"
                      className="min-h-[5.5rem] py-3"
                      onFiles={(files) =>
                        void uploadThumb(reel.id, files?.[0])
                      }
                    />
                    <AdminUploadDropzone
                      label="Video file"
                      hint="mp4 / webm"
                      accept="video/*"
                      className="min-h-[5.5rem] py-3"
                      onFiles={(files) =>
                        void uploadVideo(reel.id, files?.[0])
                      }
                    />
                  </div>
                  <input
                    value={reel.videoUrl ?? ""}
                    onChange={(e) => setVideoUrl(reel.id, e.target.value)}
                    placeholder="or Video URL / YouTube (watch, shorts, youtu.be)"
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-xs"
                  />
                  {extractYoutubeId(reel.videoUrl ?? "") ? (
                    <p className="text-[10px] text-muted">
                      YouTube · thumbnail is taken automatically from the link
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remove(reel.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400"
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
