"use client";

import type { GalleryColumns, GalleryItem, GalleryRow } from "@/types/branding";
import { createId, sortByOrder } from "@/lib/utils/id";
import {
  GALLERY_COLUMN_OPTIONS,
  GALLERY_PREVIEW_GAP_CLASS,
  clampColumns,
  flattenGalleryRows,
  gridColsClass,
} from "@/lib/utils/galleryRows";
import { SortableList, SortableItem } from "./SortableList";
import { ChevronLeft, ChevronRight, ImagePlus, Plus, Trash2 } from "lucide-react";
import { uploadMedia } from "@/lib/media";
import { MediaImage } from "@/components/branding/MediaImage";

function emptyRow(order: number, columns: GalleryColumns = 2): GalleryRow {
  return {
    id: createId(),
    order,
    columns,
    items: [],
  };
}

export function GalleryManager({
  rows,
  onChange,
}: {
  rows: GalleryRow[];
  onChange: (rows: GalleryRow[]) => void;
}) {
  const sorted = sortByOrder(rows);

  function commit(next: GalleryRow[]) {
    const normalized = next.map((row, i) => ({
      ...row,
      order: i,
      columns: clampColumns(row.columns),
      items: sortByOrder(row.items)
        .slice(0, clampColumns(row.columns))
        .map((item, j) => ({ ...item, order: j })),
    }));
    onChange(normalized);
  }

  function addRow() {
    commit([...sorted, emptyRow(sorted.length)]);
  }

  function removeRow(id: string) {
    commit(sorted.filter((r) => r.id !== id));
  }

  function setColumns(id: string, columns: GalleryColumns) {
    commit(
      sorted.map((row) =>
        row.id === id
          ? {
              ...row,
              columns,
              items: sortByOrder(row.items).slice(0, columns),
            }
          : row,
      ),
    );
  }

  function reorderRows(ids: string[]) {
    commit(ids.map((id) => sorted.find((r) => r.id === id)!).filter(Boolean));
  }

  async function addPhoto(rowId: string, file: File | undefined) {
    if (!file) return;
    const row = sorted.find((r) => r.id === rowId);
    if (!row) return;
    if (row.items.length >= row.columns) return;

    const asset = await uploadMedia(file);
    const item: GalleryItem = {
      id: createId(),
      mediaId: asset.id,
      order: row.items.length,
    };
    commit(
      sorted.map((r) =>
        r.id === rowId ? { ...r, items: [...sortByOrder(r.items), item] } : r,
      ),
    );
  }

  function removePhoto(rowId: string, itemId: string) {
    commit(
      sorted.map((r) =>
        r.id === rowId
          ? {
              ...r,
              items: sortByOrder(r.items)
                .filter((i) => i.id !== itemId)
                .map((i, order) => ({ ...i, order })),
            }
          : r,
      ),
    );
  }

  function movePhoto(rowId: string, itemId: string, dir: -1 | 1) {
    commit(
      sorted.map((r) => {
        if (r.id !== rowId) return r;
        const items = sortByOrder(r.items);
        const idx = items.findIndex((i) => i.id === itemId);
        const next = idx + dir;
        if (idx < 0 || next < 0 || next >= items.length) return r;
        const copy = [...items];
        const [moved] = copy.splice(idx, 1);
        copy.splice(next, 0, moved);
        return {
          ...r,
          items: copy.map((item, order) => ({ ...item, order })),
        };
      }),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Galeria</h3>
          <p className="mt-0.5 text-[11px] text-muted">
            Shto rreshta, zgjidh 1–4 foto për rresht, rirendit dhe shiko preview.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface"
        >
          <Plus size={12} /> Shto rresht
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)] lg:items-start">
        <div className="min-w-0 space-y-4">
          {!sorted.length ? (
            <p className="text-xs text-muted">Nuk ka rreshta. Shto një rresht për të filluar.</p>
          ) : null}

          <SortableList ids={sorted.map((r) => r.id)} onReorder={reorderRows}>
            <div className="space-y-4">
              {sorted.map((row) => {
                const items = sortByOrder(row.items);
                const emptySlots = Math.max(0, row.columns - items.length);

                return (
                  <SortableItem key={row.id} id={row.id} className="pl-8">
                    <div className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                            Rreshti {row.order + 1}
                          </span>
                          <div className="flex overflow-hidden rounded-full border border-border">
                            {GALLERY_COLUMN_OPTIONS.map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setColumns(row.id, n)}
                                className={`px-2.5 py-1 text-xs tabular-nums transition ${
                                  row.columns === n
                                    ? "bg-foreground text-background"
                                    : "text-muted hover:bg-surface"
                                }`}
                                title={`${n} foto në rresht`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="rounded p-1.5 text-muted hover:bg-surface hover:text-foreground"
                          aria-label="Fshi rreshtin"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className={`grid gap-2 ${gridColsClass(row.columns)}`}>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface"
                          >
                            <MediaImage
                              mediaId={item.mediaId}
                              alt="Gallery"
                              fit="cover"
                              className="h-full w-full"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                              <div className="flex gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => movePhoto(row.id, item.id, -1)}
                                  className="rounded bg-white/15 p-1 text-white hover:bg-white/25"
                                  aria-label="Majtas"
                                >
                                  <ChevronLeft size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => movePhoto(row.id, item.id, 1)}
                                  className="rounded bg-white/15 p-1 text-white hover:bg-white/25"
                                  aria-label="Djathtas"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePhoto(row.id, item.id)}
                                className="rounded bg-white/15 p-1 text-white hover:bg-white/25"
                                aria-label="Fshi"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {Array.from({ length: emptySlots }).map((_, i) => (
                          <label
                            key={`empty-${row.id}-${i}`}
                            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface/40 text-muted transition hover:border-foreground/30 hover:text-foreground/70"
                          >
                            <ImagePlus size={18} />
                            <span className="text-[10px]">Ngarko</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                void addPhoto(row.id, e.target.files?.[0]);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableList>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6">
          <div className="rounded-xl border border-border/80 bg-surface/30 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">
              Preview
            </p>
            {sorted.some((r) => r.items.length > 0) ? (
              <>
                <div className={`origin-top scale-[0.92] sm:scale-100 flex flex-col ${GALLERY_PREVIEW_GAP_CLASS}`}>
                  {sorted.map((row) => {
                    const items = sortByOrder(row.items);
                    if (!items.length) return null;
                    return (
                      <div
                        key={`preview-${row.id}`}
                        className={`grid ${GALLERY_PREVIEW_GAP_CLASS} ${gridColsClass(row.columns)}`}
                      >
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface"
                          >
                            <MediaImage
                              mediaId={item.mediaId}
                              alt=""
                              fit="cover"
                              className="h-full w-full"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-muted">
                  {flattenGalleryRows(sorted).length} foto · {sorted.length} rreshta
                </p>
              </>
            ) : (
              <p className="py-6 text-center text-[11px] text-muted">
                Preview do të shfaqet kur ngarkon foto.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
