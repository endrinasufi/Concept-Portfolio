"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { MOSAIC_SLOTS, normalizeMosaicMediaIds } from "@/lib/branding/mosaicLayout";
import { uploadMedia } from "@/lib/media";
import { collectProjectPhotos } from "@/lib/utils/projectPhotos";
import type { BrandingProject } from "@/types/branding";
import { ImagePlus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

function MosaicUploadSlot({
  label,
  mediaId,
  selected,
  className,
  onSelect,
  onUpload,
  onClear,
}: {
  label: string;
  mediaId?: string;
  selected: boolean;
  className?: string;
  onSelect: () => void;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[1.1rem] outline-none ${
        mediaId ? "bg-surface-elevated" : "admin-upload-empty"
      } ${selected ? "ring-2 ring-[#FDD85D] ring-offset-2 ring-offset-background" : ""} ${className ?? ""}`}
    >
      {mediaId ? (
        <MediaImage mediaId={mediaId} alt={label} fit="cover" />
      ) : (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
          <ImagePlus className="text-muted" size={16} />
          <p className="text-[10px] text-muted">{label}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[2] flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 via-transparent to-transparent p-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="pointer-events-auto rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-black disabled:opacity-50"
        >
          {busy ? "…" : mediaId ? "Change" : "Upload"}
        </button>
        {mediaId ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="pointer-events-auto rounded-full bg-black/70 p-1.5 text-white"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={12} />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  );
}

export function MosaicPhotosEditor({
  mediaIds = [],
  logoMediaId,
  logoBackgroundColor,
  title,
  sourceProject,
  onChange,
}: {
  mediaIds?: string[];
  logoMediaId?: string;
  logoBackgroundColor?: string;
  title?: string;
  sourceProject: Pick<
    BrandingProject,
    | "logoMediaId"
    | "coverMediaId"
    | "mockupMediaId"
    | "coverInsetMediaId"
    | "aboutPuzzleMediaIds"
    | "gallery"
    | "galleryRows"
    | "sections"
    | "slug"
  >;
  onChange: (ids: string[]) => void;
}) {
  const ids = normalizeMosaicMediaIds(mediaIds);
  const [activeIndex, setActiveIndex] = useState(0);
  const logoBg = logoBackgroundColor || "#1c1c20";

  const library = useMemo(() => {
    const seen = new Set<string>();
    const out: { mediaId: string }[] = [];
    function add(id?: string) {
      const mediaId = id?.trim();
      if (!mediaId || seen.has(mediaId) || mediaId === logoMediaId) return;
      seen.add(mediaId);
      out.push({ mediaId });
    }
    for (const id of ids) add(id);
    for (const photo of collectProjectPhotos({
      ...sourceProject,
      mosaicMediaIds: undefined,
      logoMediaId,
    } as BrandingProject)) {
      add(photo.mediaId);
    }
    return out;
  }, [sourceProject, ids, logoMediaId]);

  async function handleUpload(index: number, file: File) {
    const asset = await uploadMedia(file);
    onChange(ids.map((id, i) => (i === index ? asset.id : id)));
  }

  function setAt(index: number, mediaId: string) {
    onChange(ids.map((id, i) => (i === index ? mediaId : id)));
  }

  function clearAt(index: number) {
    onChange(ids.map((id, i) => (i === index ? "" : id)));
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
          Mosaic (7 photos)
        </h2>
        <p className="mt-1 text-xs text-muted">
          Click a mosaic cell, then pick a photo below. The logo stays
          the project logo.
        </p>
      </div>

      <div className="grid grid-cols-7 grid-rows-2 gap-2.5">
        {MOSAIC_SLOTS.map((slot, i) => {
          if (slot.type === "logo") {
            return (
              <div
                key={`logo-${i}`}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.1rem] p-3 ${slot.className}`}
                style={{ backgroundColor: logoBg }}
              >
                {logoMediaId ? (
                  <MediaImage
                    mediaId={logoMediaId}
                    alt={`${title || "Brand"} logo`}
                    fit="contain"
                    className="max-h-[55%] max-w-[70%] opacity-95"
                  />
                ) : (
                  <p className="px-1 text-center text-[10px] text-white/50">
                    Project logo
                  </p>
                )}
              </div>
            );
          }

          return (
            <MosaicUploadSlot
              key={slot.photoIndex}
              label={`Photo ${slot.photoIndex + 1}`}
              mediaId={ids[slot.photoIndex] || undefined}
              selected={activeIndex === slot.photoIndex}
              className={slot.className}
              onSelect={() => setActiveIndex(slot.photoIndex)}
              onUpload={(file) => handleUpload(slot.photoIndex, file)}
              onClear={() => clearAt(slot.photoIndex)}
            />
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-3">
        <p className="text-[11px] text-muted">
          Photo for the highlighted cell (Photo {activeIndex + 1})
        </p>
        {library.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {library.map((photo) => {
              const inSlot = ids[activeIndex] === photo.mediaId;
              return (
                <button
                  key={photo.mediaId}
                  type="button"
                  onClick={() => setAt(activeIndex, photo.mediaId)}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl ${
                    inSlot
                      ? "ring-2 ring-[#FDD85D] ring-offset-2 ring-offset-background"
                      : "ring-1 ring-[#1a1a1a]/10 hover:ring-[#1a1a1a]/35"
                  }`}
                  aria-label="Place this photo in the selected cell"
                >
                  <MediaImage mediaId={photo.mediaId} alt="" fit="cover" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">
            No other photos in this project. Upload into a cell, or add
            photos in the gallery.
          </p>
        )}
      </div>
    </div>
  );
}
