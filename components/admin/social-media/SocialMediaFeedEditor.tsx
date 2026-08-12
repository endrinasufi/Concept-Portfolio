"use client";

import type { SocialMediaFeedPost } from "@/types/social-media";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadSocialMediaAsset } from "@/lib/social-media/media";
import { createId } from "@/lib/utils/id";
import { Plus, Trash2 } from "lucide-react";

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
            4:5 portrait · zvarris me ikonën ≡ për të rirenditur
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated">
          <Plus size={12} /> Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
      </div>

      <SortableList
        ids={ordered.map((p) => p.id)}
        onReorder={reorder}
        strategy="grid"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {ordered.map((post) => (
            <SortableItem key={post.id} id={post.id}>
              <div className="overflow-hidden rounded-xl border border-border bg-surface/40">
                <div className="relative aspect-[4/5] bg-surface-elevated">
                  <MediaImage
                    mediaId={post.mediaId}
                    imageUrl={post.imageUrl}
                    alt={post.alt}
                    fit="cover"
                    objectPosition={post.objectPosition}
                  />
                </div>
                <div className="space-y-2 p-2">
                  <input
                    value={post.alt}
                    onChange={(e) => update(post.id, { alt: e.target.value })}
                    placeholder="Alt"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                  <input
                    value={post.caption ?? ""}
                    onChange={(e) => update(post.id, { caption: e.target.value })}
                    placeholder="Caption"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded border border-red-500/30 py-1 text-xs text-red-400"
                  >
                    <Trash2 size={11} /> Fshi
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
