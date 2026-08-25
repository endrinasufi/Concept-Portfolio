"use client";

import type { SocialMediaFeedPost } from "@/types/social-media";
import { AdminUploadDropzone } from "@/components/admin/AdminUploadDropzone";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadSocialMediaAsset } from "@/lib/social-media/media";
import { createId } from "@/lib/utils/id";
import { Trash2 } from "lucide-react";

export function SocialMediaFeedEditor({
  posts,
  onChange,
}: {
  posts: SocialMediaFeedPost[];
  onChange: (next: SocialMediaFeedPost[]) => void;
}) {
  const ordered = [...posts].sort((a, b) => a.order - b.order);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const next = [...ordered];
    for (const file of Array.from(files)) {
      const asset = await uploadSocialMediaAsset(file);
      next.push({
        id: createId(),
        mediaId: asset.id,
        alt: file.name,
        order: next.length,
        objectPosition: "50% 50%",
      });
    }
    onChange(next.map((p, i) => ({ ...p, order: i })));
  }

  function remove(id: string) {
    onChange(
      ordered.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })),
    );
  }

  function reorder(ids: string[]) {
    const map = new Map(ordered.map((p) => [p.id, p]));
    onChange(ids.map((id, i) => ({ ...map.get(id)!, order: i })));
  }

  function update(id: string, patch: Partial<SocialMediaFeedPost>) {
    onChange(ordered.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Feed posts</h3>
          <p className="text-xs text-muted">
            4:5 · 9 per row · drag with the ≡ icon
          </p>
        </div>
        <AdminUploadDropzone
          variant="button"
          label="Upload photos"
          multiple
          onFiles={(files) => void upload(files)}
        />
      </div>

      <SortableList
        ids={ordered.map((p) => p.id)}
        onReorder={reorder}
        strategy="grid"
      >
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-9">
          {ordered.map((post) => (
            <SortableItem key={post.id} id={post.id} compact>
              <div className="overflow-hidden rounded-md border border-border bg-surface/40">
                <div className="relative aspect-[4/5] bg-surface-elevated">
                  <MediaImage
                    mediaId={post.mediaId}
                    imageUrl={post.imageUrl}
                    alt={post.alt}
                    fit="cover"
                    objectPosition={post.objectPosition}
                  />
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    className="absolute right-0.5 top-0.5 inline-flex rounded border border-red-500/40 bg-background/90 p-0.5 text-red-400 hover:bg-red-500/15"
                    aria-label="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
                <input
                  value={post.caption ?? ""}
                  onChange={(e) => update(post.id, { caption: e.target.value })}
                  placeholder="Caption"
                  className="w-full border-t border-border bg-background px-1 py-0.5 text-[10px] leading-tight"
                />
              </div>
            </SortableItem>
          ))}
          <AdminUploadDropzone
            label="Add"
            hint="JPG / PNG"
            multiple
            className="aspect-[4/5] min-h-0 px-1 py-2 text-[10px]"
            onFiles={(files) => void upload(files)}
          />
        </div>
      </SortableList>
    </div>
  );
}
