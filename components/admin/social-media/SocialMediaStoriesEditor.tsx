"use client";

import { useState } from "react";
import type { SocialMediaStory } from "@/types/social-media";
import { AdminUploadDropzone } from "@/components/admin/AdminUploadDropzone";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadSocialMediaAsset } from "@/lib/social-media/media";
import { createId } from "@/lib/utils/id";
import { Trash2 } from "lucide-react";

function previewUrl(asset: { id: string; publicUrl?: string }) {
  return asset.publicUrl || `/api/media/${encodeURIComponent(asset.id)}`;
}

export function SocialMediaStoriesEditor({
  stories,
  onChange,
}: {
  stories: SocialMediaStory[] | undefined;
  onChange: (next: SocialMediaStory[]) => void;
}) {
  const ordered = [...(stories ?? [])].sort((a, b) => a.order - b.order);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const next = [...ordered];
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadSocialMediaAsset(file);
        next.push({
          id: createId(),
          mediaId: asset.id,
          imageUrl: previewUrl(asset),
          alt: file.name,
          title: `Story ${next.length + 1}`,
          order: next.length,
        });
      }
      onChange(next.map((s, i) => ({ ...s, order: i })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ngarkimi i story dështoi");
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string) {
    onChange(
      ordered.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })),
    );
  }

  function reorder(ids: string[]) {
    const map = new Map(ordered.map((s) => [s.id, s]));
    onChange(ids.map((id, i) => ({ ...map.get(id)!, order: i })));
  }

  function update(id: string, patch: Partial<SocialMediaStory>) {
    onChange(ordered.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Stories</h3>
          <p className="text-xs text-muted">
            9:16 · JPG/PNG/WebP · zgjidh disa skedarë njëherësh · zvarris me ≡
          </p>
        </div>
        <AdminUploadDropzone
          variant="button"
          label="Ngarko stories"
          multiple
          busy={busy}
          form=""
          onFiles={(files) => void upload(files)}
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      <SortableList ids={ordered.map((s) => s.id)} onReorder={reorder} strategy="grid">
        <div className="flex flex-wrap gap-3">
          <AdminUploadDropzone
            label="Shto story"
            hint="9:16"
            multiple
            busy={busy}
            form=""
            className="w-28 aspect-[9/16] min-h-0"
            onFiles={(files) => void upload(files)}
          />
          {ordered.map((story) => (
            <SortableItem key={story.id} id={story.id} className="w-28">
              <div className="overflow-hidden rounded-xl border border-border bg-surface/40">
                <div className="relative aspect-[9/16] bg-surface-elevated">
                  <MediaImage
                    mediaId={story.mediaId}
                    imageUrl={story.imageUrl}
                    alt={story.alt}
                    fit="cover"
                  />
                </div>
                <div className="space-y-1 p-2">
                  <input
                    value={story.title ?? ""}
                    onChange={(e) => update(story.id, { title: e.target.value })}
                    placeholder="Title"
                    className="w-full rounded border border-border bg-background px-1 py-1 text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={() => remove(story.id)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded border border-red-500/30 py-1 text-[10px] text-red-400"
                  >
                    <Trash2 size={10} />
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
