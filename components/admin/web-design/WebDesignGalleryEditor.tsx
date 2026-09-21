"use client";

import { useState } from "react";
import type {
  WebDesignGalleryDisplayType,
  WebDesignGalleryItem,
} from "@/types/web-design";
import { WEB_DESIGN_GALLERY_FRAMES } from "@/types/web-design";
import { AdminUploadDropzone } from "@/components/admin/AdminUploadDropzone";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadWebDesignAsset } from "@/lib/web-design/media";
import { createId } from "@/lib/utils/id";
import { Trash2 } from "lucide-react";

function galleryType(value: string): WebDesignGalleryDisplayType {
  return value === "mobile" ? "mobile" : "desktop";
}

function previewUrl(asset: { id: string; publicUrl?: string }) {
  return asset.publicUrl || `/api/media/${encodeURIComponent(asset.id)}`;
}

export function WebDesignGalleryEditor({
  items,
  onChange,
}: {
  items: WebDesignGalleryItem[];
  onChange: (next: WebDesignGalleryItem[]) => void;
}) {
  const ordered = [...items].sort((a, b) => a.order - b.order);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const next = [...ordered];
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadWebDesignAsset(file);
        next.push({
          id: createId(),
          mediaId: asset.id,
          imageUrl: previewUrl(asset),
          alt: file.name,
          order: next.length,
          displayType: "desktop",
        });
      }
      onChange(next.map((item, i) => ({ ...item, order: i })));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Screenshot upload failed",
      );
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string) {
    onChange(
      ordered.filter((item) => item.id !== id).map((item, i) => ({ ...item, order: i })),
    );
  }

  function reorder(ids: string[]) {
    const map = new Map(ordered.map((item) => [item.id, item]));
    onChange(ids.map((id, i) => ({ ...map.get(id)!, order: i })));
  }

  function update(id: string, patch: Partial<WebDesignGalleryItem>) {
    onChange(ordered.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Additional screenshots</h3>
          <p className="text-xs text-muted">
            Drag to reorder · JPG/PNG/WebP · large files compress automatically
          </p>
        </div>
        <AdminUploadDropzone
          variant="button"
          label="Upload photos"
          multiple
          busy={busy}
          form=""
          onFiles={(files) => void upload(files)}
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}

      <SortableList
        ids={ordered.map((item) => item.id)}
        onReorder={reorder}
        strategy="grid"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ordered.map((item) => {
            const type = galleryType(item.displayType);
            const frame = WEB_DESIGN_GALLERY_FRAMES[type];
            return (
              <SortableItem key={item.id} id={item.id}>
                <div className="overflow-hidden rounded-xl border border-border bg-surface/40">
                  <div className="relative aspect-[16/10] bg-surface-elevated">
                    <MediaImage
                      mediaId={item.mediaId}
                      imageUrl={item.imageUrl}
                      alt={item.alt}
                      fit="cover"
                    />
                  </div>
                  <div className="space-y-2 p-2.5">
                    <input
                      value={item.alt}
                      onChange={(e) => update(item.id, { alt: e.target.value })}
                      placeholder="Name"
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                    />
                    <select
                      value={type}
                      onChange={(e) =>
                        update(item.id, {
                          displayType: galleryType(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    >
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                    </select>
                    <p className="text-[11px] text-muted">
                      {frame.width} × {frame.height} px · {frame.ratioLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-2.5 py-1 text-[11px] text-red-400"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableList>
    </div>
  );
}
