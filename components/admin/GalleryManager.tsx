"use client";

import type { GalleryItem } from "@/types/branding";
import { createId, sortByOrder } from "@/lib/utils/id";
import { SortableList, SortableItem } from "./SortableList";
import { Plus, Trash2 } from "lucide-react";
import { uploadMedia } from "@/lib/media";
import { MediaImage } from "@/components/branding/MediaImage";

export function GalleryManager({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const sorted = sortByOrder(items);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: GalleryItem[] = [];
    for (const file of Array.from(files)) {
      const asset = await uploadMedia(file);
      added.push({
        id: createId(),
        mediaId: asset.id,
        order: items.length + added.length,
      });
    }
    onChange([...items, ...added]);
  }

  function remove(id: string) {
    onChange(
      items.filter((g) => g.id !== id).map((g, i) => ({ ...g, order: i })),
    );
  }

  function reorder(ids: string[]) {
    onChange(
      ids.map((id, order) => {
        const g = items.find((x) => x.id === id)!;
        return { ...g, order };
      }),
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Galeria</h3>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
          <Plus size={12} /> Ngarko
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void addFiles(e.target.files)}
          />
        </label>
      </div>
      <SortableList ids={sorted.map((g) => g.id)} onReorder={reorder} strategy="grid">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((g) => (
            <SortableItem key={g.id} id={g.id} className="pl-0">
              <div className="group relative overflow-hidden rounded-lg border border-border">
                <div className="pointer-events-none absolute left-1 top-1 z-10 rounded bg-black/50 p-1 opacity-70">
                  <span className="sr-only">Drag</span>
                </div>
                <MediaImage
                  mediaId={g.mediaId}
                  alt="Gallery item"
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(g.id)}
                  className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>
      {!sorted.length ? (
        <p className="text-xs text-muted">Nuk ka imazhe në galeri.</p>
      ) : null}
    </div>
  );
}
